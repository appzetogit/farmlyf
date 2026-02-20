import mongoose from 'mongoose';

const websiteContentSchema = new mongoose.Schema({
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

export default mongoose.model('WebsiteContent', websiteContentSchema);
