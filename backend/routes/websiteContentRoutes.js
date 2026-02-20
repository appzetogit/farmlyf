import express from 'express';
import { 
  getContentBySlug, 
  updateContentBySlug, 
  getAllContents, 
  deleteContentBySlug 
} from '../controllers/websiteContentController.js';

const router = express.Router();

router.get('/', getAllContents);
router.get('/:slug', getContentBySlug);
router.put('/:slug', updateContentBySlug);
router.delete('/:slug', deleteContentBySlug);

export default router;
