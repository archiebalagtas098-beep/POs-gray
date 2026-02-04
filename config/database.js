import mongoose from "mongoose";
import bcrypt from "bcrypt";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('MongoDB Atlas connected successfully');
    await initializeDefaultData();
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error);
    process.exit(1);
  }
};

async function initializeDefaultData() {
  try {
    const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
      name: { type: String, required: true, unique: true }
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
        { name: catName },
        { upsert: true }
      );
    }
    
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
      status: { type: String, enum: ['active', 'inactive'], default: 'active' }
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
    
    // Initialize Customer collection
    console.log('✅ Initializing database collections...');

  } catch (error) {
    console.error("Error initializing default data:", error);
  }
}

export const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}));

export const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
  name: { type: String, required: true, unique: true }
}));

export const InventoryItem = mongoose.models.InventoryItem || mongoose.model('InventoryItem', new mongoose.Schema({
  itemName: String,
  itemType: String,
  category: String,
  unit: String,
  currentStock: Number,
  minStock: Number,
  isActive: Boolean
}));

export const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 }
}));

const orderSchema = new mongoose.Schema({
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
      vatable: { type: Boolean, default: true }
    }
  ],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  customerId: { type: String, default: null },
  payment: {
    method: { type: String, enum: ["cash", "gcash"], default: "cash" },
    amountPaid: { type: Number, required: true },
    change: { type: Number, default: 0 }
  },
  type: { type: String, enum: ["Dine In", "Take Out"], default: "Dine In" },
  status: { type: String, default: "completed" },
  orderNumber: { type: String },
  notes: { type: String, default: '' },
  tableNumber: { type: String },
  createdAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export const Stats = mongoose.models.Stats || mongoose.model('Stats', new mongoose.Schema({
  date: { type: Date, required: true },
  totalOrders: { type: Number, default: 0 },
  ordersToday: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  revenueToday: { type: Number, default: 0 }
}));

const menuItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  unit: { type: String, default: 'pcs' },
  currentStock: { type: Number, default: 100 },
  minStock: { type: Number, default: 20 },
  maxStock: { type: Number, default: 200 },
  isActive: { type: Boolean, default: true }
});

export const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);

const stockNotificationSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  notificationType: { type: String, required: true },
  currentStock: { type: Number, required: true },
  minStock: { type: Number, required: true },
  message: { type: String, default: '' },
  sentBy: { type: String, default: 'system' },
  priority: { type: String, default: 'medium' },
  actionTaken: { type: String, default: 'pending' }
});

export const StockNotification = mongoose.models.StockNotification || 
  mongoose.model('StockNotification', stockNotificationSchema);

const customerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true, index: true },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrderDate: { type: Date, default: null },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

export const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);

// Ensure collection exists
try {
  Customer.collection.createIndex({ customerId: 1 }, { unique: true }).catch(err => {
    if (!err.message.includes('already exists')) {
      console.warn('Index creation warning:', err.message);
    }
  });
} catch (err) {
  console.warn('Could not create index:', err.message);
}

// Stock Request Schema
const stockRequestSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  inventoryItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: false
  },
  requestedQuantity: {
    type: Number,
    required: [true, 'Requested quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'fulfilled'],
    default: 'pending'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requested by user is required']
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: {
    type: String,
    trim: true,
    default: ''
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  reviewDate: {
    type: Date
  },
  fulfilledDate: {
    type: Date
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

// Index for faster queries
stockRequestSchema.index({ productName: 1, status: 1 });
stockRequestSchema.index({ requestedBy: 1, createdAt: -1 });
stockRequestSchema.index({ status: 1, priority: 1 });
stockRequestSchema.index({ createdAt: -1 });

// Pre-save middleware to update updatedAt
stockRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const StockRequest = mongoose.model('StockRequest', stockRequestSchema);