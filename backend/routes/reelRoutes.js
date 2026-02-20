import express from 'express';
import { getReels, createReel, deleteReel, updateReel } from '../controllers/reelController.js';

const router = express.Router();

router.route('/')
  .get(getReels)
  .post(createReel);

router.route('/:id')
  .put(updateReel)
  .delete(deleteReel);

export default router;
