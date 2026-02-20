import express from 'express';
import { getReturns, getReturnById, createReturn, updateReturn, approveReturn } from '../controllers/returnController.js';

const router = express.Router();

router.get('/', getReturns);
router.get('/:id', getReturnById);
router.post('/', createReturn);
router.put('/:id', updateReturn);
router.put('/:id/approve', approveReturn);

export default router;
