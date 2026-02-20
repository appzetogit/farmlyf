import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false
  },
  video: {
    type: String, // URL or base64
    required: true
  },
  link: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Reel = mongoose.model('Reel', reelSchema);

export default Reel;
