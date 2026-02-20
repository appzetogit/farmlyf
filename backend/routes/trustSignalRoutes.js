import express from 'express';
import { getTrustSignals, createTrustSignal, updateTrustSignal, deleteTrustSignal } from '../controllers/trustSignalController.js';

const router = express.Router();

router.get('/', getTrustSignals);
router.post('/', createTrustSignal);
router.put('/:id', updateTrustSignal);
router.delete('/:id', deleteTrustSignal);

export default router;
