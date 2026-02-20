import mongoose from 'mongoose';

const trustSignalSchema = new mongoose.Schema({
  icon: { type: String, required: true },
  topText: { type: String, required: true },
  bottomText: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('TrustSignal', trustSignalSchema);
