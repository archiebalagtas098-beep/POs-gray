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
    console.error('MongoDB connection error:', error);
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

// Menu Item Model
export const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Rice Bowl Meals',
      'Hot Sizzlers',
      'Party Tray',
      'Drinks',
      'Coffee',
      'Milk Tea',
      'Frappe',
      'Snacks & Appetizer',
      'Budget Meals Served with Rice',
      'Specialties'
    ]
  },
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
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

// Update timestamp on save for MenuItem
MenuItem.schema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});