import express from 'express';
import { getPromoCard, updatePromoCard } from '../controllers/promoCardController.js';

const router = express.Router();

router.get('/', getPromoCard);
router.put('/', updatePromoCard);

export default router;
