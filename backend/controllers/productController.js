import Product from '../models/Product.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product by ID or Slug
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    try {
        // Try finding by _id, then custom ID, then by slug
        let product;
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            product = await Product.findById(req.params.id);
        }
        
        if (!product) {
            product = await Product.findOne({ id: req.params.id });
        }
        
        if (!product) {
            product = await Product.findOne({ slug: req.params.id });
        }

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    try {
        let product;
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            product = await Product.findById(req.params.id);
        }
        if (!product) {
            product = await Product.findOne({ id: req.params.id });
        }

        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    try {
        const productData = { ...req.body };
        if (productData.name && !productData.slug) {
            productData.slug = productData.name.trim().toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
        }
        const product = new Product(productData);
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
    try {
        let product;
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            product = await Product.findById(req.params.id);
        }
        if (!product) {
            product = await Product.findOne({ id: req.params.id });
        }

        if (product) {
            // Strip fields that shouldn't be manually updated
            const { _id, __v, createdAt, ...updateData } = req.body;
            
            // Auto-update slug if name changes and NO slug is provided in updateData
            if (updateData.name && !updateData.slug) {
                updateData.slug = updateData.name.trim().toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
            }

            Object.assign(product, updateData);
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Update product error:', error);
        res.status(400).json({ message: error.message });
    }
};
