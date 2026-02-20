import mongoose from 'mongoose';

const returnSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // Custom ID: "RET-..."
  orderId: String,
  userId: String,
  userName: String,
  type: { type: String, enum: ['refund', 'replace'] },
  status: { type: String, default: 'Pending' }, // Pending, Approved, Picked Up, In Transit, Received, Refunded, Rejected
  reason: String,
  comments: String,
  items: [Object],
  refundAmount: Number,
  requestDate: Date,
  // Shiprocket integration fields
  shiprocketReturnId: String,
  shiprocketShipmentId: String,
  awbCode: String,
  courierName: String,
  pickupScheduledDate: Date,
  pickupStatus: { type: String, default: 'Not Scheduled' }, // Not Scheduled, Scheduled, Picked Up, In Transit, Delivered
  pickupStatusHistory: [{
    status: String,
    timestamp: Date,
    info: String
  }],
  // Refund processing
  refundId: String,
  refundStatus: { type: String, enum: ['pending', 'processed', 'failed', 'not_applicable'], default: 'pending' },
  refundProcessedAt: Date
}, { timestamps: true });

export default mongoose.model('Return', returnSchema);
