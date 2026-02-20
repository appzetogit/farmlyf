import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
import Product from '../models/Product.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    // Get product counts
    const categoriesWithCounts = await Promise.all(categories.map(async (cat) => {
      const count = await Product.countDocuments({ category: cat.slug });
      return {
        ...cat.toObject(),
        productCount: count
      };
    }));

    res.json(categoriesWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private (Admin)
export const createCategory = async (req, res) => {
  const { name, image, status, showInNavbar, showInShopByCategory } = req.body;

  try {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const category = new Category({
      name,
      slug,
      image,
      status: status || 'Active',
      showInNavbar,
      showInShopByCategory, // Keeping for now if schema re-adds it, else ignored
      order: req.body.order || 0
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = req.body.name || category.name;
      if (req.body.name) category.slug = req.body.name.toLowerCase().replace(/\s+/g, '-');
      category.image = req.body.image || category.image;
      category.status = req.body.status || category.status;
      category.showInNavbar = req.body.showInNavbar !== undefined ? req.body.showInNavbar : category.showInNavbar;
      category.showInShopByCategory = req.body.showInShopByCategory !== undefined ? req.body.showInShopByCategory : category.showInShopByCategory;
      category.order = req.body.order !== undefined ? req.body.order : category.order;

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      // Logic to handle subcategories? For now simple delete.
      await category.deleteOne();
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
