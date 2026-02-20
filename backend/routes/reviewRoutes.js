import express from 'express';
import {
    createReview,
    getProductReviews,
    getAllReviewsAdmin,
    updateReviewStatus,
    deleteReview,
    createAdminReview,
    getAdminReviews,
    updateAdminReview,
    getAdminTestimonials
} from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.get('/testimonials', getAdminReviews); // Public access
router.post('/', protect, createReview);
router.get('/', protect, admin, getAllReviewsAdmin);
router.get('/admin', protect, admin, getAllReviewsAdmin);
router.get('/admin/testimonials', protect, admin, getAdminTestimonials);
router.post('/admin', protect, admin, createAdminReview);
router.put('/admin/:id', protect, admin, updateAdminReview);
router.put('/:id/status', protect, admin, updateReviewStatus);
router.delete('/admin/:id', protect, admin, deleteReview);
router.delete('/:id', protect, admin, deleteReview);

export default router;
