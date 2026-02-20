import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ['Customer', 'Delivery', 'Admin'],
    default: 'Customer',
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index to automatically delete expired OTPs
  }
}, { timestamps: true });

export default mongoose.model('Otp', otpSchema);
