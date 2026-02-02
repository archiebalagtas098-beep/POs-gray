import mongoose from "mongoose";
import bcrypt from "bcrypt";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    // For Mongoose 6+, these options are no longer needed
    // The new version uses sensible defaults
    await mongoose.connect(process.env.MONGODB_URI);
    
    isConnected = true;
    console.log('MongoDB Atlas has been connected successfully');
    
    // Initialize default data
    await initializeDefaultData();
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error);
    process.exit(1);
  }
};

async function initializeDefaultData() {
  try {
    // Drop problematic index on inventoryitems collection
    try {
      const db = mongoose.connection.db;
      await db.collection('inventoryitems').dropIndex('name_1');
    } catch (indexError) {
    }
    
    // Clean up any products with invalid category values (ObjectIds instead of strings)
    try {
      const db = mongoose.connection.db;
      
      // Delete ALL products from the products collection
      // This is a fresh start since the schema has changed
      const result = await db.collection('products').deleteMany({});
    } catch (cleanupError) {
      // Silently ignore errors if products collection doesn't exist yet
    }
    
    // Initialize default categories
    const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
      name: { type: String, required: true, unique: true },
      createdAt: { type: Date, default: Date.now }
    }));
    
    const defaultCategories = [
      "Rice Bowl Meals",
      "Hot Sizzlers",
      "Party Tray",
      "Drinks",
      "Coffee",
      "Milk Tea",
      "Frappe",
      "Snacks & Appetizer",
      "Budget Meals Served with Rice",
      "Specialties"
    ];
    
    for (const catName of defaultCategories) {
      await Category.findOneAndUpdate(
        { name: catName },
        { $setOnInsert: { name: catName } },
        { upsert: true, new: true }
      );
    }
    
    // Initialize default admin user
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
      status: { type: String, enum: ['active', 'inactive'], default: 'active' },
      createdAt: { type: Date, default: Date.now }
    }));
    
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount === 0) {
      const adminUser = new User({
        username: "admin",
        password: bcrypt.hashSync("admin123", 10),
        role: "admin",
        status: "active"
      });
      await adminUser.save();
    }
    
    // Initialize default staff user
    const staffCount = await User.countDocuments({ role: "staff" });
    if (staffCount === 0) {
      const staffUser = new User({
        username: "staff",
        password: bcrypt.hashSync("staff123", 10),
        role: "staff",
        status: "active"
      });
      await staffUser.save();
    }

  } catch (error) {
    console.error("Error initializing default data:", error);
  }
}

// Export models
export const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
}));

export const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
}));

// Inventory Item Model
export const InventoryItem = mongoose.models.InventoryItem || mongoose.model('InventoryItem', new mongoose.Schema({
  itemName: String,
  itemType: String,
  category: String,
  message: String,
  unit: String,
  currentStock: Number,
  minStock: Number,
  price: Number,
  isActive: Boolean
}, {
  timestamps: true
}));

// Product Model (for POS/menu items)
export const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: [true, "Category is required"]
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
    min: 0,
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  inventoryItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InventoryItem",
    sparse: true
  },
  status: {
    type: String,
    enum: ["available", "unavailable"],
    default: "available"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}));

// Order Model
export const Order = mongoose.models.Order || mongoose.model('Order', new mongoose.Schema({
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
      inventoryItemId: mongoose.Schema.Types.ObjectId,
      productId: mongoose.Schema.Types.ObjectId
    }
  ],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    sparse: true
  },
  payment: {
    method: {
      type: String,
      enum: ["cash", "gcash"],
      default: "cash",
      required: true
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0
    },
    change: {
      type: Number,
      default: 0,
      min: 0
    },
  },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "completed"
  },
  orderType: {
    type: String,
    enum: ["dine-in", "takeout"],
    default: "dine-in"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}));

// Stats Model
export const Stats = mongoose.models.Stats || mongoose.model('Stats', new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
    default: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  ordersToday: {
    type: Number,
    default: 0
  },
  itemsSold: {
    type: Number,
    default: 0
  },
  itemsSoldToday: {
    type: Number,
    default: 0
  },
  dineInOrders: {
    type: Number,
    default: 0
  },
  takeoutOrders: {
    type: Number,
    default: 0
  },
  paymentStats: {
    cash: { type: Number, default: 0 },
    gcash: { type: Number, default: 0 }
  },
  categoryStats: {
    Rice: { type: Number, default: 0 },
    Sizzling: { type: Number, default: 0 },
    Party: { type: Number, default: 0 },
    Drink: { type: Number, default: 0 },
    Coffee: { type: Number, default: 0 },
    'Milk Tea': { type: Number, default: 0 },
    Frappe: { type: Number, default: 0 },
    Snacks: { type: Number, default: 0 },
    Budget: { type: Number, default: 0 },
    Specialties: { type: Number, default: 0 }
  },
  revenue: {
    type: Number,
    default: 0
  },
  revenueToday: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}));

// Menu Item Model - Updated with proper validation
const menuItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, "Item name is required"],
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [1, "Price must be at least ₱1"]
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    enum: {
      values: [
        'Rice', 
        'Sizzling', 
        'Party', 
        'Drink', 
        'Cafe', 
        'Milk', 
        'Frappe', 
        'Snack & Appetizer', 
        'Budget Meals Served with Rice', 
        'Specialties', 
        'packaging',
        'others'
      ],
      message: '{VALUE} is not a valid category'
    }
  },
  unit: {
    type: String,
    required: [true, "Unit is required"],
    default: 'pcs',
    enum: {
      values: [
        'plate',
        'plates',
        'sizzling plate', 
        'tray',
        'trays',
        'glass',
        'glasses',
        'pitcher',
        'pitchers',
        'bottle',
        'bottles',
        'cup',
        'cups',
        'serving',
        'servings',
        'sandwich',
        'sandwiches',
        'meal',
        'meals',
        'bowl',
        'bowls',
        'pot',
        'pots',
        'pack',
        'packs',
        'box',
        'boxes',
        'set',
        'sets',
        'bag',
        'bags',
        'piece',
        'pcs'
      ],
      message: '{VALUE} is not a valid unit'
    }
  },
  currentStock: {
    type: Number,
    required: true,
    default: 100,
    min: 0
  },
  minStock: {
    type: Number,
    required: true,
    default: 20,
    min: 1
  },
  maxStock: {
    type: Number,
    required: true,
    default: 200,
    min: 10
  },
  itemType: {
    type: String,
    default: 'finished',
    enum: ['raw', 'finished', 'packaging']
  },
  // Change from status to isActive to match your routes
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add middleware BEFORE creating the model
menuItemSchema.pre('save', async function() {
  // Copy itemName to name if name is not set
  if (this.itemName && !this.name) {
    this.name = this.itemName;
  }
  
  // Ensure maxStock is greater than minStock
  if (this.maxStock <= this.minStock) {
    throw new Error('Maximum stock must be greater than minimum stock');
  }
  
  // Ensure current stock doesn't exceed max
  if (this.currentStock > this.maxStock) {
    this.currentStock = this.maxStock;
  }
  
  // Ensure current stock is not below 0
  if (this.currentStock < 0) {
    this.currentStock = 0;
  }
  
  this.updatedAt = Date.now();
});

// Pre-update middleware
menuItemSchema.pre('findOneAndUpdate', async function() {
  const update = this.getUpdate();
  const updateOps = update.$set || update;
  
  // Check if we're using $set operator or direct update
  if (updateOps) {
    // If updating itemName, also update name
    if (updateOps.itemName && !updateOps.name) {
      updateOps.name = updateOps.itemName;
    }
    
    // Validate stock levels
    if (updateOps.maxStock !== undefined && updateOps.minStock !== undefined) {
      if (updateOps.maxStock <= updateOps.minStock) {
        throw new Error('Maximum stock must be greater than minimum stock');
      }
    }
    
    // Handle partial updates
    if (updateOps.currentStock !== undefined) {
      if (updateOps.currentStock < 0) {
        updateOps.currentStock = 0;
      }
    }
    
    // Update timestamp
    updateOps.updatedAt = Date.now();
  }
});

// Create or retrieve the model
export const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);

const stockNotificationSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  notificationType: {
    type: String,
    enum: ['out_of_stock', 'low_stock', 'restock_request', 'stock_transferred'],
    required: true
  },
  currentStock: {
    type: Number,
    required: true
  },
  minStock: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  sentBy: {
    type: String,
    enum: ['system', 'admin', 'staff'],
    default: 'system'
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  actionTaken: {
    type: String,
    enum: ['pending', 'restocked', 'ignored', 'ordered'],
    default: 'pending'
  }
}, {
  timestamps: true,
  expireAfterSeconds: 604800 
});

export const StockNotification = mongoose.models.StockNotification || 
  mongoose.model('StockNotification', stockNotificationSchema);