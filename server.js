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

// ==================== RECIPE MAPPING SYSTEM ====================
// Maps raw ingredients to finished products
const recipeMapping = {
  // Chicken-based dishes
  'Chicken': ['Chicken Adobo', 'Chicken Curry', 'Chicken Tinola', 'Fried Chicken'],
  
  // Pork-based dishes
  'Pork slices': ['Pork Adobo', 'Pork Sinigang'],
  'Pork belly': ['Lechon Kawali', 'Pork Belly'],
  'Ground pork': ['Pork Burger', 'Pork Meatballs'],
  
  // Beef-based dishes
  'Beef shanks and marrow': ['Beef Bulalo', 'Beef Stew'],
  
  // Seafood dishes
  'Cream dory fillet': ['Fried Fish', 'Fish Fillet'],
  'Shrimp': ['Shrimp Scampi', 'Garlic Shrimp'],
  
  // Vegetables
  'Cabbage': ['Pork Sinigang', 'Chicken Tinola'],
  'Carrots': ['Beef Stew', 'Chicken Curry'],
  'Potato strips': ['Beef Stew', 'Chicken Curry'],
  
  // Dairy
  'Butter': ['Garlic Shrimp', 'Prawns'],
  'Cheese': ['Cheese Burger', 'Cheese Sandwich'],
  'Milk': ['Milkshakes', 'Coffee Drinks'],
  
  // Basic ingredients used in many dishes
  'Garlic': ['Chicken Adobo', 'Pork Adobo', 'Garlic Shrimp', 'Beef Stew'],
  'Onion': ['Chicken Adobo', 'Pork Adobo', 'Beef Stew', 'Chicken Curry'],
  'Soy sauce': ['Chicken Adobo', 'Pork Adobo'],
  'Cooking oil': ['Fried Chicken', 'Lechon Kawali', 'Fried Fish']
};

// Reverse mapping for quick lookup
const reverseRecipeMapping = {};
for (const [ingredient, dishes] of Object.entries(recipeMapping)) {
  for (const dish of dishes) {
    if (!reverseRecipeMapping[dish]) {
      reverseRecipeMapping[dish] = [];
    }
    reverseRecipeMapping[dish].push(ingredient);
  }
}

// Item name mapping system
const itemNameMapping = new Map();

const initializeItemNameMapping = async () => {
  try {
    console.log('🔄 Initializing item name mapping system...');
    
    itemNameMapping.clear();
    
    // 1. Map finished inventory items to products
    const finishedInventoryItems = await InventoryItem.find({ 
      itemType: 'finished',
      isActive: true 
    });
    
    console.log(`📦 Found ${finishedInventoryItems.length} finished inventory items`);
    
    for (const item of finishedInventoryItems) {
      try {
        // Find product by name (case-insensitive)
        const product = await Product.findOne({ 
          name: { $regex: new RegExp(`^${item.itemName}$`, 'i') } 
        });
        
        if (product) {
          itemNameMapping.set(item.itemName.toLowerCase(), {
            inventoryItemId: item._id,
            productId: product._id,
            inventoryItemName: item.itemName,
            productName: product.name,
            inventoryStock: item.currentStock || 0,
            productStock: product.stock || 0,
            lastSynced: new Date(),
            isSynced: item.currentStock === product.stock
          });
          
          console.log(`   ✅ Mapped: "${item.itemName}" (Inventory) -> "${product.name}" (Product)`);
          
          // Auto-sync if different
          if (item.currentStock !== product.stock) {
            console.log(`   🔄 Auto-syncing: ${item.itemName} (Inv: ${item.currentStock} → Prod: ${product.stock})`);
            product.stock = item.currentStock;
            product.status = item.currentStock > 0 ? 'available' : 'out_of_stock';
            await product.save();
          }
        }
      } catch (err) {
        console.error(`   ❌ Error mapping "${item.itemName}":`, err.message);
      }
    }
    
    // 2. Map products to inventory items (reverse mapping)
    const products = await Product.find({});
    
    console.log(`🛒 Found ${products.length} products`);
    
    for (const product of products) {
      try {
        const normalizedName = product.name.toLowerCase();
        
        // Skip if already mapped
        if (itemNameMapping.has(normalizedName)) continue;
        
        // Find matching finished inventory item
        let inventoryItem = await InventoryItem.findOne({
          itemName: { $regex: new RegExp(`^${product.name}$`, 'i') },
          itemType: 'finished',
          isActive: true
        });
        
        if (inventoryItem) {
          itemNameMapping.set(normalizedName, {
            inventoryItemId: inventoryItem._id,
            productId: product._id,
            inventoryItemName: inventoryItem.itemName,
            productName: product.name,
            inventoryStock: inventoryItem.currentStock || 0,
            productStock: product.stock || 0,
            lastSynced: new Date(),
            isSynced: inventoryItem.currentStock === product.stock
          });
          
          console.log(`   ✅ Reverse mapped: "${product.name}" (Product) -> "${inventoryItem.itemName}" (Inventory)`);
          
          // Auto-sync
          if (product.stock !== inventoryItem.currentStock) {
            console.log(`   🔄 Auto-syncing: ${product.name} (Prod: ${product.stock} → Inv: ${inventoryItem.currentStock})`);
            inventoryItem.currentStock = product.stock;
            await inventoryItem.save();
          }
        }
      } catch (err) {
        console.error(`   ❌ Error reverse mapping "${product.name}":`, err.message);
      }
    }
    
    console.log(`📊 Item name mapping initialized: ${itemNameMapping.size} mappings`);
    
    // Log summary
    let syncedCount = 0;
    let outOfSyncCount = 0;
    
    for (const [name, data] of itemNameMapping.entries()) {
      if (data.inventoryStock === data.productStock) {
        syncedCount++;
      } else {
        outOfSyncCount++;
        console.log(`   ⚠️ Out of sync: "${name}" - Inventory: ${data.inventoryStock}, Product: ${data.productStock}`);
      }
    }
    
    console.log(`📈 Sync status: ${syncedCount} in sync, ${outOfSyncCount} out of sync`);
    
  } catch (error) {
    console.error('❌ Error initializing item name mapping:', error);
  }
};

// Check if a finished product can be made from available raw ingredients
const checkProductAvailability = async (productName) => {
  try {
    const requiredIngredients = reverseRecipeMapping[productName];
    if (!requiredIngredients || requiredIngredients.length === 0) {
      console.log(`⚠️ No recipe found for: ${productName}`);
      return { available: true, reason: 'No recipe constraints' };
    }
    
    console.log(`🔍 Checking availability for: ${productName}`);
    console.log(`   Required ingredients: ${requiredIngredients.join(', ')}`);
    
    let allAvailable = true;
    const missingIngredients = [];
    
    for (const ingredient of requiredIngredients) {
      const inventoryItem = await InventoryItem.findOne({
        itemName: { $regex: new RegExp(`^${ingredient}$`, 'i') },
        itemType: 'raw',
        isActive: true
      });
      
      if (!inventoryItem) {
        allAvailable = false;
        missingIngredients.push(`${ingredient} (not found in inventory)`);
      } else if (inventoryItem.currentStock <= 0) {
        allAvailable = false;
        missingIngredients.push(`${ingredient} (out of stock)`);
      } else if (inventoryItem.currentStock < (inventoryItem.minStock || 10)) {
        console.log(`   ⚠️ Low stock: ${ingredient} (${inventoryItem.currentStock} left)`);
      }
    }
    
    return {
      available: allAvailable,
      missingIngredients,
      requiredIngredients
    };
  } catch (error) {
    console.error('Error checking product availability:', error);
    return { available: false, error: error.message };
  }
};

// Auto-create finished product from recipe
const autoCreateFinishedProduct = async (rawIngredientName) => {
  try {
    const possibleDishes = recipeMapping[rawIngredientName];
    if (!possibleDishes || possibleDishes.length === 0) {
      console.log(`📝 No recipe uses: ${rawIngredientName}`);
      return;
    }
    
    console.log(`🍳 Raw ingredient "${rawIngredientName}" can make: ${possibleDishes.join(', ')}`);
    
    for (const dish of possibleDishes) {
      // Check if this dish already exists as a finished product
      let finishedItem = await InventoryItem.findOne({
        itemName: { $regex: new RegExp(`^${dish}$`, 'i') },
        itemType: 'finished'
      });
      
      let product = await Product.findOne({
        name: { $regex: new RegExp(`^${dish}$`, 'i') }
      });
      
      if (!finishedItem) {
        // Create finished inventory item
        finishedItem = new InventoryItem({
          itemName: dish,
          itemType: 'finished',
          category: 'Rice Bowl Meals', // Default category
          currentStock: 0,
          minStock: 10,
          maxStock: 50,
          unit: 'servings',
          isActive: true
        });
        
        await finishedItem.save();
        console.log(`✅ Created finished inventory item: ${dish}`);
      }
      
      if (!product) {
        // Create product
        const price = 120; // Default price
        product = new Product({
          name: dish,
          price: price,
          category: 'Rice Bowl Meals',
          stock: finishedItem.currentStock || 0,
          image: 'default_food.jpg',
          status: finishedItem.currentStock > 0 ? 'available' : 'out_of_stock',
          inventoryItemId: finishedItem._id
        });
        
        await product.save();
        console.log(`✅ Created product: ${dish} (Price: ${price})`);
      }
      
      // Create mapping
      itemNameMapping.set(dish.toLowerCase(), {
        inventoryItemId: finishedItem._id,
        productId: product._id,
        inventoryItemName: finishedItem.itemName,
        productName: product.name,
        inventoryStock: finishedItem.currentStock || 0,
        productStock: product.stock || 0,
        lastSynced: new Date(),
        isSynced: finishedItem.currentStock === product.stock
      });
      
      console.log(`🔗 Mapped: ${dish} (Inventory ↔ Product)`);
    }
  } catch (error) {
    console.error('Error auto-creating finished product:', error);
  }
};

// Sync inventory and product stocks
const syncItemStocks = async (itemName, forceInventoryAsSource = true) => {
  try {
    const normalizedName = itemName.toLowerCase();
    const mapping = itemNameMapping.get(normalizedName);
    
    if (!mapping) {
      console.log(`⚠️ No mapping found for item: "${itemName}"`);
      return { success: false, message: 'No mapping found' };
    }
    
    const inventoryItem = await InventoryItem.findById(mapping.inventoryItemId);
    const product = await Product.findById(mapping.productId);
    
    if (!inventoryItem || !product) {
      console.log(`❌ Missing item: Inventory=${!!inventoryItem}, Product=${!!product}`);
      return { success: false, message: 'Item not found' };
    }
    
    console.log(`🔄 Syncing "${itemName}": Inventory=${inventoryItem.currentStock}, Product=${product.stock}`);
    
    let updated = false;
    
    if (forceInventoryAsSource) {
      // Inventory → Product
      if (product.stock !== inventoryItem.currentStock) {
        const oldStock = product.stock;
        product.stock = inventoryItem.currentStock;
        product.status = inventoryItem.currentStock > 0 ? 'available' : 'out_of_stock';
        product.updatedAt = new Date();
        await product.save();
        
        // Update mapping
        itemNameMapping.set(normalizedName, {
          ...mapping,
          productStock: product.stock,
          lastSynced: new Date(),
          isSynced: true
        });
        
        console.log(`   ✅ Updated product stock: ${oldStock} → ${product.stock}`);
        
        // Send notification if product status changed
        if (oldStock === 0 && product.stock > 0) {
          console.log(`🎉 "${itemName}" is now AVAILABLE in POS!`);
          broadcastToAdmins({
            type: 'back_in_stock',
            data: {
              productId: product._id,
              productName: product.name,
              currentStock: product.stock
            },
            message: `${product.name} is now available!`
          });
        }
        
        updated = true;
      }
    } else {
      // Product → Inventory
      if (inventoryItem.currentStock !== product.stock) {
        const oldStock = inventoryItem.currentStock;
        inventoryItem.currentStock = product.stock;
        inventoryItem.updatedAt = new Date();
        await inventoryItem.save();
        
        // Update mapping
        itemNameMapping.set(normalizedName, {
          ...mapping,
          inventoryStock: inventoryItem.currentStock,
          lastSynced: new Date(),
          isSynced: true
        });
        
        console.log(`   ✅ Updated inventory stock: ${oldStock} → ${inventoryItem.currentStock}`);
        updated = true;
      }
    }
    
    return { success: true, updated, inventoryItem, product };
  } catch (error) {
    console.error(`❌ Error syncing stocks for "${itemName}":`, error);
    return { success: false, error: error.message };
  }
};

// Create or update product from inventory item
const updateProductFromInventory = async (inventoryItem) => {
  try {
    if (inventoryItem.itemType !== 'finished') return null;
    
    console.log(`📦 Creating/updating product from inventory: "${inventoryItem.itemName}"`);
    
    // Check availability if it's a recipe-based product
    const availability = await checkProductAvailability(inventoryItem.itemName);
    
    let product = await Product.findOne({ 
      name: { $regex: new RegExp(`^${inventoryItem.itemName}$`, 'i') } 
    });
    
    if (product) {
      // Update existing product
      const oldStock = product.stock;
      product.stock = inventoryItem.currentStock || 0;
      product.price = inventoryItem.price || product.price || 120;
      product.category = inventoryItem.category || product.category;
      product.status = inventoryItem.currentStock > 0 ? 'available' : 'out_of_stock';
      product.inventoryItemId = inventoryItem._id;
      product.updatedAt = new Date();
      
      await product.save();
      
      // Check if status changed
      if (oldStock === 0 && product.stock > 0) {
        console.log(`🎉 "${product.name}" is now AVAILABLE (was out of stock)`);
      }
      
      console.log(`   ✅ Updated existing product: "${product.name}" (Stock: ${product.stock}, Status: ${product.status})`);
    } else {
      // Create new product
      const price = inventoryItem.price || 120;
      product = new Product({
        name: inventoryItem.itemName,
        price: price,
        category: inventoryItem.category || 'Rice Bowl Meals',
        stock: inventoryItem.currentStock || 0,
        image: 'default_food.jpg',
        status: inventoryItem.currentStock > 0 ? 'available' : 'out_of_stock',
        inventoryItemId: inventoryItem._id,
        description: inventoryItem.message || `Inventory item: ${inventoryItem.itemName}`
      });
      
      await product.save();
      console.log(`   ✅ Created new product: "${product.name}" (Stock: ${product.stock}, Price: ${price})`);
    }
    
    // Update mapping
    itemNameMapping.set(inventoryItem.itemName.toLowerCase(), {
      inventoryItemId: inventoryItem._id,
      productId: product._id,
      inventoryItemName: inventoryItem.itemName,
      productName: product.name,
      inventoryStock: inventoryItem.currentStock,
      productStock: product.stock,
      lastSynced: new Date(),
      isSynced: inventoryItem.currentStock === product.stock
    });
    
    return product;
  } catch (error) {
    console.error(`❌ Error updating product from inventory:`, error);
    return null;
  }
};

// Update inventory from product
const updateInventoryFromProduct = async (product) => {
  try {
    console.log(`🔄 Updating inventory from product: "${product.name}"`);
    
    // Find matching finished inventory item
    let inventoryItem = await InventoryItem.findOne({
      itemName: { $regex: new RegExp(`^${product.name}$`, 'i') },
      itemType: 'finished'
    });
    
    if (!inventoryItem) {
      console.log(`   ⚠️ No finished inventory item found for product: "${product.name}"`);
      
      // Check if this is a recipe-based product
      const requiredIngredients = reverseRecipeMapping[product.name];
      if (requiredIngredients && requiredIngredients.length > 0) {
        console.log(`   📝 Creating finished item for recipe: ${product.name}`);
        
        inventoryItem = new InventoryItem({
          itemName: product.name,
          itemType: 'finished',
          category: product.category || 'Rice Bowl Meals',
          currentStock: product.stock,
          minStock: 10,
          maxStock: 50,
          unit: 'servings',
          isActive: true
        });
        
        await inventoryItem.save();
        console.log(`   ✅ Created finished inventory item: ${product.name}`);
      } else {
        return null;
      }
    }
    
    // Update inventory stock
    const oldStock = inventoryItem.currentStock;
    inventoryItem.currentStock = product.stock;
    inventoryItem.updatedAt = new Date();
    
    await inventoryItem.save();
    console.log(`   ✅ Updated inventory stock: "${inventoryItem.itemName}" ${oldStock} → ${inventoryItem.currentStock}`);
    
    // Update mapping
    itemNameMapping.set(product.name.toLowerCase(), {
      inventoryItemId: inventoryItem._id,
      productId: product._id,
      inventoryItemName: inventoryItem.itemName,
      productName: product.name,
      inventoryStock: inventoryItem.currentStock,
      productStock: product.stock,
      lastSynced: new Date(),
      isSynced: inventoryItem.currentStock === product.stock
    });
    
    return inventoryItem;
  } catch (error) {
    console.error(`❌ Error updating inventory from product:`, error);
    return null;
  }
};

// When raw ingredient is restocked, update related finished products
const updateRelatedFinishedProducts = async (rawIngredientName) => {
  try {
    const possibleDishes = recipeMapping[rawIngredientName];
    if (!possibleDishes || possibleDishes.length === 0) return;
    
    console.log(`🔧 Raw ingredient "${rawIngredientName}" restocked. Checking related dishes...`);
    
    for (const dish of possibleDishes) {
      // Check if this dish exists as a finished product
      const dishInventoryItem = await InventoryItem.findOne({
        itemName: { $regex: new RegExp(`^${dish}$`, 'i') },
        itemType: 'finished',
        isActive: true
      });
      
      if (dishInventoryItem) {
        // Check if all ingredients are now available
        const availability = await checkProductAvailability(dish);
        
        if (availability.available && dishInventoryItem.currentStock === 0) {
          // Update stock based on raw ingredient availability
          // Simple logic: if all ingredients are available, set stock to 10
          dishInventoryItem.currentStock = 10;
          await dishInventoryItem.save();
          
          // Update corresponding product
          await syncItemStocks(dish, true);
          
          console.log(`   ✅ Dish "${dish}" now available (stock: 10)`);
        }
      }
    }
  } catch (error) {
    console.error('Error updating related finished products:', error);
  }
};

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
        },
        {
          name: "Chicken Curry",
          price: 130,
          category: "Rice Bowl Meals",
          stock: 25,
          image: "curry.jpg",
          status: "available",
          description: "Creamy chicken curry"
        },
        {
          name: "Pork Adobo",
          price: 125,
          category: "Rice Bowl Meals",
          stock: 20,
          image: "pork_adobo.jpg",
          status: "available",
          description: "Traditional pork adobo"
        },
        {
          name: "Beef Bulalo",
          price: 180,
          category: "Specialties",
          stock: 15,
          image: "bulalo.jpg",
          status: "available",
          description: "Beef marrow stew"
        }
      ];
      await Product.insertMany(sampleProducts);
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

await initializeDatabase();
await initializeItemNameMapping();

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

// ==================== INVENTORY ROUTES ====================

// Get inventory items with product mapping info
app.get("/api/inventory", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const items = await InventoryItem.find().sort({ createdAt: -1 });
    
    // Add product mapping info to each item
    const itemsWithMapping = await Promise.all(items.map(async (item) => {
      const itemObj = item.toObject();
      const normalizedName = item.itemName.toLowerCase();
      
      if (itemNameMapping.has(normalizedName)) {
        const mapping = itemNameMapping.get(normalizedName);
        const product = await Product.findById(mapping.productId);
        itemObj.mappedProduct = {
          exists: !!product,
          productId: mapping.productId,
          productName: mapping.productName,
          productStock: mapping.productStock,
          syncStatus: mapping.isSynced ? 'synced' : 'out_of_sync',
          lastSynced: mapping.lastSynced
        };
      } else {
        itemObj.mappedProduct = { exists: false };
        
        // Check if this raw ingredient can make finished products
        if (item.itemType === 'raw' && recipeMapping[item.itemName]) {
          itemObj.canMake = recipeMapping[item.itemName];
        }
      }
      
      return itemObj;
    }));
    
    res.json({ success: true, data: itemsWithMapping });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get single inventory item
app.get("/api/inventory/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Inventory item not found' 
      });
    }

    const itemObj = item.toObject();
    const normalizedName = item.itemName.toLowerCase();
    
    if (itemNameMapping.has(normalizedName)) {
      const mapping = itemNameMapping.get(normalizedName);
      const product = await Product.findById(mapping.productId);
      itemObj.mappedProduct = {
        exists: !!product,
        productId: mapping.productId,
        productName: product ? product.name : null,
        productStock: mapping.productStock,
        syncStatus: mapping.isSynced ? 'synced' : 'out_of_sync'
      };
    } else {
      itemObj.mappedProduct = { exists: false };
    }

    res.json({ success: true, data: itemObj });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Create inventory item
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

    const newItem = new InventoryItem({
      itemName,
      itemType: itemType || "raw",
      category,
      message: message || '',
      currentStock: currentStock || 0,
      minStock: minStock || 10,
      unit: unit || 1,
      isActive: isActive !== undefined ? isActive : true,
      price: price || 0
    });

    await newItem.save();

    // If it's a finished item, create/update product
    if (itemType === 'finished') {
      const product = await updateProductFromInventory(newItem);
      
      if (product) {
        console.log(`✅ Successfully mapped inventory item "${newItem.itemName}" to product "${product.name}"`);
      }
    } else if (itemType === 'raw') {
      // If it's a raw ingredient, auto-create possible finished products
      await autoCreateFinishedProduct(itemName);
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

// Update inventory item
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

    // Get old item to check name change
    const oldItem = await InventoryItem.findById(req.params.id);
    const oldName = oldItem ? oldItem.itemName : null;

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
        price: price || updatedItem?.price || 0,
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

    // Handle name change in mapping
    if (oldName && oldName !== itemName && itemNameMapping.has(oldName.toLowerCase())) {
      const oldMapping = itemNameMapping.get(oldName.toLowerCase());
      itemNameMapping.set(itemName.toLowerCase(), {
        ...oldMapping,
        inventoryItemName: itemName,
        lastSynced: new Date()
      });
      itemNameMapping.delete(oldName.toLowerCase());
      console.log(`🔄 Updated mapping from "${oldName}" to "${itemName}"`);
    }

    // Update product if it's a finished item
    if (itemType === 'finished') {
      const product = await updateProductFromInventory(updatedItem);
      
      if (product) {
        console.log(`✅ Updated product "${product.name}" from inventory changes`);
      }
    } else if (itemType === 'raw' && currentStock > 0) {
      // If raw ingredient restocked, check related finished products
      await updateRelatedFinishedProducts(itemName);
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

// Delete inventory item
app.delete("/api/inventory/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deletedItem = await InventoryItem.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Inventory item not found' 
      });
    }

    // Remove from mapping
    const normalizedName = deletedItem.itemName.toLowerCase();
    if (itemNameMapping.has(normalizedName)) {
      itemNameMapping.delete(normalizedName);
      console.log(`🗑️ Removed "${deletedItem.itemName}" from item mapping`);
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

// Restock inventory with automatic product sync
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
    
    const oldStock = item.currentStock;
    item.currentStock += parseFloat(quantity);
    
    item.restockHistory.push({
      quantity: parseFloat(quantity),
      price: parseFloat(price || 0),
      notes: notes || '',
      addedBy: req.user.id
    });
    
    await item.save();
    
    console.log(`📦 Restocked "${item.itemName}": ${oldStock} → ${item.currentStock}`);
    
    if (item.itemType === 'finished') {
      // Sync with product
      const result = await syncItemStocks(item.itemName, true);
      
      if (result.success && result.updated) {
        console.log(`✅ Updated product "${result.product.name}" stock to ${result.product.stock}`);
      }
      
      // Check if item was out of stock and now has stock
      if (oldStock === 0 && item.currentStock > 0) {
        console.log(`🎉 "${item.itemName}" is back in stock!`);
      }
    } else if (item.itemType === 'raw') {
      // If raw ingredient, check related finished products
      await updateRelatedFinishedProducts(item.itemName);
      
      console.log(`🔧 Raw ingredient "${item.itemName}" restocked. Checking recipes...`);
    }
    
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

// Filter and search inventory
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

// Get inventory categories
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

// Get inventory stats
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

// Get items needing restock
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

// Get finished products
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

// ==================== PRODUCT AVAILABILITY ENDPOINTS ====================

// Check product availability based on raw ingredients
app.get("/api/products/:name/availability", verifyToken, async (req, res) => {
  try {
    const productName = decodeURIComponent(req.params.name);
    const availability = await checkProductAvailability(productName);
    
    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Error checking product availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all recipe mappings
app.get("/api/recipes/mappings", verifyToken, verifyAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        recipeMapping,
        reverseRecipeMapping
      }
    });
  } catch (error) {
    console.error('Error getting recipe mappings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create recipe mapping
app.post("/api/recipes/mapping", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { rawIngredient, finishedProduct } = req.body;
    
    if (!rawIngredient || !finishedProduct) {
      return res.status(400).json({
        success: false,
        message: 'Raw ingredient and finished product are required'
      });
    }
    
    // Add to recipe mapping
    if (!recipeMapping[rawIngredient]) {
      recipeMapping[rawIngredient] = [];
    }
    
    if (!recipeMapping[rawIngredient].includes(finishedProduct)) {
      recipeMapping[rawIngredient].push(finishedProduct);
    }
    
    // Update reverse mapping
    if (!reverseRecipeMapping[finishedProduct]) {
      reverseRecipeMapping[finishedProduct] = [];
    }
    
    if (!reverseRecipeMapping[finishedProduct].includes(rawIngredient)) {
      reverseRecipeMapping[finishedProduct].push(rawIngredient);
    }
    
    console.log(`📝 Added recipe mapping: ${rawIngredient} → ${finishedProduct}`);
    
    res.json({
      success: true,
      message: 'Recipe mapping added successfully',
      data: {
        rawIngredient,
        finishedProduct,
        recipeMapping,
        reverseRecipeMapping
      }
    });
  } catch (error) {
    console.error('Error creating recipe mapping:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== ITEM MAPPING ENDPOINTS ====================

// Get all item mappings
app.get("/api/inventory/mappings", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const mappings = Array.from(itemNameMapping.entries()).map(([name, data]) => ({
      itemName: name,
      inventoryItemId: data.inventoryItemId,
      productId: data.productId,
      inventoryItemName: data.inventoryItemName,
      productName: data.productName,
      inventoryStock: data.inventoryStock,
      productStock: data.productStock,
      lastSynced: data.lastSynced,
      syncStatus: data.isSynced ? 'synced' : 'out_of_sync'
    }));
    
    // Get detailed info for each mapping
    const detailedMappings = await Promise.all(mappings.map(async (mapping) => {
      const inventoryItem = await InventoryItem.findById(mapping.inventoryItemId);
      const product = await Product.findById(mapping.productId);
      
      return {
        ...mapping,
        inventoryItemName: inventoryItem ? inventoryItem.itemName : 'Not Found',
        inventoryItemType: inventoryItem ? inventoryItem.itemType : 'Unknown',
        productName: product ? product.name : 'Not Found',
        productStatus: product ? product.status : 'Unknown',
        productCategory: product ? product.category : 'Unknown'
      };
    }));
    
    res.json({
      success: true,
      data: {
        totalMappings: detailedMappings.length,
        synced: detailedMappings.filter(m => m.syncStatus === 'synced').length,
        outOfSync: detailedMappings.filter(m => m.syncStatus === 'out_of_sync').length,
        mappings: detailedMappings
      }
    });
  } catch (error) {
    console.error('Error getting item mappings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Sync specific item
app.post("/api/inventory/sync-item/:itemName", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const itemName = decodeURIComponent(req.params.itemName);
    const { forceSource } = req.body;
    
    console.log(`🔄 Manually syncing item: "${itemName}"`);
    
    const result = await syncItemStocks(itemName, forceSource !== 'product');
    
    if (result.success) {
      res.json({
        success: true,
        message: result.updated ? 'Item synced successfully' : 'Item already synced',
        data: {
          itemName: itemName,
          inventoryStock: result.inventoryItem?.currentStock,
          productStock: result.product?.stock,
          source: forceSource === 'product' ? 'product' : 'inventory'
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message || 'Failed to sync item'
      });
    }
  } catch (error) {
    console.error('Error syncing item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Sync all items
app.post("/api/inventory/sync-all", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { forceSource } = req.body;
    
    console.log(`🔄 Starting full sync (source: ${forceSource || 'inventory'})...`);
    
    const mappings = Array.from(itemNameMapping.entries());
    let syncedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (const [itemName, mapping] of mappings) {
      try {
        const result = await syncItemStocks(itemName, forceSource !== 'product');
        
        if (result.updated) {
          syncedCount++;
        } else {
          skippedCount++;
        }
      } catch (err) {
        console.error(`   ❌ Error syncing "${itemName}":`, err.message);
        errorCount++;
      }
    }
    
    console.log(`✅ Full sync completed: ${syncedCount} synced, ${errorCount} errors, ${skippedCount} skipped`);
    
    res.json({
      success: true,
      message: `Full sync completed: ${syncedCount} items synced, ${errorCount} errors`,
      data: {
        totalItems: mappings.length,
        synced: syncedCount,
        errors: errorCount,
        skipped: skippedCount
      }
    });
  } catch (error) {
    console.error('Error in full sync:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during full sync'
    });
  }
});

// Create manual mapping
app.post("/api/inventory/create-mapping", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { inventoryItemId, productId } = req.body;
    
    if (!inventoryItemId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Both inventoryItemId and productId are required'
      });
    }
    
    const inventoryItem = await InventoryItem.findById(inventoryItemId);
    const product = await Product.findById(productId);
    
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if already mapped
    const normalizedName = inventoryItem.itemName.toLowerCase();
    if (itemNameMapping.has(normalizedName)) {
      return res.status(400).json({
        success: false,
        message: `Item "${inventoryItem.itemName}" is already mapped`
      });
    }
    
    // Create mapping
    itemNameMapping.set(normalizedName, {
      inventoryItemId: inventoryItem._id,
      productId: product._id,
      inventoryItemName: inventoryItem.itemName,
      productName: product.name,
      inventoryStock: inventoryItem.currentStock,
      productStock: product.stock,
      lastSynced: new Date(),
      isSynced: inventoryItem.currentStock === product.stock
    });
    
    console.log(`✅ Created manual mapping: "${inventoryItem.itemName}" <-> "${product.name}"`);
    
    // Sync stocks
    if (inventoryItem.itemType === 'finished') {
      product.stock = inventoryItem.currentStock;
      product.status = inventoryItem.currentStock > 0 ? 'available' : 'out_of_stock';
      product.inventoryItemId = inventoryItem._id;
      await product.save();
    }
    
    res.json({
      success: true,
      message: 'Mapping created successfully',
      data: {
        inventoryItem: {
          id: inventoryItem._id,
          name: inventoryItem.itemName,
          stock: inventoryItem.currentStock
        },
        product: {
          id: product._id,
          name: product.name,
          stock: product.stock
        }
      }
    });
  } catch (error) {
    console.error('Error creating mapping:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== DASHBOARD AND OTHER ROUTES ====================

// Dashboard stats
app.get("/api/dashboard/stats", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    
    // Get today's orders
    const today = new Date();
    const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0));
    const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59));
    
    const todaysOrders = await Order.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });
    
    // Count unique products from orders
    const uniqueProductsInOrders = await Order.aggregate([
      {
        $unwind: "$items"
      },
      {
        $group: {
          _id: "$items.name"
        }
      },
      {
        $count: "uniqueProducts"
      }
    ]);
    
    // Get total products from both InventoryItem and MenuItem
    const totalInventoryProducts = await InventoryItem.countDocuments({ itemType: 'finished' });
    const totalMenuProducts = await MenuItem.countDocuments({});
    const totalProducts = totalInventoryProducts + totalMenuProducts;
    
    // If no products in MenuItem/InventoryItem, use products from orders
    const productsFromOrders = uniqueProductsInOrders[0]?.uniqueProducts || 0;
    const finalTotalProducts = totalProducts > 0 ? totalProducts : productsFromOrders;
    
    const totalCustomers = await Customer.countDocuments();
    const totalInventoryItems = await InventoryItem.countDocuments();
    
    console.log('📊 Dashboard Stats Debug:');
    console.log('  - Total Orders (All Time):', totalOrders);
    console.log('  - Today\'s Orders:', todaysOrders);
    console.log('  - Total Customers:', totalCustomers);
    console.log('  - Total Inventory Products (finished):', totalInventoryProducts);
    console.log('  - Total Menu Products (all):', totalMenuProducts);
    console.log('  - Total Products from Orders:', productsFromOrders);
    console.log('  - Final Total Products:', finalTotalProducts);
    console.log('  - Total Inventory Items:', totalInventoryItems);
    
    const totalRevenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;
    
    // Today's revenue
    const todaysRevenueResult = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }
      },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const todaysRevenue = todaysRevenueResult[0]?.total || 0;

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
        todaysOrders,
        totalProducts: finalTotalProducts,
        totalCustomers,
        totalRevenue,
        todaysRevenue,
        totalInventoryItems,
        totalInventoryProducts,
        totalMenuProducts,
        productsFromOrders,
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

// Get today's orders
app.get("/api/orders/today", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0));
    const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59));
    
    const todaysOrders = await Order.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
    
    console.log('📋 Today\'s Orders found:', todaysOrders.length);
    if (todaysOrders.length > 0) {
      console.log('   Sample order:', todaysOrders[0].orderNumber, 'Customer:', todaysOrders[0].customerId);
    }
    
    res.json({
      success: true,
      data: todaysOrders,
      count: todaysOrders.length
    });
  } catch (error) {
    console.error('Error fetching today\'s orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s orders'
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

// ==================== ORDER PROCESSING ====================

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
    const startOfToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0));
    const endOfToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59));
    const orderCount = await Order.countDocuments({
      createdAt: {
        $gte: startOfToday,
        $lt: endOfToday
      }
    });
    const orderNumber = `ORD-${dateStr}-${(orderCount + 1).toString().padStart(3, '0')}`;
    
    // Customer handling
    let customerId = orderData.customerId;
    let customer = null;
    
    console.log('👤 CUSTOMER CREATION STARTING');
    console.log('   Input customerId:', customerId);
    
    if (customerId) {
      // Try to find existing customer
      customer = await Customer.findOne({ customerId: customerId });
      console.log('   Found existing customer:', !!customer);
    }
    
    // If no customer found or no customerId provided, create a new one
    if (!customer) {
      customerId = generateCustomerId();
      console.log('🆕 Generating new customerId:', customerId);
      
      customer = new Customer({
        customerId: customerId,
        totalOrders: 1,
        totalSpent: orderData.total,
        lastOrderDate: new Date()
      });
      
      console.log('📝 Customer object created with:',{
        customerId: customer.customerId,
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent
      });
      
      // Save customer
      const savedCustomer = await customer.save();
      console.log('✅ NEW CUSTOMER SAVED:', savedCustomer.customerId);
      console.log('   MongoDB ID:', savedCustomer._id);
    } else {
      // Update existing customer stats
      console.log('📝 UPDATING existing customer:', customerId);
      customer.totalOrders += 1;
      customer.totalSpent += orderData.total;
      customer.lastOrderDate = new Date();
      
      const updatedCustomer = await customer.save();
      console.log('✅ CUSTOMER UPDATED');
      console.log('   New order count:', updatedCustomer.totalOrders);
    }
    
    // VALIDATE that customerId is definitely set before creating order
    if (!customerId || customerId.length === 0) {
      console.error('🚨 CRITICAL ERROR: customerId is empty after customer creation!');
      throw new Error('Customer ID is missing - cannot create order');
    }
    
    console.log('✅ PROCEEDING TO CREATE ORDER WITH customerId:', customerId);
    
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
    
    console.log('🔍 ORDER OBJECT BEFORE SAVE:');
    console.log('   customerId value:', customerId);
    console.log('   order.customerId value:', order.customerId);
    
    // Validate customerId exists
    if (!customerId || customerId === 'undefined') {
      throw new Error('❌ CRITICAL: customerId is missing! Customer creation may have failed silently.');
    }
    
    const savedOrder = await order.save();
    
    console.log('✅ Order saved:', savedOrder.orderNumber);
    console.log('   - Customer ID:', customerId);
    console.log('   - Total:', savedOrder.total);
    
    sendOrderNotification(savedOrder);
    
    // Broadcast stats update to refresh dashboard
    broadcastToAdmins({
      type: 'stats_update',
      data: {
        totalOrders: await Order.countDocuments(),
        totalCustomers: await Customer.countDocuments(),
        lastOrderTime: new Date().toLocaleTimeString()
      },
      message: 'Dashboard stats updated'
    });
    
    // ==================== STOCK UPDATE WITH ITEM MAPPING ====================
    try {
      for (const item of orderData.items) {
        console.log(`📦 Processing stock update for: "${item.name}" (Quantity: ${item.quantity})`);
        
        let product = null;
        
        // Method 1: Use product ID if available
        if (item.id) {
          product = await Product.findById(item.id);
        }
        
        // Method 2: Try to find by name mapping
        if (!product && item.name) {
          const normalizedName = item.name.toLowerCase();
          if (itemNameMapping.has(normalizedName)) {
            const mapping = itemNameMapping.get(normalizedName);
            product = await Product.findById(mapping.productId);
          }
        }
        
        // Method 3: Try to find by name in database
        if (!product && item.name) {
          product = await Product.findOne({ 
            name: { $regex: new RegExp(`^${item.name}$`, 'i') } 
          });
        }
        
        if (product) {
          // Update product stock
          const oldStock = product.stock || 0;
          const newStock = Math.max(0, oldStock - (item.quantity || 1));
          
          product.stock = newStock;
          product.status = newStock > 0 ? 'available' : 'out_of_stock';
          product.updatedAt = new Date();
          
          await product.save();
          
          console.log(`   ✅ Updated product "${product.name}" stock: ${oldStock} → ${newStock}`);
          
          // Update inventory stock through mapping
          await updateInventoryFromProduct(product);
          
          // Check for low stock alert
          if (newStock > 0 && newStock < LOW_STOCK_THRESHOLD) {
            sendLowStockAlert(product);
            console.log(`   ⚠️ Low stock alert for "${product.name}": ${newStock} items left`);
          }
          
          // Check if item just went out of stock
          if (oldStock > 0 && newStock === 0) {
            console.log(`   🚨 "${product.name}" is now OUT OF STOCK`);
            
            broadcastToAdmins({
              type: 'out_of_stock',
              data: {
                productId: product._id,
                productName: product.name
              },
              message: `${product.name} is now out of stock!`
            });
          }
        } else {
          console.log(`   ⚠️ Product not found for item: "${item.name}"`);
        }
      }
    } catch (stockError) {
      console.error('❌ Stock update error:', stockError);
      // Don't fail the order if stock update fails
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

// ==================== PRODUCT ENDPOINTS ====================

// Get all products with inventory status
app.get("/api/products/with-inventory", verifyToken, async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 }).lean();
    
    // Add inventory and availability info
    const productsWithInventory = await Promise.all(products.map(async (product) => {
      const productObj = product;
      const normalizedName = product.name.toLowerCase();
      
      // Get inventory mapping
      if (itemNameMapping.has(normalizedName)) {
        const mapping = itemNameMapping.get(normalizedName);
        const inventoryItem = await InventoryItem.findById(mapping.inventoryItemId);
        if (inventoryItem) {
          productObj.inventoryItem = {
            id: inventoryItem._id,
            name: inventoryItem.itemName,
            stock: inventoryItem.currentStock,
            minStock: inventoryItem.minStock,
            unit: inventoryItem.unit
          };
        }
      }
      
      // Check recipe availability
      const availability = await checkProductAvailability(product.name);
      productObj.recipeAvailability = availability;
      
      // Determine overall availability
      productObj.overallStatus = product.stock > 0 ? 'available' : 'out_of_stock';
      
      return productObj;
    }));
    
    res.json({ 
      success: true, 
      data: productsWithInventory 
    });
  } catch (error) {
    console.error('Error fetching products with inventory:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get products that need restocking
app.get("/api/products/needs-restock", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const products = await Product.find({
      $or: [
        { stock: 0 },
        { stock: { $lt: LOW_STOCK_THRESHOLD, $gt: 0 } }
      ]
    })
    .populate('category', 'name')
    .sort({ stock: 1 })
    .lean();
    
    // Add inventory and recipe info
    const productsWithDetails = await Promise.all(products.map(async (product) => {
      const productObj = product;
      const normalizedName = product.name.toLowerCase();
      
      // Get inventory mapping
      if (itemNameMapping.has(normalizedName)) {
        const mapping = itemNameMapping.get(normalizedName);
        const inventoryItem = await InventoryItem.findById(mapping.inventoryItemId);
        if (inventoryItem) {
          productObj.inventoryItem = {
            id: inventoryItem._id,
            name: inventoryItem.itemName,
            stock: inventoryItem.currentStock,
            minStock: inventoryItem.minStock
          };
        }
      }
      
      // Check recipe availability
      const availability = await checkProductAvailability(product.name);
      productObj.recipeAvailability = availability;
      
      return productObj;
    }));
    
    res.json({ 
      success: true, 
      data: productsWithDetails,
      count: products.length,
      threshold: LOW_STOCK_THRESHOLD
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});
// Serve favicon
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
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
    
    // Add inventory mapping info
    const itemsWithInventory = await Promise.all(lowStockItems.map(async (item) => {
      const itemObj = item;
      const normalizedName = item.name.toLowerCase();
      
      if (itemNameMapping.has(normalizedName)) {
        const mapping = itemNameMapping.get(normalizedName);
        const inventoryItem = await InventoryItem.findById(mapping.inventoryItemId);
        if (inventoryItem) {
          itemObj.inventoryItem = {
            id: inventoryItem._id,
            name: inventoryItem.itemName,
            stock: inventoryItem.currentStock,
            minStock: inventoryItem.minStock
          };
        }
      }
      
      return itemObj;
    }));
    
    res.json({ 
      success: true, 
      data: itemsWithInventory,
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

// Get out of stock items
app.get("/api/products/out-of-stock", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const outOfStockItems = await Product.find({
      stock: 0
    })
    .populate('category', 'name')
    .sort({ name: 1 })
    .lean();
    
    // Add inventory mapping info
    const itemsWithInventory = await Promise.all(outOfStockItems.map(async (item) => {
      const itemObj = item;
      const normalizedName = item.name.toLowerCase();
      
      if (itemNameMapping.has(normalizedName)) {
        const mapping = itemNameMapping.get(normalizedName);
        const inventoryItem = await InventoryItem.findById(mapping.inventoryItemId);
        if (inventoryItem) {
          itemObj.inventoryItem = {
            id: inventoryItem._id,
            name: inventoryItem.itemName,
            stock: inventoryItem.currentStock,
            lastRestock: inventoryItem.restockHistory.length > 0 ? 
              inventoryItem.restockHistory[inventoryItem.restockHistory.length - 1].createdAt : null
          };
        }
      }
      
      return itemObj;
    }));
    
    res.json({ 
      success: true, 
      data: itemsWithInventory,
      count: outOfStockItems.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ==================== CUSTOMER ROUTES ====================

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

// ==================== MENU ROUTES ====================

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

// ==================== DASHBOARD ROUTES ====================

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
    
    // Get item mapping stats
    const mappingStats = {
      totalMappings: itemNameMapping.size,
      synced: Array.from(itemNameMapping.values()).filter(m => 
        m.isSynced
      ).length,
      outOfSync: Array.from(itemNameMapping.values()).filter(m => 
        !m.isSynced
      ).length
    };
    
    res.render("Inventory", {
      user: req.user,
      initialItems: inventoryItems,
      categories: categories || [],
      stats: {
        totalItems: stats.totalItems,
        totalValue: stats.totalValue,
        lowStock: stats.lowStock,
        outOfStock: stats.outOfStock,
        ...mappingStats
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
        outOfStock: 0,
        totalMappings: 0,
        synced: 0,
        outOfSync: 0
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
    
    // Add inventory mapping info
    const itemsWithInventory = await Promise.all([...lowStockItems, ...outOfStockItems].map(async (item) => {
      const itemObj = item;
      const normalizedName = item.name.toLowerCase();
      
      if (itemNameMapping.has(normalizedName)) {
        const mapping = itemNameMapping.get(normalizedName);
        const inventoryItem = await InventoryItem.findById(mapping.inventoryItemId);
        if (inventoryItem) {
          itemObj.inventoryItem = {
            id: inventoryItem._id,
            name: inventoryItem.itemName,
            stock: inventoryItem.currentStock,
            minStock: inventoryItem.minStock
          };
        }
      }
      
      return itemObj;
    }));
    
    const lowStockWithInventory = itemsWithInventory.filter(item => item.stock > 0);
    const outOfStockWithInventory = itemsWithInventory.filter(item => item.stock === 0);
    
    res.render("stock", {
      user: req.user,
      lowStockItems: lowStockWithInventory,
      outOfStockItems: outOfStockWithInventory,
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

// ==================== MISSING ENDPOINTS ====================

// Get notifications (for admin dashboard)
app.get("/api/notifications", verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Get recent stock notifications
    const stockNotifications = await StockNotification.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    
    // Get low stock products
    const lowStockProducts = await Product.find({
      stock: { $lt: LOW_STOCK_THRESHOLD, $gte: 1 }
    })
    .select('name stock category status')
    .limit(10)
    .lean();
    
    // Get out of stock products
    const outOfStockProducts = await Product.find({
      stock: 0
    })
    .select('name category status')
    .limit(10)
    .lean();
    
    // Get recent orders for notification
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber total type status createdAt')
      .lean();
    
    res.json({
      success: true,
      data: {
        stockNotifications,
        lowStockProducts,
        outOfStockProducts,
        recentOrders,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Get stock for specific product by name
app.get("/api/inventory/stock/:productName", verifyToken, async (req, res) => {
  try {
    const productName = decodeURIComponent(req.params.productName);
    
    console.log(`🔍 Checking stock for: "${productName}"`);
    
    // Method 1: Try to find in itemNameMapping first
    const normalizedName = productName.toLowerCase();
    if (itemNameMapping.has(normalizedName)) {
      const mapping = itemNameMapping.get(normalizedName);
      const inventoryItem = await InventoryItem.findById(mapping.inventoryItemId);
      const product = await Product.findById(mapping.productId);
      
      return res.json({
        success: true,
        data: {
          productName: productName,
          inventoryStock: inventoryItem?.currentStock || 0,
          productStock: product?.stock || 0,
          status: product?.status || 'unknown',
          isSynced: mapping.isSynced,
          lastSynced: mapping.lastSynced,
          source: 'mapping'
        }
      });
    }
    
    // Method 2: Try to find in InventoryItem directly
    let inventoryItem = await InventoryItem.findOne({
      itemName: { $regex: new RegExp(`^${productName}$`, 'i') },
      itemType: 'finished',
      isActive: true
    });
    
    // Method 3: Try to find in Product directly
    let product = await Product.findOne({
      name: { $regex: new RegExp(`^${productName}$`, 'i') }
    });
    
    // If found in inventory but not in product, create mapping
    if (inventoryItem && !product) {
      product = await updateProductFromInventory(inventoryItem);
    }
    
    // If found in product but not in inventory, create mapping
    if (product && !inventoryItem) {
      inventoryItem = await updateInventoryFromProduct(product);
    }
    
    // If neither found, return not found
    if (!inventoryItem && !product) {
      return res.status(404).json({
        success: false,
        message: `Product "${productName}" not found in inventory or products`
      });
    }
    
    res.json({
      success: true,
      data: {
        productName: productName,
        inventoryStock: inventoryItem?.currentStock || 0,
        productStock: product?.stock || 0,
        status: product?.status || (inventoryItem?.currentStock > 0 ? 'available' : 'out_of_stock'),
        hasMapping: !!itemNameMapping.has(normalizedName),
        source: 'direct_lookup'
      }
    });
  } catch (error) {
    console.error(`Error checking stock for "${req.params.productName}":`, error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking stock'
    });
  }
});

// Get stock for multiple products
app.post("/api/inventory/stock/batch", verifyToken, async (req, res) => {
  try {
    const { productNames } = req.body;
    
    if (!productNames || !Array.isArray(productNames)) {
      return res.status(400).json({
        success: false,
        message: 'Product names array is required'
      });
    }
    
    const stockData = [];
    
    for (const productName of productNames) {
      try {
        const normalizedName = productName.toLowerCase();
        let inventoryStock = 0;
        let productStock = 0;
        let status = 'unknown';
        
        // Check mapping first
        if (itemNameMapping.has(normalizedName)) {
          const mapping = itemNameMapping.get(normalizedName);
          const inventoryItem = await InventoryItem.findById(mapping.inventoryItemId);
          const product = await Product.findById(mapping.productId);
          
          inventoryStock = inventoryItem?.currentStock || 0;
          productStock = product?.stock || 0;
          status = product?.status || 'unknown';
        } else {
          // Direct lookup
          const inventoryItem = await InventoryItem.findOne({
            itemName: { $regex: new RegExp(`^${productName}$`, 'i') },
            itemType: 'finished',
            isActive: true
          });
          
          const product = await Product.findOne({
            name: { $regex: new RegExp(`^${productName}$`, 'i') }
          });
          
          inventoryStock = inventoryItem?.currentStock || 0;
          productStock = product?.stock || 0;
          status = product?.status || (inventoryStock > 0 ? 'available' : 'out_of_stock');
        }
        
        stockData.push({
          productName,
          inventoryStock,
          productStock,
          status,
          isAvailable: status === 'available'
        });
      } catch (err) {
        console.error(`Error processing "${productName}":`, err.message);
        stockData.push({
          productName,
          inventoryStock: 0,
          productStock: 0,
          status: 'error',
          isAvailable: false,
          error: err.message
        });
      }
    }
    
    res.json({
      success: true,
      data: stockData
    });
  } catch (error) {
    console.error('Error in batch stock check:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in batch stock check'
    });
  }
});

// Create stock notification
app.post("/api/notifications", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { type, message, data, priority = 'medium' } = req.body;
    
    if (!type || !message) {
      return res.status(400).json({
        success: false,
        message: 'Type and message are required'
      });
    }
    
    const notification = new StockNotification({
      type,
      message,
      data: data || {},
      priority,
      isRead: false,
      createdAt: new Date()
    });
    
    await notification.save();
    
    // Broadcast to admins
    broadcastToAdmins({
      type: 'new_notification',
      data: notification,
      message: message
    });
    
    res.json({
      success: true,
      message: 'Notification created',
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }
});

// Mark notification as read
app.put("/api/notifications/:id/read", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const notification = await StockNotification.findByIdAndUpdate(
      req.params.id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification'
    });
  }
});

// Clear all notifications
app.delete("/api/notifications/clear", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await StockNotification.deleteMany({ isRead: true });
    
    res.json({
      success: true,
      message: 'Read notifications cleared'
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear notifications'
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "online",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    mappings: itemNameMapping.size,
    inventoryItems: InventoryItem.countDocuments(),
    products: Product.countDocuments(),
    orders: Order.countDocuments()
  });
});

// Get all routes (for debugging)
app.get("/api/routes", (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.json({
    success: true,
    data: routes
  });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`📦 Item mapping system ready with ${itemNameMapping.size} mappings`);
  console.log(`🍳 Recipe system loaded with ${Object.keys(recipeMapping).length} raw ingredients`);
});