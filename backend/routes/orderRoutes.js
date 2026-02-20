import express from 'express';
import { getOrders, getOrderStats, cancelOrder, updateOrder, getOrdersByUser } from '../controllers/orderController.js';
import { getTrackingDetails } from '../controllers/shipmentController.js';

const router = express.Router();

router.get('/', getOrders);
router.get('/stats', getOrderStats);
router.get('/user/:userId', getOrdersByUser);
router.get('/:orderId/tracking', getTrackingDetails);
router.post('/:orderId/cancel', cancelOrder);
router.put('/:orderId', updateOrder);

export default router;

