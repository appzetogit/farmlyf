import express from 'express';
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon
} from '../controllers/couponController.js';

const router = express.Router();

router.route('/')
  .post(createCoupon)
  .get(getAllCoupons);

router.post('/validate', validateCoupon);

router.route('/:id')
  .get(getCouponById)
  .put(updateCoupon)
  .delete(deleteCoupon);

export default router;
