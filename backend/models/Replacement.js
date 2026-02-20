import mongoose from 'mongoose';

const replacementSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // Custom ID: "RPL-..."
  orderId: String,
  userId: String,
  userName: String,
  userEmail: String,
  userPhone: String,
  type: { type: String, default: 'Same Product' }, // Same Product, Different Variant
  status: { type: String, default: 'Pending' }, // Pending, Approved, Pickup Scheduled, Pickup Completed, Replacement Shipped, Delivered, Rejected
  reason: String,
  comments: String,
  
  // Items
  originalItems: [{
    name: String,
    sku: String,
    productId: String,
    qty: Number,
    price: Number,
    reason: String,
    condition: String,
    image: String
  }],
  replacementItems: [{
    name: String,
    sku: String,
    productId: String,
    qty: Number,
    price: Number,
    image: String
  }],
  
  // Evidence
  evidence: {
    reason: String,
    comment: String,
    images: [String],
    video: String
  },
  
  // Addresses
  pickupAddress: {
    fullName: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    phone: String
  },
  deliveryAddress: {
    fullName: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    phone: String
  },
  
  // Shiprocket Pickup (old item)
  shiprocketPickupId: String,
  shiprocketPickupShipmentId: String,
  pickupAwbCode: String,
  pickupCourierName: String,
  pickupScheduledDate: Date,
  pickupStatus: { type: String, default: 'Not Scheduled' }, // Not Scheduled, Scheduled, Picked Up, In Transit, Delivered
  
  // Shiprocket Shipment (new item)
  shiprocketShipmentId: String,
  shipmentAwbCode: String,
  shipmentCourierName: String,
  shipmentStatus: { type: String, default: 'Not Shipped' }, // Not Shipped, Shipped, In Transit, Delivered
  
  // Status history
  statusHistory: [{
    status: String,
    timestamp: Date,
    info: String,
    user: String
  }],
  
  requestDate: { type: Date, default: Date.now },
  approvedAt: Date,
  completedAt: Date
}, { timestamps: true });

export default mongoose.model('Replacement', replacementSchema);
