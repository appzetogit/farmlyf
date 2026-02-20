import FeaturedSection from '../models/FeaturedSection.js';

export const getFeaturedSections = async (req, res) => {
  try {
    const sections = await FeaturedSection.find({}).populate('products').sort({ order: 1 });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeaturedSectionByName = async (req, res) => {
  try {
    const section = await FeaturedSection.findOne({ name: req.params.name }).populate('products');
    if (section) {
      res.json(section);
    } else {
      res.status(404).json({ message: 'Section not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createFeaturedSection = async (req, res) => {
  try {
    const section = await FeaturedSection.create(req.body);
    res.status(201).json(section);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateFeaturedSection = async (req, res) => {
  try {
    const section = await FeaturedSection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(section);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteFeaturedSection = async (req, res) => {
  try {
    await FeaturedSection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Section deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
