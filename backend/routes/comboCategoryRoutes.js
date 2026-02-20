import express from 'express';
import {
    getComboCategories,
    createComboCategory,
    updateComboCategory,
    deleteComboCategory
} from '../controllers/comboCategoryController.js';

const router = express.Router();

router.get('/', getComboCategories);
router.post('/', createComboCategory);
router.put('/:id', updateComboCategory);
router.delete('/:id', deleteComboCategory);

export default router;
