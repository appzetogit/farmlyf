import AboutSection from '../models/AboutSection.js';

export const getAboutSection = async (req, res) => {
  try {
    const section = await AboutSection.findOne({ isActive: true });
    res.json(section || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAboutSection = async (req, res) => {
  try {
    let section = await AboutSection.findOne({});
    if (section) {
      section = await AboutSection.findByIdAndUpdate(section._id, req.body, { new: true });
    } else {
      section = await AboutSection.create(req.body);
    }
    res.json(section);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
