import SubCategory from '../models/SubCategory.js';

import Product from '../models/Product.js';

// Get all sub-categories
export const getSubCategories = async (req, res) => {
    try {
        const subs = await SubCategory.find().populate('parent', 'name');

        // Get product counts
        const subsWithCounts = await Promise.all(subs.map(async (sub) => {
            const count = await Product.countDocuments({ subcategory: sub.slug });
            return {
                ...sub.toObject(),
                productCount: count
            };
        }));

        res.json(subsWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new sub-category
export const createSubCategory = async (req, res) => {
    try {
        const { name, slug, parent, status, showInShopByCategory, image, description } = req.body;
        // Basic slug generation if not provided
        const finalSlug = slug || name.toLowerCase().replace(/ /g, '-');

        const newSub = new SubCategory({
            name,
            slug: finalSlug,
            parent, // ID of Category
            status,
            showInShopByCategory,
            image,
            description
        });

        await newSub.save();
        res.status(201).json(newSub);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update sub-category
export const updateSubCategory = async (req, res) => {
    try {
        const { name, slug, parent, status, showInShopByCategory, image, description } = req.body;
        const sub = await SubCategory.findById(req.params.id);

        if (sub) {
            sub.name = name || sub.name;
            if (slug) sub.slug = slug;
            if (parent) sub.parent = parent;
            if (status) sub.status = status;
            if (showInShopByCategory !== undefined) sub.showInShopByCategory = showInShopByCategory;
            if (image !== undefined) sub.image = image;
            if (description !== undefined) sub.description = description;

            const updatedSub = await sub.save();
            res.json(updatedSub);
        } else {
            res.status(404).json({ message: 'SubCategory not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete sub-category
export const deleteSubCategory = async (req, res) => {
    try {
        const sub = await SubCategory.findById(req.params.id);
        if (sub) {
            await sub.deleteOne();
            res.json({ message: 'SubCategory removed' });
        } else {
            res.status(404).json({ message: 'SubCategory not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
