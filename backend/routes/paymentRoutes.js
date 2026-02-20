import express from 'express';
import { createRazorpayOrder, verifyPayment, createCODOrder } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/order', createRazorpayOrder);
router.post('/verify', verifyPayment);
router.post('/cod', createCODOrder);

export default router;
