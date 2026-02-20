import express from 'express';
import { getSetting, updateSetting } from '../controllers/settingsController.js';

const router = express.Router();

router.get('/:key', getSetting);
router.put('/:key', updateSetting);

export default router;
