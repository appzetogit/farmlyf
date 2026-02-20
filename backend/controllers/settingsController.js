import Settings from '../models/Settings.js';

// @desc    Get setting by key
// @route   GET /api/settings/:key
// @access  Public
export const getSetting = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    if (setting) {
      res.json(setting);
    } else {
      // Return default if not found
      res.json({ key: req.params.key, value: '' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update or create setting
// @route   PUT /api/settings/:key
// @access  Private/Admin
export const updateSetting = async (req, res) => {
  const { value } = req.body;
  try {
    let setting = await Settings.findOne({ key: req.params.key });
    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = await Settings.create({ key: req.params.key, value });
    }
    res.json(setting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
