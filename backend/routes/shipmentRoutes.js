import express from 'express';
import { shiprocketWebhook, getShippingQuote } from '../controllers/shipmentController.js';

const router = express.Router();

router.post('/quote', getShippingQuote);
router.post('/webhook', shiprocketWebhook);

export default router;
