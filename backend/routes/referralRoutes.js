import express from 'express';
import {
    createReferral,
    getReferrals,
    getReferralById,
    updateReferral,
    deleteReferral,
    addPayout,
    validateReferral,
    getReferralOrders
} from '../controllers/referralController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, admin, getReferrals)
    .post(protect, admin, createReferral);

router.route('/:id')
    .get(protect, admin, getReferralById)
    .put(protect, admin, updateReferral)
    .delete(protect, admin, deleteReferral);

router.route('/validate')
    .post(protect, validateReferral);

router.route('/:id/orders')
    .get(protect, admin, getReferralOrders);

router.route('/:id/payout')
    .post(protect, admin, addPayout);

export default router;
