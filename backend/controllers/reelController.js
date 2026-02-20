import Reel from '../models/Reel.js';

// @desc    Get all reels
// @route   GET /api/reels
// @access  Public
export const getReels = async (req, res) => {
  try {
    const reels = await Reel.find().sort({ createdAt: -1 });
    res.json(reels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a reel
// @route   POST /api/reels
// @access  Private/Admin
export const createReel = async (req, res) => {
  try {
    const newReel = new Reel(req.body);
    const savedReel = await newReel.save();
    res.status(201).json(savedReel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a reel
// @route   DELETE /api/reels/:id
// @access  Private/Admin
export const deleteReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (reel) {
      await reel.deleteOne();
      res.json({ message: 'Reel removed' });
    } else {
      res.status(404).json({ message: 'Reel not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a reel
// @route   PUT /api/reels/:id
// @access  Private/Admin
export const updateReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (reel) {
      reel.title = req.body.title || reel.title;
      reel.video = req.body.video || reel.video;
      reel.link = req.body.link || reel.link;
      
      const updatedReel = await reel.save();
      res.json(updatedReel);
    } else {
      res.status(404).json({ message: 'Reel not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
