import WebsiteContent from '../models/WebsiteContent.js';

export const getContentBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const content = await WebsiteContent.findOne({ slug });
    res.json(content || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateContentBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content, isActive, metadata } = req.body;
    
    console.log('Update Content Request:', { slug, body: req.body });

    const updateData = { 
      title, 
      content, 
      isActive: isActive !== undefined ? isActive : true
    };

    if (metadata) {
      updateData.metadata = metadata;
    }

    const updatedContent = await WebsiteContent.findOneAndUpdate(
      { slug },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    console.log('Content Updated Successfully:', updatedContent.slug);
    res.json(updatedContent);
  } catch (error) {
    console.error('Error Updating Content:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getAllContents = async (req, res) => {
  try {
    const contents = await WebsiteContent.find({});
    res.json(contents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteContentBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    await WebsiteContent.findOneAndDelete({ slug });
    res.json({ message: `Content with slug ${slug} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
