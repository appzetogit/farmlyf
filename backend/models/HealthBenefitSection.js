import mongoose from 'mongoose';

const healthBenefitSectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  benefits: [{
    icon: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    baseColor: { type: String, default: '#006071' }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('HealthBenefitSection', healthBenefitSectionSchema);
