import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  qty: Number,
  price: Number,
  image: String,
  weight: String,
  productId: String
});

const statusHistorySchema = new mongoose.Schema({
  status: String,
  timestamp: Date,
  info: String
});

const orderSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // Custom ID: "ORD-..."
  userId: String,
  userName: String,
  date: Date,
  status: { type: String, default: 'pending' },
  deliveryStatus: { type: String, default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: Number,
  subtotal: Number,
  deliveryCharges: { type: Number, default: 0 },
  paymentMethod: String,
  courierPartner: String,
  trackingId: String,
  shiprocketOrderId: Number,
  shiprocketShipmentId: Number,
  awbCode: String,
  courierName: String,
  estimatedDelivery: Date,
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  appliedCoupon: String, // Coupon or Referral code
  discount: { type: Number, default: 0 }, // Discount amount
  shippingQuote: {
    source: String,
    courierName: String,
    courierId: String,
    estimatedDays: Number,
    shippingCharge: Number,
    weight: Number
  },
  statusHistory: [statusHistorySchema],
  // Cancellation and refund fields
  refundId: String,
  refundStatus: { type: String, enum: ['pending', 'processed', 'failed', 'not_applicable'], default: 'not_applicable' },
  refundAmount: Number,
  cancelledAt: Date,
  cancellationReason: String
}, { timestamps: true });


export default mongoose.model('Order', orderSchema);
