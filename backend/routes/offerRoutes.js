import express from 'express';
import {
  createOffer,
  getAllOffers,
  getOfferBySlug,
  getOfferById,
  updateOffer,
  deleteOffer
} from '../controllers/offerController.js';

const router = express.Router();

router.route('/')
  .post(createOffer)
  .get(getAllOffers);

router.get('/slug/:slug', getOfferBySlug);

router.route('/:id')
  .get(getOfferById)
  .put(updateOffer)
  .delete(deleteOffer);

export default router;
