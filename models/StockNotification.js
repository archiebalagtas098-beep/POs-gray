import mongoose from 'mongoose';

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