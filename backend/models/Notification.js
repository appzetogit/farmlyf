import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  target: {
    type: String,
    enum: ['all', 'active', 'cart'],
    default: 'all'
  },
  sentTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  sentCount: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'partial'],
    default: 'sent'
  }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
