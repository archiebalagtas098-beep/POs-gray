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