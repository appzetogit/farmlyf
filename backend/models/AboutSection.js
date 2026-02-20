import mongoose from 'mongoose';

const aboutSectionSchema = new mongoose.Schema({
  sectionLabel: { type: String, default: 'Our Story' },
  title: { type: String, required: true },
  highlightedTitle: { type: String },
  description1: { type: String, required: true },
  description2: { type: String },
  image: { type: String, required: true },
  publicId: { type: String },
  stats: [{
    label: { type: String, required: true },
    value: { type: String, required: true }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('AboutSection', aboutSectionSchema);
