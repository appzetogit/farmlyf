import express from 'express';
import { getHealthBenefitSection, updateHealthBenefitSection } from '../controllers/healthBenefitSectionController.js';

const router = express.Router();

router.get('/', getHealthBenefitSection);
router.put('/', updateHealthBenefitSection);

export default router;
