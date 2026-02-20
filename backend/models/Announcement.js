import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  text: { type: String, required: true },
  link: { type: String },
  isActive: { type: Boolean, default: true },
  position: { type: String, enum: ['topbar', 'marquee'], default: 'marquee' },
  backgroundColor: { type: String, default: '#0F172A' },
  textColor: { type: String, default: '#FFFFFF' }
}, { timestamps: true });

export default mongoose.model('Announcement', announcementSchema);
