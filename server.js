import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';
import mongoose from "mongoose";
import { connectDB, User, Category, InventoryItem, Product, Order, Stats, MenuItem, StockNotification, Customer } from "./config/database.js";
import categoryRoutes from "./routes/categoryroute.js";
import productRoutes from "./routes/productroute.js";

dotenv.config();

const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`ERROR: ${varName} not defined in .env file`);
    process.exit(1);
  }
});

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOW_STOCK_THRESHOLD = 5;

await connectDB();

const initializeDatabase = async () => {
  try {
    // Check and create admin user
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });
      console.log('✅ Admin user created');
    }
    
    // Check and create default categories
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const defaultCategories = [
        { name: 'Rice Bowl Meals' },
        { name: 'Hot Sizzlers' },
        { name: 'Party Tray' },
        { name: 'Drinks' },
        { name: 'Coffee' },
        { name: 'Milk Tea' },
        { name: 'Frappe' },
        { name: 'Snacks & Appetizer' },
        { name: 'Budget Meals Served with Rice' },
        { name: 'Specialties' }
      ];
      await Category.insertMany(defaultCategories);
    }
    
    // Check and create sample products
    const existingProducts = await Product.countDocuments();
    if (existingProducts === 0) {
      const sampleProducts = [
        {
          name: "Chicken Adobo",
          price: 120,
          category: "Rice Bowl Meals",
          stock: 50,
          image: "adobo.jpg",
          status: "available",
          description: "Classic Filipino chicken adobo"
        },
        {
          name: "Beef Tapa",
          price: 150,
          category: "Rice Bowl Meals",
          stock: 30,
          image: "tapa.jpg",
          status: "available",
          description: "Marinated beef tapa"
        }
      ];
      await Product.insertMany(sampleProducts);
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

await initializeDatabase();

// WebSocket-like functionality for admin notifications
const adminClients = new Set();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use('/images', express.static(path.join(__dirname, "images")));
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

// Middleware
const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.redirect("/login");

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.clearCookie("token");
    res.redirect("/login");
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.redirect("/staffdashboard");
  }
  next();
};

// Real-time updates for admin dashboard
app.get('/api/admin/events', verifyToken, verifyAdmin, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  res.write('data: {"type": "connected", "message": "Connected to real-time updates"}\n\n');

  const clientId = Date.now();
  const client = {
    id: clientId,
    res: res
  };
  
  adminClients.add(client);

  req.on('close', () => {
    adminClients.delete(client);
  });
});

const broadcastToAdmins = (data) => {
  if (adminClients.size === 0) {
    return;
  }
  
  const eventData = `data: ${JSON.stringify(data)}\n\n`;
  
  adminClients.forEach(client => {
    try {
      client.res.write(eventData);
      if (client.res.flush) {
        client.res.flush();
      }
    } catch (error) {
      adminClients.delete(client);
    }
  });
};

const sendOrderNotification = (order) => {
  broadcastToAdmins({
    type: 'new_order',
    data: {
      id: order._id.toString(),
      orderNumber: order.orderNumber || `ORD-${Date.now()}`,
      total: order.total || 0,
      type: order.type || 'Dine In',
      paymentMethod: order.payment?.method || 'cash',
      timestamp: new Date().toLocaleTimeString(),
      items: order.items?.length || 0,
      createdAt: order.createdAt || new Date(),
      customerId: order.customerId || null
    },
    message: `New order #${order.orderNumber} received!`
  });
};

const sendLowStockAlert = async (product) => {
  const lowStockCount = await Product.countDocuments({
    stock: { $lt: LOW_STOCK_THRESHOLD, $gte: 0 }
  });

  broadcastToAdmins({
    type: 'low_stock_alert',
    data: {
      productId: product._id,
      productName: product.name,
      currentStock: product.stock,
      lowStockCount: lowStockCount
    },
    message: `Low stock alert: ${product.name} has only ${product.stock} items left!`
  });
};

// Helper function to generate customer ID
const generateCustomerId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 10; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

// Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

// Inventory Routes
app.get("/api/inventory", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const items = await InventoryItem.find().sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.get("/api/inventory/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Inventory item not found' 
      });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.post("/api/inventory", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { 
      itemName, 
      itemType, 
      category, 
      message,
      currentStock,
      minStock,
      unit,
      price,
      isActive
    } = req.body;

    if (!itemName || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Item name and category are required' 
      });
    }

    if (itemType === 'finished' && (!price || price <= 0)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Price must be provided and greater than 0 for finished products' 
      });
    }

    const newItem = new InventoryItem({
      itemName,
      itemType: itemType || "raw",
      category,
      message: message || '',
      currentStock: currentStock || 0,
      minStock: minStock || 10,
      unit: unit || 1,
      isActive: isActive !== undefined ? isActive : true,
      price: itemType === 'finished' ? price : undefined
    });

    await newItem.save();

    // Create product if it's a finished item
    if (itemType === 'finished') {
      let product = await Product.findOne({ name: itemName });
      
      if (!product) {
        product = new Product({
          name: itemName,
          category: category,
          price: price,
          inventoryItemId: newItem._id,
          status: 'available'
        });
        await product.save();
      } else {
        product.price = price;
        product.inventoryItemId = newItem._id;
        product.stock = currentStock;
        await product.save();
      }
    }

    res.status(201).json({ 
      success: true, 
      message: 'Inventory item added successfully',
      data: newItem
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

app.put("/api/inventory/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { 
      itemName, 
      itemType, 
      category, 
      message,
      currentStock,
      minStock,
      unit,
      price,
      isActive
    } = req.body;

    if (itemType === 'finished' && (!price || price <= 0)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Price must be provided and greater than 0 for finished products' 
      });
    }

    const updatedItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { 
        itemName, 
        itemType, 
        category,
        message,
        currentStock,
        minStock,
        unit,
        isActive,
        price: itemType === 'finished' ? price : undefined,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Inventory item not found' 
      });
    }

    // Update product if it's a finished item
    if (itemType === 'finished') {
      let product = await Product.findOne({ name: itemName });
      
      if (!product) {
        product = new Product({
          name: itemName,
          category: category,
          price: price,
          inventoryItemId: updatedItem._id,
          status: 'available'
        });
        await product.save();
      } else {
        product.price = price;
        product.inventoryItemId = updatedItem._id;
        product.stock = currentStock;
        await product.save();
      }
    }

    res.json({ 
      success: true, 
      message: 'Inventory item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

app.delete("/api/inventory/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deletedItem = await InventoryItem.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Inventory item not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Inventory item deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

app.get("/api/inventory/filter/search", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { itemType, category, search } = req.query;
    let query = {};

    if (itemType && itemType !== 'all') {
      query.itemType = itemType;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.itemName = { $regex: search, $options: 'i' };
    }

    const items = await InventoryItem.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.get("/api/inventory/categories", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const categories = await InventoryItem.distinct("category");
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.post("/api/inventory/:id/restock", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { quantity, notes, price } = req.body;
    const itemId = req.params.id;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid quantity greater than 0'
      });
    }
    
    const item = await InventoryItem.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    item.currentStock += parseFloat(quantity);
    
    item.restockHistory.push({
      quantity: parseFloat(quantity),
      price: parseFloat(price || 0),
      notes: notes || '',
      addedBy: req.user.id
    });
    
    await item.save();
    
    res.json({
      success: true,
      message: 'Item restocked successfully',
      data: item
    });
  } catch (error) {
    console.error('Restock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.get("/api/inventory/stats", verifyToken, verifyAdmin, async (req, res) => {
  try {
    let totalItems = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    
    try {
      totalItems = await InventoryItem.countDocuments();
      
      const allItems = await InventoryItem.find({}).lean();
      
      for (const item of allItems) {
        if (!item) continue;
        
        const minStockValue = item.minStock || 10;
        const currentStockValue = item.currentStock || 0;
        
        if (currentStockValue === 0) {
          outOfStockCount++;
        } else if (currentStockValue > 0 && currentStockValue <= minStockValue) {
          lowStockCount++;
        }
      }
    } catch (dbError) {
      console.error('Database error in inventory stats:', dbError);
    }
    
    res.json({
      success: true,
      data: {
        totalItems: totalItems || 0,
        lowStock: lowStockCount || 0,
        outOfStock: outOfStockCount || 0
      }
    });
  } catch (error) {
    console.error('Inventory stats error:', error);
    res.json({
      success: true,
      data: {
        totalItems: 0,
        lowStock: 0,
        outOfStock: 0
      }
    });
  }
});

app.get("/api/inventory/needs-restock", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const items = await InventoryItem.find({
      $or: [
        { currentStock: 0 },
        { 
          $expr: { 
            $lte: ["$currentStock", { $ifNull: ["$minStock", 10] }]
          }
        }
      ],
      isActive: true
    }).sort({ currentStock: 1 });
    
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Error fetching items needing restock:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.get("/api/inventory/finished", verifyToken, async (req, res) => {
  try {
    const finishedProducts = await InventoryItem.find({
      itemType: 'finished',
      isActive: true
    }).sort({ itemName: 1 });
    
    res.json({
      success: true,
      data: finishedProducts
    });
  } catch (error) {
    console.error('Error fetching finished products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Dashboard stats
app.get("/api/dashboard/stats", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await InventoryItem.countDocuments({ isActive: true });
    const totalCustomers = await Customer.countDocuments();
    const totalInventoryItems = await InventoryItem.countDocuments();
    
    const totalRevenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    const inventoryLowStock = await InventoryItem.countDocuments({
      $expr: {
        $and: [
          { $gt: ["$currentStock", 0] },
          { $lte: ["$currentStock", { $ifNull: ["$minStock", 10] }] }
        ]
      },
      isActive: true
    });
    
    const inventoryOutOfStock = await InventoryItem.countDocuments({
      currentStock: 0,
      isActive: true
    });

    const totalMenuItems = await MenuItem.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        totalOrders,
        totalProducts,
        totalCustomers,
        totalRevenue,
        totalInventoryItems,
        inventoryLowStock,
        inventoryOutOfStock,
        totalMenuItems
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// Stock alerts
app.get("/api/products/low-stock", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const lowStockItems = await Product.find({
      stock: { $lt: LOW_STOCK_THRESHOLD, $gte: 0 }
    })
    .populate('category', 'name')
    .sort({ stock: 1 })
    .lean();
    
    res.json({ 
      success: true, 
      data: lowStockItems,
      count: lowStockItems.length,
      threshold: LOW_STOCK_THRESHOLD
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Static pages
const pages = ["login", "register", "order"];
pages.forEach(page => {
  app.get(`/${page.toLowerCase()}`, (req, res) => res.render(page));
});

app.get('/', (req, res) => {
  res.redirect('/login');
});

// Authentication routes
app.post("/register", async (req, res) => {
  try {
    const referer = req.headers.referer || req.headers.referrer;
    const isFormSubmission = referer && referer.includes('/admindashboard/addstaff');
    
    if (!isFormSubmission && req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Access Denied</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .toast { padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;
                     box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideInRight 0.5s ease;
                     display: flex; align-items: center; gap: 12px; }
            .toast.error { background-color: #f8d7da; color: #721c24; border-left: 4px solid #dc3545; }
            @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="toast error">
              <span>⚠️</span>
              <span>Access denied. Use admin dashboard to register staff.</span>
            </div>
          </div>
          <script>
            setTimeout(() => window.location.href = '/admindashboard', 3000);
          </script>
        </body>
        </html>
      `);
    }

    const { user, pass, role } = req.body;
    
    if (!user || !pass) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Validation Error</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .toast { padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;
                     box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideInRight 0.5s ease;
                     display: flex; align-items: center; gap: 12px; }
            .toast.error { background-color: #f8d7da; color: #721c24; border-left: 4px solid #dc3545; }
            @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="toast error">
              <span>⚠️</span>
              <span>Username and password are required</span>
            </div>
          </div>
          <script>
            setTimeout(() => history.back(), 3000);
          </script>
        </body>
        </html>
      `);
    }

    const existingUser = await User.findOne({ username: user });
    if (existingUser) {
      return res.status(409).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>User Exists</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .toast { padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;
                     box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideInRight 0.5s ease;
                     display: flex; align-items: center; gap: 12px; }
            .toast.error { background-color: #f8d7da; color: #721c24; border-left: 4px solid #dc3545; }
            @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="toast error">
              <span>⚠️</span>
              <span>User already exists</span>
            </div>
          </div>
          <script>
            setTimeout(() => history.back(), 3000);
          </script>
        </body>
        </html>
      `);
    }

    const hashedPassword = bcrypt.hashSync(pass, 10);
    const newUser = new User({ 
      username: user, 
      password: hashedPassword, 
      role: role || "staff",
      status: "active"
    });

    await newUser.save();
    
    res.status(201).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Staff Registration Success</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .toast { padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;
                   box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideInRight 0.5s ease;
                   display: flex; align-items: center; gap: 12px; }
          .toast.success { background-color: #d4edda; color: #155724; border-left: 4px solid #28a745; }
          @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="toast success">
            <span>✅</span>
            <span>Staff Successfully Registered!</span>
          </div>
        </div>
        <script>
          setTimeout(() => window.location.href = '/admindashboard/addstaff', 2500);
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Server Error</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .toast { padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;
                   box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideInRight 0.5s ease;
                   display: flex; align-items: center; gap: 12px; }
          .toast.error { background-color: #f8d7da; color: #721c24; border-left: 4px solid #dc3545; }
          @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="toast error">
            <span>❌</span>
            <span>Server error: ${err.message}</span>
          </div>
        </div>
        <script>
          setTimeout(() => history.back(), 3000);
        </script>
      </body>
      </html>
    `);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { user, pass } = req.body;

    const existingUser = await User.findOne({ username: user });
    if (!existingUser) {
      return res.render("login", {
        error: "User not found"
      });
    }

    if (existingUser.status === "inactive") {
      return res.render("login", {
        error: "Account is deactivated"
      });
    }

    const isMatch = bcrypt.compareSync(pass, existingUser.password);
    if (!isMatch) {
      return res.render("login", {
        error: "Invalid password"
      });
    }

    const token = jwt.sign(
      { 
        id: existingUser._id, 
        username: existingUser.username, 
        role: existingUser.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 365
    });

    if (existingUser.role === "admin") {
      return res.redirect("/admindashboard");
    } else {
      return res.redirect("/staffdashboard");
    }

  } catch (err) {
    res.render("login", {
      error: "Login error"
    });
  }
});

// Order routes with Customer tracking
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    if (!orderData.items || !orderData.items.length) {
      return res.status(400).json({ 
        success: false, 
        message: "No items in order" 
      });
    }
    
    if (!orderData.total || orderData.total <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Total amount is required and must be greater than 0" 
      });
    }
    
    if (!orderData.payment || !orderData.payment.amountPaid) {
      return res.status(400).json({ 
        success: false, 
        message: "Payment amount is required" 
      });
    }
    
    const amountPaid = orderData.payment.amountPaid || 0;
    const total = orderData.total || 0;
    const change = amountPaid - total;
    
    if (change < 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Insufficient payment amount" 
      });
    }
    
    if (!orderData.type) {
      orderData.type = "Dine In";
    }
    
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const orderCount = await Order.countDocuments({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      }
    });
    const orderNumber = `ORD-${dateStr}-${(orderCount + 1).toString().padStart(3, '0')}`;
    
    // Customer handling - get or create customer
    let customerId = orderData.customerId;
    let customer = null;
    
    if (customerId) {
      // Try to find existing customer
      customer = await Customer.findOne({ customerId: customerId });
    }
    
    // If no customer found or no customerId provided, create a new one
    if (!customer) {
      customerId = generateCustomerId();
      customer = new Customer({
        customerId: customerId,
        totalOrders: 1,
        totalSpent: orderData.total,
        lastOrderDate: new Date()
      });
      await customer.save();
    } else {
      // Update existing customer stats
      customer.totalOrders += 1;
      customer.totalSpent += orderData.total;
      customer.lastOrderDate = new Date();
      await customer.save();
    }
    
    const order = new Order({
      orderNumber,
      items: orderData.items.map(item => ({
        name: item.name || "Unknown Item",
        price: item.price || 0,
        quantity: item.quantity || 1,
        size: item.size || "Regular",
        image: item.image || 'default_food.jpg',
        productId: item.id || null,
        vatable: item.vatable !== undefined ? item.vatable : true
      })),
      subtotal: orderData.subtotal || 0,
      tax: orderData.tax || 0,
      total: orderData.total,
      payment: {
        method: orderData.payment?.method || "cash",
        amountPaid: amountPaid,
        change: change,
        status: "completed"
      },
      type: orderData.type,
      status: "completed",
      notes: orderData.notes || "",
      customerId: customerId
    });
    
    const savedOrder = await order.save();
    
    sendOrderNotification(savedOrder);
    
    // Update product stock
    try {
      for (const item of orderData.items) {
        if (item.id) {
          const product = await Product.findById(item.id);
          if (product && product.stock !== undefined) {
            const newStock = Math.max(0, product.stock - (item.quantity || 1));
            const updatedProduct = await Product.findByIdAndUpdate(
              item.id, 
              { stock: newStock },
              { new: true }
            );
            
            if (updatedProduct && newStock < LOW_STOCK_THRESHOLD) {
              sendLowStockAlert(updatedProduct);
            }
          }
        }
      }
    } catch (stockError) {
      console.error('Stock update error:', stockError);
    }
    
    res.json({ 
      success: true, 
      orderId: savedOrder._id,
      orderNumber: savedOrder.orderNumber,
      customerId: customerId,
      message: "Payment and order processed successfully",
      change: change
    });
    
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to save order to database"
    });
  }
});

// Customer API endpoints
app.get('/api/customers', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = {};
    if (search) {
      query.customerId = { $regex: search, $options: 'i' };
    }
    
    const customers = await Customer.find(query)
      .sort({ lastOrderDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Customer.countDocuments(query);
    
    // Get order count and total spent for each customer
    for (const customer of customers) {
      const customerOrders = await Order.find({ customerId: customer.customerId });
      customer.orderCount = customerOrders.length;
      customer.totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    }
    
    res.json({
      success: true,
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.get('/api/customers/:customerId', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const customer = await Customer.findOne({ customerId: req.params.customerId });
    
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }
    
    // Get customer's orders
    const orders = await Order.find({ customerId: req.params.customerId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    const customerData = customer.toObject();
    customerData.orders = orders;
    customerData.totalOrdersCount = orders.length;
    customerData.totalSpentAmount = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    res.json({ 
      success: true, 
      data: customerData 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Stats API
app.get('/api/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const ordersToday = await Order.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });
    
    const totalCustomers = await Customer.countDocuments();
    
    const totalRevenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    
    const totalRevenue = totalRevenueResult[0]?.total || 0;
    
    const paymentStats = await Order.aggregate([
      { $group: { _id: "$payment.method", count: { $sum: 1 } } }
    ]);
    
    const paymentStatsObj = {
      cash: 0,
      gcash: 0
    };
    
    paymentStats.forEach(stat => {
      if (stat._id && (stat._id === "cash" || stat._id === "gcash")) {
        paymentStatsObj[stat._id] = stat.count;
      }
    });
    
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    const totalProducts = await InventoryItem.countDocuments({ isActive: true });
    
    const lowStockCount = await Product.countDocuments({
      stock: { $lt: LOW_STOCK_THRESHOLD, $gte: 0 }
    });
    
    const outOfStockCount = await Product.countDocuments({
      stock: 0
    });
    
    // New customers today
    const newCustomersToday = await Customer.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });
    
    res.json({
      totalOrders,
      ordersToday,
      totalCustomers,
      newCustomersToday,
      totalProducts,
      totalRevenue,
      paymentStats: paymentStatsObj,
      recentOrders,
      lowStockCount,
      outOfStockCount
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Menu routes
app.get("/api/menu", verifyToken, async (req, res) => {
  try {
    const { category, search, status } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
    }

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await MenuItem.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// DELETE menu item by ID
app.delete("/api/menu/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Attempting to delete menu item with ID:', id);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid menu item ID format' 
      });
    }
    
    // Find and delete the menu item
    const deletedItem = await MenuItem.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }
    
    console.log('✅ Menu item deleted from MongoDB:', deletedItem.itemName);
    
    res.json({ 
      success: true, 
      message: 'Menu item deleted successfully',
      data: deletedItem
    });
    
  } catch (error) {
    console.error('❌ Error deleting menu item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting menu item',
      error: error.message 
    });
  }
});

// POST method for deleting menu items (alternative)
app.post("/api/menu/delete", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id, itemId } = req.body;
    const deleteId = id || itemId;
    
    console.log('🗑️ POST delete attempt for ID:', deleteId);
    
    if (!deleteId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Menu item ID is required' 
      });
    }
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(deleteId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid menu item ID format' 
      });
    }
    
    // Find and delete the menu item
    const deletedItem = await MenuItem.findByIdAndDelete(deleteId);
    
    if (!deletedItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }
    
    console.log('✅ Menu item deleted via POST:', deletedItem.itemName);
    
    res.json({ 
      success: true, 
      message: 'Menu item deleted successfully',
      data: deletedItem
    });
    
  } catch (error) {
    console.error('❌ Error deleting menu item via POST:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting menu item',
      error: error.message 
    });
  }
});

// PUT endpoint for updating menu items
app.put("/api/menu/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('✏️ Updating menu item with ID:', id);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid menu item ID format' 
      });
    }
    
    // Check if item exists
    const existingItem = await MenuItem.findById(id);
    if (!existingItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }
    
    // Update the menu item
    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    console.log('✅ Menu item updated:', updatedItem.itemName);
    
    res.json({ 
      success: true, 
      message: 'Menu item updated successfully',
      data: updatedItem
    });
    
  } catch (error) {
    console.error('❌ Error updating menu item:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating menu item',
      error: error.message 
    });
  }
});

app.post("/api/menu", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { itemName, price, category, unit, currentStock, minStock, maxStock, itemType, isActive } = req.body;

    if (!itemName || !price || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, price, and category' 
      });
    }

    const existingItem = await MenuItem.findOne({ 
      itemName: { $regex: new RegExp(`^${itemName}$`, 'i') } 
    });

    if (existingItem) {
      return res.status(400).json({ 
        success: false, 
        message: 'Menu item with this name already exists' 
      });
    }

    const newItem = new MenuItem({
      itemName: itemName.trim(),
      price: parseFloat(price),
      category: category,
      unit: unit || 'pcs',
      currentStock: parseInt(currentStock) || 0,
      minStock: parseInt(minStock) || 20,
      maxStock: parseInt(maxStock) || 200,
      itemType: itemType || 'finished',
      isActive: isActive !== undefined ? isActive : true
    });

    await newItem.save();

    res.status(201).json({ 
      success: true, 
      message: 'Menu item added successfully',
      data: newItem
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Dashboard routes
app.get("/admindashboard", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const products = await Product.find({}, "stock").lean();
    const totalStocks = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalOrders = await Order.countDocuments();
    
    const totalActiveMenuItemCount = await MenuItem.countDocuments({ isActive: true });
    const totalCustomers = await Customer.countDocuments();

    const totalInventoryItems = await InventoryItem.countDocuments();
    const inventoryLowStock = await InventoryItem.countDocuments({
      $expr: {
        $and: [
          { $gt: ["$currentStock", 0] },
          { $lte: ["$currentStock", { $ifNull: ["$minStock", 10] }] }
        ]
      },
      isActive: true
    });
    const inventoryOutOfStock = await InventoryItem.countDocuments({
      currentStock: 0,
      isActive: true
    });

    res.render("admindashboard", { 
      user: req.user, 
      stats: { 
        totalProducts, 
        totalStocks, 
        totalOrders, 
        totalCustomers,
        totalInventoryItems,
        inventoryLowStock,
        inventoryOutOfStock,
        totalMenuItems: totalActiveMenuItemCount
      } 
    });
  } catch (err) {
    console.error('Error in /admindashboard route:', err);
    res.render("admindashboard", { 
      user: req.user, 
      stats: { 
        totalProducts: 0, 
        totalStocks: 0, 
        totalOrders: 0, 
        totalCustomers: 0,
        totalInventoryItems: 0,
        inventoryLowStock: 0,
        inventoryOutOfStock: 0,
        totalMenuItems: 0
      } 
    });
  }
});

// Add these routes after the existing dashboard routes

app.get("/admindashboard/dashboard", verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Get stats for dashboard
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalRevenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    const inventoryLowStock = await InventoryItem.countDocuments({
      $expr: {
        $and: [
          { $gt: ["$currentStock", 0] },
          { $lte: ["$currentStock", { $ifNull: ["$minStock", 10] }] }
        ]
      },
      isActive: true
    });
    
    const inventoryOutOfStock = await InventoryItem.countDocuments({
      currentStock: 0,
      isActive: true
    });

    const totalMenuItems = await MenuItem.countDocuments({ isActive: true });

    res.render("dashboard", { 
      user: req.user,
      stats: {
        totalOrders,
        totalProducts,
        totalCustomers,
        totalRevenue,
        inventoryLowStock,
        inventoryOutOfStock,
        totalMenuItems
      }
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    // Render with default stats if there's an error
    res.render("dashboard", {
      user: req.user,
      stats: {
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        inventoryLowStock: 0,
        inventoryOutOfStock: 0,
        totalMenuItems: 0
      }
    });
  }
});

app.get("/admindashboard/Inventory", verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Get initial inventory data
    const inventoryItems = await InventoryItem.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    // Get categories for filter
    const categories = await InventoryItem.distinct("category");
    
    // Get inventory stats
    const statsResponse = await InventoryItem.aggregate([
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$currentStock", "$price"] } },
          lowStock: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ["$currentStock", 0] },
                    { $lte: ["$currentStock", { $ifNull: ["$minStock", 10] }] }
                  ]
                },
                1,
                0
              ]
            }
          },
          outOfStock: {
            $sum: {
              $cond: [
                { $eq: ["$currentStock", 0] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    const stats = statsResponse[0] || {
      totalItems: 0,
      totalValue: 0,
      lowStock: 0,
      outOfStock: 0
    };
    
    // Get items needing restock
    const needsRestock = await InventoryItem.find({
      $or: [
        { currentStock: 0 },
        { 
          $expr: { 
            $lte: ["$currentStock", { $ifNull: ["$minStock", 10] }]
          }
        }
      ],
      isActive: true
    })
    .sort({ currentStock: 1 })
    .limit(10)
    .lean();
    
    res.render("Inventory", {
      user: req.user,
      initialItems: inventoryItems,
      categories: categories || [],
      stats: {
        totalItems: stats.totalItems,
        totalValue: stats.totalValue,
        lowStock: stats.lowStock,
        outOfStock: stats.outOfStock
      },
      needsRestock: needsRestock || []
    });
  } catch (error) {
    console.error('Error loading Inventory page:', error);
    res.render("Inventory", {
      user: req.user,
      initialItems: [],
      categories: [],
      stats: {
        totalItems: 0,
        totalValue: 0,
        lowStock: 0,
        outOfStock: 0
      },
      needsRestock: []
    });
  }
});

app.get("/admindashboard/addstaff", verifyToken, verifyAdmin, (req, res) => {
  res.render("addstaff");
});

app.get("/admindashboard/salesandreports", verifyToken, verifyAdmin, (req, res) => {
  res.render("salesandreports", {
    title: "Sales & Reports"
  });
});

app.get("/admindashboard/infosettings", verifyToken, verifyAdmin, (req, res) => {
  res.render("infosettings");
});

app.get("/admindashboard/orderhistory", verifyToken, verifyAdmin, (req, res) => {
  res.render("orderhistory");
});

app.get("/admindashboard/menumanagement", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const menuItems = await MenuItem.find().sort({ createdAt: -1 }).limit(50);
    
    res.render("menumanagement", {
      user: req.user,
      initialMenuItems: menuItems
    });
  } catch (error) {
    res.render("menumanagement", {
      user: req.user,
      initialMenuItems: []
    });
  }
});

app.get("/admindashboard/stock", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const lowStockItems = await Product.find({
      stock: { $lt: LOW_STOCK_THRESHOLD, $gte: 1 }
    })
    .populate('category', 'name')
    .sort({ stock: 1 })
    .lean();
    
    const outOfStockItems = await Product.find({
      stock: 0
    })
    .populate('category', 'name')
    .sort({ name: 1 })
    .lean();
    
    res.render("stock", {
      user: req.user,
      lowStockItems,
      outOfStockItems,
      lowStockThreshold: LOW_STOCK_THRESHOLD
    });
  } catch (error) {
    res.render("stock", {
      user: req.user,
      lowStockItems: [],
      outOfStockItems: [],
      lowStockThreshold: LOW_STOCK_THRESHOLD
    });
  }
});

// Add customer management page
app.get("/admindashboard/customers", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const customers = await Customer.find()
      .sort({ lastOrderDate: -1 })
      .limit(50)
      .lean();
    
    // Get order stats for each customer
    for (const customer of customers) {
      const customerOrders = await Order.find({ customerId: customer.customerId });
      customer.orderCount = customerOrders.length;
      customer.totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    }
    
    res.render("customers", {
      user: req.user,
      customers: customers
    });
  } catch (error) {
    console.error('Error loading customers page:', error);
    res.render("customers", {
      user: req.user,
      customers: []
    });
  }
});

app.get("/staffdashboard", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== "staff") return res.redirect("/admindashboard");

    const products = await Product.find().populate("category", "name").lean();

    const categories = [
      ...new Set(products.map(p => (p.category && p.category.name) ? p.category.name : "Uncategorized"))
    ];

    const productsWithStockStatus = products.map(product => ({
      ...product,
      isLowStock: (product.stock || 0) < LOW_STOCK_THRESHOLD && (product.stock || 0) > 0,
      isOutOfStock: (product.stock || 0) === 0
    }));

    res.render("staffdashboard", {
      user: req.user,
      products: productsWithStockStatus,
      categories
    });
  } catch (err) {
    next(err);
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

// User management routes
app.get("/api/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const search = req.query.search || "";
    const query = search
      ? { username: { $regex: search, $options: "i" } }
      : {};

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/users/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/users/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const updateData = { username, role };

    if (password && password.trim() !== "") {
      updateData.password = bcrypt.hashSync(password, 10);
    }

    if (username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: req.params.id },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/users/:id/status", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: `User ${status === "active" ? "activated" : "deactivated"} successfully`,
      user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/users/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Order management routes
app.get("/api/orders", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { search, status, date, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (date) {
      const filterDate = new Date(date);
      filterDate.setHours(0, 0, 0, 0);
      const nextDate = new Date(filterDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      filter.createdAt = {
        $gte: filterDate,
        $lt: nextDate
      };
    }
    
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } },
        { 'items.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Order.countDocuments(filter);
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Add these routes after the user management routes (around line 1770-1780)

// InfoSettings API Routes
app.get("/api/infosettings/user", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Map the user data for infosettings page
    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email || '',
      fullName: user.fullName || user.username,
      phoneNumber: user.phoneNumber || '',
      role: user.role || 'Staff',
      status: user.status || 'active',
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date()
    };

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error fetching user info for settings:', error);
    res.status(500).json({
      success: false,
      message: "Failed to load user information"
    });
  }
});

app.post("/api/infosettings/update", verifyToken, async (req, res) => {
  try {
    const { fullName, email, phoneNumber } = req.body;

    // Basic validation
    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "Full name and email are required"
      });
    }

    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      email: email,
      _id: { $ne: req.user.id }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use by another account"
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber?.trim() || '',
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Format response data
    const userData = {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      fullName: updatedUser.fullName || updatedUser.username,
      phoneNumber: updatedUser.phoneNumber || '',
      role: updatedUser.role,
      status: updatedUser.status || 'active',
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    res.json({
      success: true,
      message: "Information updated successfully",
      data: userData
    });
  } catch (error) {
    console.error('Error updating user information:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update information. Please try again."
    });
  }
});

app.post("/api/infosettings/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters"
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify current password
    const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Check if new password is same as old password
    const isSamePassword = bcrypt.compareSync(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as old password"
      });
    }

    // Hash and update new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedPassword;
    user.updatedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: "Failed to change password. Please try again."
    });
  }
});

// User data endpoint (alternative endpoint for compatibility)
app.get("/api/user/data", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Format data
    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email || '',
      fullName: user.fullName || user.username,
      phoneNumber: user.phoneNumber || '',
      role: user.role || 'Staff',
      isActive: user.status === 'active',
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date()
    };

    res.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({
      success: false,
      message: "Failed to load user data"
    });
  }
});

// User update endpoint (alternative endpoint for compatibility)
app.post("/api/user/update", verifyToken, async (req, res) => {
  try {
    const { fullName, email, phoneNumber } = req.body;

    // Basic validation
    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "Full name and email are required"
      });
    }

    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Check if email is already taken
    const existingUser = await User.findOne({
      email: email,
      _id: { $ne: req.user.id }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use"
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber?.trim() || '',
        updatedAt: Date.now()
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Format response
    const userData = {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      fullName: updatedUser.fullName || updatedUser.username,
      phoneNumber: updatedUser.phoneNumber || '',
      role: updatedUser.role,
      isActive: updatedUser.status === 'active',
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    res.json({
      success: true,
      message: "User information updated",
      data: userData
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update user information"
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});