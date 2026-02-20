import express from 'express';
import { getAboutSection, updateAboutSection } from '../controllers/aboutSectionController.js';

const router = express.Router();

router.get('/', getAboutSection);
router.put('/', updateAboutSection);

export default router;
