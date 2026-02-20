import express from 'express';
import { getFeaturedSections, getFeaturedSectionByName, createFeaturedSection, updateFeaturedSection, deleteFeaturedSection } from '../controllers/featuredSectionController.js';

const router = express.Router();

router.get('/', getFeaturedSections);
router.get('/:name', getFeaturedSectionByName);
router.post('/', createFeaturedSection);
router.put('/:id', updateFeaturedSection);
router.delete('/:id', deleteFeaturedSection);

export default router;
