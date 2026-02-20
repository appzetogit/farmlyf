import express from 'express';
import {
    getSubCategories,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory
} from '../controllers/subCategoryController.js';

const router = express.Router();

router.get('/', getSubCategories);
router.post('/', createSubCategory); // Protect in future
router.put('/:id', updateSubCategory); // Protect in future
router.delete('/:id', deleteSubCategory); // Protect in future

export default router;
