import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';
import mongoose from "mongoose";
import { connectDB, User, Category, InventoryItem, Product, Order, Stats, MenuItem } from "./config/database.js";
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
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });
    }
    
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
        },
        {
          name: "Pork Sisig",
          price: 180,
          category: "Hot Sizzlers",
          stock: 40,
          image: "sisig.jpg",
          status: "available",
          description: "Sizzling pork sisig"
        },
        {
          name: "Iced Coffee",
          price: 80,
          category: "Coffee",
          stock: 100,
          image: "iced-coffee.jpg",
          status: "available",
          description: "Fresh brewed iced coffee"
        },
        {
          name: "Milk Tea",
          price: 90,
          category: "Milk Tea",
          stock: 80,
          image: "milk-tea.jpg",
          status: "available",
          description: "Classic milk tea with pearls"
        },
        {
          name: "French Fries",
          price: 60,
          category: "Snacks & Appetizer",
          stock: 75,
          image: "fries.jpg",
          status: "available",
          description: "Crispy golden fries"
        }
      ];
      
      await Product.insertMany(sampleProducts);
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

await initializeDatabase();

const adminClients = new Set();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use('/images', express.static(path.join(__dirname, "images")));
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

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
      createdAt: order.createdAt || new Date()
    },
    message: `New order #${order.orderNumber} received!`
  });

  setTimeout(() => {
    updateStatsForAdmins();
  }, 500);
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

const updateStatsForAdmins = async () => {
  try {
    const totalOrders = await Order.countDocuments();
    const ordersToday = await Order.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });
    
    const customerStats = await Order.aggregate([
      { 
        $match: { 
          customerId: { $ne: null, $exists: true } 
        } 
      },
      { 
        $group: { 
          _id: "$customerId" 
        } 
      },
      { 
        $count: "total" 
      }
    ]);
    
    const ordersWithoutCustomerId = await Order.countDocuments({
      $or: [
        { customerId: null },
        { customerId: { $exists: false } }
      ]
    });
    
    const totalCustomers = (customerStats[0]?.total || 0) + ordersWithoutCustomerId;
    
    const totalRevenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    const lowStockCount = await Product.countDocuments({
      stock: { $lt: LOW_STOCK_THRESHOLD, $gte: 0 }
    });

    broadcastToAdmins({
      type: 'stats_update',
      data: {
        totalOrders,
        ordersToday,
        totalCustomers,
        totalRevenue,
        lowStockCount
      }
    });
  } catch (error) {
    console.error('Error updating stats for admins:', error);
  }
};

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

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

    // If it's a finished product, create/update in Product collection
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

    // If it's a finished product, create/update in Product collection
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
        product.updatedAt = Date.now();
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

// Get all finished products from inventory (for Menu Management)
app.get("/api/inventory/finished", verifyToken, verifyAdmin, async (req, res) => {
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

app.get("/api/dashboard/stats", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    
    const totalProducts = await InventoryItem.countDocuments({ isActive: true });

    const totalCustomers = totalOrders;

    const totalRevenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

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

    res.json({
      success: true,
      data: {
        totalOrders,
        totalProducts,
        totalCustomers,
        totalRevenue,
        totalInventoryItems,
        inventoryLowStock,
        inventoryOutOfStock
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

app.get("/api/products/critical-stock", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const criticalStockItems = await Product.find({
      stock: { $lt: 5, $gte: 0 }
    })
    .populate('category', 'name')
    .sort({ stock: 1 })
    .lean();
    
    res.json({ 
      success: true, 
      data: criticalStockItems,
      count: criticalStockItems.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

const pages = ["login", "register", "order"];
pages.forEach(page => {
  app.get(`/${page.toLowerCase()}`, (req, res) => res.render(page));
});

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.post("/register", async (req, res) => {
  try {
    // Check referer for form submissions (from addstaff page)
    const referer = req.headers.referer || req.headers.referrer;
    const isFormSubmission = referer && referer.includes('/admindashboard/addstaff');
    
    // For form submissions via traditional form, check referer
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
      // Return JSON for AJAX requests
      if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username and password are required' 
        });
      }
      
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
      // Return JSON for AJAX requests
      if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        return res.status(409).json({ 
          success: false, 
          message: 'User already exists' 
        });
      }
      
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
    
    // Return JSON for AJAX requests
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      return res.status(201).json({ 
        success: true, 
        message: 'Staff Successfully Registered!',
        data: {
          username: newUser.username,
          role: newUser.role
        }
      });
    }
    
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
    // Return JSON for AJAX requests
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      return res.status(500).json({ 
        success: false, 
        message: err.message || 'Server error' 
      });
    }
    
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
    
    const paymentMethod = orderData.payment?.method || "cash";
    
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const orderCount = await Order.countDocuments({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      }
    });
    const orderNumber = `ORD-${dateStr}-${(orderCount + 1).toString().padStart(3, '0')}`;
    
    const customerId = orderData.sessionId ? 
      new mongoose.Types.ObjectId(orderData.sessionId) : 
      null;
    
    const order = new Order({
      orderNumber,
      items: orderData.items.map(item => ({
        name: item.name || "Unknown Item",
        price: item.price || 0,
        quantity: item.quantity || 1,
        size: item.size || "Regular",
        image: item.image || 'default_food.jpg',
        productId: item.id || null
      })),
      subtotal: orderData.subtotal || 0,
      tax: orderData.tax || 0,
      total: orderData.total,
      payment: {
        method: paymentMethod,
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
    
    try {
      for (const item of orderData.items) {
        if (item.id) {
          // Update Product stock
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
        
        // Also update InventoryItem (finished product) stock if name matches
        if (item.name) {
          const inventoryItem = await InventoryItem.findOne({
            itemName: { $regex: new RegExp(`^${item.name}$`, 'i') },
            itemType: 'finished'
          });
          
          if (inventoryItem) {
            const newStock = Math.max(0, inventoryItem.currentStock - (item.quantity || 1));
            await InventoryItem.findByIdAndUpdate(
              inventoryItem._id,
              { currentStock: newStock },
              { new: true }
            );
            console.log(`Updated inventory for ${item.name}: ${inventoryItem.currentStock} -> ${newStock}`);
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

app.get('/api/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const ordersToday = await Order.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });
    
    const customerStats = await Order.aggregate([
      { 
        $match: { 
          customerId: { $ne: null, $exists: true } 
        } 
      },
      { 
        $group: { 
          _id: "$customerId" 
        } 
      },
      { 
        $count: "total" 
      }
    ]);
    
    const ordersWithoutCustomerId = await Order.countDocuments({
      $or: [
        { customerId: null },
        { customerId: { $exists: false } }
      ]
    });
    
    const totalCustomers = (customerStats[0]?.total || 0) + ordersWithoutCustomerId;
    
    const totalRevenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    
    const totalRevenue = totalRevenueResult[0]?.total || 0;
    
    const paymentStats = await Order.aggregate([
      { $group: { _id: "$payment.method", count: { $sum: 1 } } }
    ]);
    
    const paymentStatsObj = {
      cash: 0,
      wallet: 0
    };
    
    paymentStats.forEach(stat => {
      if (stat._id && (stat._id === "cash" || stat._id === "wallet")) {
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
    
    res.json({
      totalOrders,
      ordersToday,
      totalCustomers,
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

app.get("/api/menu", verifyToken, async (req, res) => {
  try {
    const { category, search, status } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const items = await MenuItem.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

app.get("/api/menu/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

app.post("/api/menu", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, price, category } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, price, and category' 
      });
    }

    const existingItem = await MenuItem.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingItem) {
      return res.status(400).json({ 
        success: false, 
        message: 'Menu item with this name already exists' 
      });
    }

    const newItem = new MenuItem({
      name,
      price: parseFloat(price),
      category,
      status: 'available'
    });

    await newItem.save();

    res.status(201).json({ 
      success: true, 
      message: 'Menu item added successfully',
      data: newItem
    });
  } catch (error) {
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

app.put("/api/menu/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, price, category, status } = req.body;

    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        price: parseFloat(price), 
        category,
        status,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Menu item updated successfully',
      data: updatedItem
    });
  } catch (error) {
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

app.delete("/api/menu/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Menu item deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

app.get("/api/menu/categories/all", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const categories = [
      'Rice Meals',
      'Sizzling',
      'Drinks',
      'Party Tray',
      'Coffee',
      'Milk Tea',
      'Snacks',
      'Budget Meal',
      'Desserts',
      'Specialities',
      'Frape'
    ];
    
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

app.get("/api/all-products", async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .lean();
    
    const formattedProducts = products.map(product => ({
      id: product._id,
      name: product.name,
      price: product.price,
      category: product.category ? product.category.name : 'Uncategorized',
      stock: product.stock || 0,
      image: product.image || 'default_food.jpg',
      isLowStock: (product.stock || 0) < LOW_STOCK_THRESHOLD && (product.stock || 0) > 0,
      isOutOfStock: (product.stock || 0) === 0
    }));
    
    res.json(formattedProducts);
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
});

app.post('/api/products/:id/image', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { image } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      id,
      { image },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
});

app.get("/admindashboard", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const products = await Product.find({}, "stock").lean();
    const totalStocks = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalOrders = await Order.countDocuments();
    
    const customerStats = await Order.aggregate([
      { 
        $match: { 
          customerId: { $ne: null, $exists: true } 
        } 
      },
      { 
        $group: { 
          _id: "$customerId" 
        } 
      },
      { 
        $count: "total" 
      }
    ]);
    
    const ordersWithoutCustomerId = await Order.countDocuments({
      $or: [
        { customerId: null },
        { customerId: { $exists: false } }
      ]
    });
    
    const totalCustomers = (customerStats[0]?.total || 0) + ordersWithoutCustomerId;

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
        inventoryOutOfStock
      } 
    });
  } catch (err) {
    res.render("admindashboard", { 
      user: req.user, 
      stats: { 
        totalProducts: 0, 
        totalStocks: 0, 
        totalOrders: 0, 
        totalCustomers: 0,
        totalInventoryItems: 0,
        inventoryLowStock: 0,
        inventoryOutOfStock: 0
      } 
    });
  }
});

app.get("/admindashboard/dashboard", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await InventoryItem.countDocuments({ isActive: true });

    const totalCustomers = totalOrders;

    const totalRevenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

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

    res.render("dashboard", {
      stats: {
        totalOrders,
        totalProducts,
        totalCustomers,
        totalRevenue,
        totalInventoryItems,
        inventoryLowStock,
        inventoryOutOfStock
      }
    });
  } catch (err) {
    res.render("dashboard", {
      stats: {
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        totalInventoryItems: 0,
        inventoryLowStock: 0,
        inventoryOutOfStock: 0
      }
    });
  }
});

app.get("/admindashboard/inventory", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalItems = await InventoryItem.countDocuments();
    const lowStockCount = await InventoryItem.countDocuments({
      $expr: {
        $and: [
          { $gt: ["$currentStock", 0] },
          { $lte: ["$currentStock", { $ifNull: ["$minStock", 10] }] }
        ]
      },
      isActive: true
    });
    const outOfStockCount = await InventoryItem.countDocuments({
      currentStock: 0,
      isActive: true
    });
    
    res.render("Inventory", {
      stats: {
        totalItems,
        lowStockCount,
        outOfStockCount
      }
    });
  } catch (error) {
    res.render("Inventory", {
      stats: {
        totalItems: 0,
        lowStockCount: 0,
        outOfStockCount: 0
      }
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

app.get("/api/pos/menu", async (req, res) => {
  try {
    const products = await Product.find({ 
      status: { $ne: 'unavailable' } 
    })
    .populate('category', 'name')
    .lean();
    
    const formattedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      category: product.category ? product.category.name : 'Uncategorized',
      image: product.image || 'default_food.jpg',
      stock: product.stock || 100,
      unit: 'pcs',
      vatable: true
    }));
    
    res.json({ 
      success: true, 
      data: formattedProducts 
    });
  } catch (error) {
    console.error('POS menu error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to load menu items' 
    });
  }
});

app.post('/api/pos/orders', async (req, res) => {
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
    
    const amountPaid = orderData.payment?.amountPaid || orderData.total;
    const total = orderData.total || 0;
    const change = amountPaid - total;
    
    if (change < 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Insufficient payment amount" 
      });
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
    
    const order = new Order({
      orderNumber,
      items: orderData.items.map(item => ({
        name: item.name || "Unknown Item",
        price: item.price || 0,
        quantity: item.quantity || 1,
        size: item.size || "Regular",
        image: item.image || 'default_food.jpg',
        productId: item.id || null
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
      type: orderData.type || "Dine In",
      status: "completed",
      notes: orderData.notes || ""
    });
    
    const savedOrder = await order.save();
    
    sendOrderNotification(savedOrder);
    
    try {
      for (const item of orderData.items) {
        if (item.id) {
          const product = await Product.findById(item.id);
          if (product && product.stock !== undefined) {
            const newStock = Math.max(0, product.stock - (item.quantity || 1));
            await Product.findByIdAndUpdate(
              item.id, 
              { stock: newStock }
            );
            
            if (newStock < LOW_STOCK_THRESHOLD) {
              const updatedProduct = await Product.findById(item.id);
              if (updatedProduct) {
                sendLowStockAlert(updatedProduct);
              }
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
      message: "Payment and order processed successfully",
      change: change
    });
    
  } catch (error) {
    console.error('POS order creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to save order to database"
    });
  }
});

app.post("/printreceipt", async (req, res, next) => {
  try {
    const { cart, orderType, payment } = req.body;
    if (!cart || !cart.length) return res.status(400).json({ error: "Empty cart" });

    const receiptData = {
      receiptId: Date.now(),
      cart,
      orderType,
      payment,
      subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      tax: 0,
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      date: new Date().toLocaleString()
    };
    
    res.json(receiptData);
  } catch (err) {
    next(err);
  }
});

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

app.post("/api/users/create", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      role: role || "staff",
      status: "active",
    });

    await newUser.save();

    const userData = newUser.toObject();
    delete userData.password;

    res.status(201).json({
      message: "User created successfully",
      user: userData,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/orders", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { search, status, date, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    
    // Apply status filter
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Apply date filter
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
    
    // Apply search filter
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
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

app.put("/api/products/:id/stock", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: parseInt(stock) },
      { new: true }
    ).populate('category', 'name');
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (product.stock < LOW_STOCK_THRESHOLD) {
      sendLowStockAlert(product);
    }
    
    res.json({ 
      success: true, 
      product,
      isLowStock: product.stock < LOW_STOCK_THRESHOLD
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
});

app.post("/api/products/bulk-stock-update", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ error: 'Updates array is required' });
    }
    
    const results = [];
    
    for (const update of updates) {
      if (update.productId && update.stock !== undefined) {
        const product = await Product.findByIdAndUpdate(
          update.productId,
          { stock: parseInt(update.stock) },
          { new: true }
        );
        
        if (product) {
          results.push({
            productId: update.productId,
            success: true,
            stock: product.stock,
            isLowStock: product.stock < LOW_STOCK_THRESHOLD
          });
          
          if (product.stock < LOW_STOCK_THRESHOLD) {
            sendLowStockAlert(product);
          }
        } else {
          results.push({
            productId: update.productId,
            success: false,
            error: 'Product not found'
          });
        }
      }
    }
    
    res.json({ 
      success: true, 
      results,
      message: `Updated ${results.filter(r => r.success).length} products`
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
});

app.use((req, res) => {
  if (req.accepts('html')) {
    res.redirect('/login');
  } else if (req.accepts('json')) {
    res.status(404).json({ error: 'Not found' });
  } else {
    res.status(404).type('txt').send('Not found');
  }
});

app.use((err, req, res, next) => {
  if (req.accepts('html')) {
    res.redirect('/login');
  } else if (req.accepts('json')) {
    res.status(500).json({ error: 'Server error' });
  } else {
    res.status(500).type('txt').send('Server error');
  }
});

const PORT = process.env.PORT || 5050;

// ===========================
// USER PROFILE & SETTINGS API
// ===========================

// Get user profile
app.get("/api/user/profile", async (req, res) => {
  try {
    // Get user from session or token
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const User = require('./models/User');
    const user = await User.findById(req.session.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      userId: user._id,
      username: user.user || user.username,
      email: user.email || '',
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      accountCreated: user.createdAt
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// Update user profile
app.post("/api/user/profile/update", async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { fullName, email, phoneNumber } = req.body;

    // Validate email
    if (email && !email.includes('@')) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const User = require('./models/User');
    const user = await User.findByIdAndUpdate(
      req.session.userId,
      {
        fullName: fullName || '',
        email: email || '',
        phoneNumber: phoneNumber || ''
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        userId: user._id,
        username: user.user || user.username,
        email: user.email || '',
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// Change password
app.post("/api/user/change-password", async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const User = require('./models/User');
    const bcrypt = require('bcrypt');
    
    const user = await User.findById(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Check if new password is same as current
    const samePassword = await bcrypt.compare(newPassword, user.password);
    if (samePassword) {
      return res.status(400).json({ message: "New password must be different from current password" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Invalidate current session (old password can no longer be used)
    // Destroy the session to force re-login with new password
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
    });

    res.json({
      success: true,
      message: "Password changed successfully. Old password is now invalid. Please log in with your new password."
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: "Error changing password" });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please use a different port.`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    process.exit(0);
  });
});