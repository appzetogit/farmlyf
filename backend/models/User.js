import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  id: Number,
  type: String,
  fullName: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  isDefault: Boolean
});

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // Custom ID: "user_123"
  name: String,
  email: { type: String, unique: true },
  phone: String,
  gender: String,
  birthDate: String,
  password: String,
  addresses: [addressSchema],
  wishlist: [String],
  usedCoupons: [String],
  accountType: { type: String, enum: ['Individual', 'Business'], default: 'Individual' },
  gstNumber: String, // Optional GST number for business accounts
  isBanned: { type: Boolean, default: false },
  fcmToken: String // FCM device token for push notifications
}, { timestamps: true });

export default mongoose.model('User', userSchema);
