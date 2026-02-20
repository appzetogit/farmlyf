import HealthBenefitSection from '../models/HealthBenefitSection.js';

export const getHealthBenefitSection = async (req, res) => {
  try {
    const section = await HealthBenefitSection.findOne({ isActive: true });
    res.json(section || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHealthBenefitSection = async (req, res) => {
  try {
    console.log('Update Health Benefit Section called');

    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Sanitize benefits array: Remove _id from subdocuments to avoid Mongoose conflicts
    if (Array.isArray(updateData.benefits)) {
      updateData.benefits = updateData.benefits.map(benefit => {
        const { _id, id, ...cleanBenefit } = benefit;
        return cleanBenefit;
      });
    }

    let section = await HealthBenefitSection.findOne({});

    if (section) {
      console.log('Updating existing section:', section._id);

      // Manually update fields
      section.title = updateData.title || section.title;
      section.subtitle = updateData.subtitle || section.subtitle;
      section.benefits = updateData.benefits || section.benefits;
      section.isActive = updateData.isActive !== undefined ? updateData.isActive : section.isActive;

      await section.save();
    } else {
      console.log('Creating new health benefit section');
      section = new HealthBenefitSection(updateData);
      await section.save();
    }

    console.log('Successfully saved section. New title:', section.title);

    res.json(section);
  } catch (error) {
    console.error('Update Error:', error);
    res.status(400).json({ message: error.message });
  }
};
