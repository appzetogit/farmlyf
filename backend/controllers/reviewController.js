import Review from '../models/Review.js';
import Product from '../models/Product.js';

// @desc    Get reviews for a product (Approved only)
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
    try {
        // We expect custom productId in params (e.g. "prod_001")
        // But if it's an ObjectId string, we need to handle that?
        // Let's assume params is the custom ID or we resolve it.

        let targetId = req.params.productId;

        // Verify product exists and get its custom ID just in case
        let product = await Product.findOne({ id: targetId });
        if (!product) product = await Product.findById(targetId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const reviews = await Review.aggregate([
            {
                $match: {
                    product: product._id, // Match on ObjectId
                    status: 'Approved'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: 'id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true }
            },
            { $sort: { createdAt: -1 } }
        ]);

        const formattedReviews = reviews.map(r => ({
            _id: r._id,
            rating: r.rating,
            title: r.title,
            comment: r.comment,
            createdAt: r.createdAt,
            user: {
                name: r.user === 'admin_01' ? 'Team Farmly' : (r.userDetails?.name || 'Anonymous'),
                email: r.userDetails?.email,
                id: r.userDetails?.id,
                isBanned: r.userDetails?.isBanned
            }
        }));

        res.json(formattedReviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
    try {
        const { productId, rating, title, comment, images } = req.body;

        // Find product by custom ID or _id
        let product = await Product.findOne({ id: productId });
        if (!product) {
            product = await Product.findById(productId);
        }

        if (!product) return res.status(404).json({ message: 'Product not found' });

        const review = new Review({
            user: req.user.id, // Use custom String ID
            product: product._id, // Use ObjectId for product
            rating,
            title,
            comment,
            images,
            status: 'Pending'
        });

        await review.save();

        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews/admin
// @access  Private/Admin
export const getAllReviewsAdmin = async (req, res) => {
    try {
        const reviews = await Review.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: 'id',
                    as: 'userDetails'
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    _id: 1,
                    rating: 1,
                    title: 1,
                    comment: 1,
                    status: 1,
                    createdAt: 1,
                    user: {
                        name: { $ifNull: ['$userDetails.name', 'Admin/Unknown'] },
                        email: '$userDetails.email',
                        id: '$userDetails.id',
                        isBanned: '$userDetails.isBanned'
                    },
                    product: {
                        name: '$productDetails.name',
                        image: '$productDetails.image',
                        id: '$productDetails.id'
                    }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update review status (Admin)
// @route   PUT /api/reviews/:id/status
// @access  Private/Admin
export const updateReviewStatus = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (review) {
            review.status = req.body.status;
            const updatedReview = await review.save();
            res.json(updatedReview);
        } else {
            res.status(404).json({ message: 'Review not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete review (Admin)
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (review) {
            await review.deleteOne();
            res.json({ message: 'Review removed' });
        } else {
            res.status(404).json({ message: 'Review not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get all admin reviews (Testimonials for homepage) - Public
// @route   GET /api/reviews/testimonials
// @access  Public
export const getAdminReviews = async (req, res) => {
    try {
        // Public only sees Active or Approved
        const reviews = await Review.find({ 
            product: null, 
            status: { $in: ['Active', 'Approved'] } 
        }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all testimonials (Admin)
// @route   GET /api/reviews/admin/testimonials
// @access  Private/Admin
export const getAdminTestimonials = async (req, res) => {
    try {
        // Admin sees everything
        const reviews = await Review.find({ product: null }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create an admin review (Homepage Testimonial)
// @route   POST /api/reviews/admin
// @access  Private/Admin
export const createAdminReview = async (req, res) => {
    try {
        const { name, comment, image, rating, status } = req.body;

        const review = new Review({
            user: req.user.id,
            name,
            comment,
            image,
            rating: rating || 5,
            status: status || 'Active'
        });

        await review.save();
        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update an admin review
// @route   PUT /api/reviews/admin/:id
// @access  Private/Admin
export const updateAdminReview = async (req, res) => {
    try {
        const { name, comment, image, rating, status } = req.body;
        const review = await Review.findById(req.params.id);

        if (review) {
            review.name = name || review.name;
            review.comment = comment || review.comment;
            review.image = image || review.image;
            review.rating = rating || review.rating;
            review.status = status || review.status;

            const updatedReview = await review.save();
            res.json(updatedReview);
        } else {
            res.status(404).json({ message: 'Review not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
