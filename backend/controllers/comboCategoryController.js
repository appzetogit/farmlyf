import ComboCategory from '../models/ComboCategory.js';

// Get all combo categories
export const getComboCategories= async (req, res) => {
    try {
        const categories = await ComboCategory.find().sort({ order: 1, createdAt: -1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new combo category
export const createComboCategory = async (req, res) => {
    try {
        const { name, slug, image, description, status, order } = req.body;
        
        // Basic slug generation if not provided
        const finalSlug = slug || name.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');

        const newCategory = new ComboCategory({
            name,
            slug: finalSlug,
            image,
            description,
            status,
            order
        });

        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update combo category
export const updateComboCategory = async (req, res) => {
    try {
        const { name, slug, image, description, status, order } = req.body;
        const category = await ComboCategory.findById(req.params.id);

        if (category) {
            category.name = name || category.name;
            if (slug) category.slug = slug;
            if (image !== undefined) category.image = image;
            if (description !== undefined) category.description = description;
            if (status) category.status = status;
            if (order !== undefined) category.order = order;

            const updatedCategory = await category.save();
            res.json(updatedCategory);
        } else {
            res.status(404).json({ message: 'Combo category not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete combo category
export const deleteComboCategory = async (req, res) => {
    try {
        const category = await ComboCategory.findById(req.params.id);
        if (category) {
            await category.deleteOne();
            res.json({ message: 'Combo category removed' });
        } else {
            res.status(404).json({ message: 'Combo category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
