import asyncHandler from 'express-async-handler';
import shiprocketService from '../utils/shiprocketService.js';
import Order from '../models/Order.js';
import { restockItems } from '../utils/stockUtils.js';

// @desc    Get shipping quote for checkout
// @route   POST /api/shipments/quote
// @access  Public
export const getShippingQuote = asyncHandler(async (req, res) => {
  const {
    deliveryPincode,
    paymentMethod = 'cod',
    items = [],
    orderAmount = 0,
    packageDimensions = {}
  } = req.body || {};

  if (!deliveryPincode) {
    return res.status(400).json({ message: 'Delivery pincode is required' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Cart items are required to calculate shipping' });
  }

  const quote = await shiprocketService.getShippingQuote({
    deliveryPincode,
    paymentMethod,
    items,
    orderAmount,
    packageDimensions
  });

  res.json(quote);
});

// @desc    Get tracking details for an order
// @route   GET /api/orders/:orderId/tracking
// @access  Public
export const getTrackingDetails = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({ id: orderId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.awbCode) {
      return res.status(400).json({ 
        message: 'Tracking not available yet',
        order: {
          id: order.id,
          status: order.status,
          shiprocketOrderId: order.shiprocketOrderId
        }
      });
    }

    // Get live tracking from Shiprocket
    const trackingData = await shiprocketService.trackShipment(order.awbCode);

    res.json({
      orderId: order.id,
      awbCode: order.awbCode,
      courierName: order.courierName,
      status: order.status,
      tracking: trackingData
    });
  } catch (error) {
    console.error('Tracking Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch tracking details', error: error.message });
  }
});

// @desc    Shiprocket webhook handler for status updates
// @route   POST /api/shipments/webhook
// @access  Public (but should be validated with Shiprocket signature in production)
export const shiprocketWebhook = asyncHandler(async (req, res) => {
  const webhookData = req.body;

  try {
    // Find order by AWB code or Shiprocket order ID
    const order = await Order.findOne({
      $or: [
        { awbCode: webhookData.awb },
        { shiprocketOrderId: webhookData.order_id }
      ]
    });

    if (!order) {
      console.log('Order not found for webhook:', webhookData);
      return res.status(200).json({ message: 'Order not found, ignoring webhook' });
    }

    // Update order status based on webhook event
    const statusMapping = {
      'PICKUP_COMPLETE': 'Shipped',
      'IN_TRANSIT': 'Shipped',
      'OUT_FOR_DELIVERY': 'OutForDelivery',
      'DELIVERED': 'Delivered',
      'RTO_INITIATED': 'ReturnInitiated',
      'RTO_DELIVERED': 'Returned',
      'CANCELLED': 'Cancelled'
    };

    const newStatus = statusMapping[webhookData.current_status];
    if (newStatus && newStatus !== order.status) {
      const oldStatus = order.status;
      order.status = newStatus;
      order.deliveryStatus = newStatus;

      // Restock if cancelled
      if (newStatus === 'Cancelled' && oldStatus !== 'Cancelled') {
          if (order.items && order.items.length > 0) {
              await restockItems(order.items);
          }
      }

      order.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        info: webhookData.current_status_remark || webhookData.current_status
      });
    }

    // Update tracking info if available
    if (webhookData.estimated_delivery_date) {
      order.estimatedDelivery = new Date(webhookData.estimated_delivery_date);
    }

    await order.save();

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook Error:', error.message);
    res.status(500).json({ message: 'Webhook processing failed', error: error.message });
  }
});
