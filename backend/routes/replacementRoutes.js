import express from 'express';
import { 
  getReplacements, 
  getReplacement, 
  createReplacement, 
  updateReplacement, 
  approveReplacement,
  shipReplacement 
} from '../controllers/replacementController.js';

const router = express.Router();

router.get('/', getReplacements);
router.get('/:id', getReplacement);
router.post('/', createReplacement);
router.put('/:id', updateReplacement);
router.put('/:id/approve', approveReplacement);
router.put('/:id/ship', shipReplacement);

export default router;
