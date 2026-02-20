import Order from '../models/Order.js';
import Referral from '../models/Referral.js';
import Product from '../models/Product.js';
import { restockItems } from '../utils/stockUtils.js';
import Razorpay from 'razorpay';
import shiprocketService from '../utils/shiprocketService.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

// Initialize Razorpay for refunds
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'placeholder_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();

    // Map stats to a more friendly format
    const statsMap = {
      All: totalOrders,
      Processing: 0,
      Received: 0,
      Processed: 0,
      Shipped: 0,
      OutForDelivery: 0,
      Delivered: 0,
      Cancelled: 0
    };

    stats.forEach(item => {
      // Normalize 'pending' to 'Processing'
      if (item._id === 'pending') {
        statsMap.Processing += item.count;
      } else if (statsMap.hasOwnProperty(item._id)) {
        statsMap[item._id] = item.count;
      } else {
        // Fallback for case sensitivity or unknown statuses
        const normalizedKey = item._id.charAt(0).toUpperCase() + item._id.slice(1);
        if (statsMap.hasOwnProperty(normalizedKey)) {
          statsMap[normalizedKey] = item.count;
        }
      }
    });

    res.json(statsMap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel an order
// @route   POST /api/orders/:orderId/cancel
// @access  Public (should be authenticated in production)
export const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  try {
    // Find order by custom ID or MongoDB _id (avoid cast error on non-ObjectId)
    let order = await Order.findOne({ id: orderId });
    if (!order && Order.isValidObjectId(orderId)) {
      order = await Order.findById(orderId);
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be cancelled (only pending/processing orders)
    const cancellableStatuses = ['pending', 'Processing', 'Received', 'Processed'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({ 
        message: `Cannot cancel order with status "${order.status}". Only orders that haven't been shipped can be cancelled.` 
      });
    }

    // Already cancelled check
    if (order.status === 'Cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    let shiprocketCancelled = false;
    let refundInitiated = false;
    let refundId = null;
    let refundStatus = 'not_applicable';

    // 1. Cancel in Shiprocket if order exists there
    if (order.shiprocketOrderId && shiprocketService.isConfigured()) {
      try {
        await shiprocketService.cancelOrder(order.shiprocketOrderId);
        shiprocketCancelled = true;
        console.log(`Shiprocket order ${order.shiprocketOrderId} cancelled successfully`);
      } catch (shiprocketError) {
        console.error('Shiprocket cancellation failed:', shiprocketError.message);
        // Continue with local cancellation even if Shiprocket fails
      }
    }

    // 2. Initiate Razorpay refund if payment was made online
    if (order.razorpayPaymentId && order.paymentStatus === 'paid') {
      try {
        const refundAmount = order.amount * 100; // Convert to paise
        const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
          amount: refundAmount,
          speed: 'normal', // 'normal' (5-7 days) or 'optimum' (instant if eligible)
          notes: {
            order_id: order.id,
            reason: reason || 'Customer requested cancellation'
          }
        });

        refundId = refund.id;
        refundStatus = 'pending'; // Refund initiated, pending processing
        refundInitiated = true;
        console.log(`Razorpay refund initiated: ${refund.id} for ₹${order.amount}`);
      } catch (refundError) {
        console.error('Razorpay refund failed:', refundError.message);
        refundStatus = 'failed';
        // Continue with cancellation but mark refund as failed
      }
    } else if (order.paymentMethod === 'cod') {
      refundStatus = 'not_applicable'; // COD orders don't need refund
    }

    // 3. Update order in database
    order.status = 'Cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Customer requested cancellation';
    order.refundId = refundId;
    order.refundStatus = refundStatus;
    order.refundAmount = refundInitiated ? order.amount : null;

    // 4. Decrement Referral Stats if a coupon/code was used
    if (order.appliedCoupon) {
        try {
            const referral = await Referral.findOne({ code: order.appliedCoupon });
            if (referral) {
                referral.usageCount = Math.max(0, (referral.usageCount || 0) - 1);
                // Deduct the gross amount from totalSales
                const saleAmount = order.amount + (order.discount || 0);
                referral.totalSales = Math.max(0, (referral.totalSales || 0) - saleAmount);
                await referral.save();
                console.log(`Referral stats updated for code ${order.appliedCoupon}: usageCount=${referral.usageCount}, totalSales=${referral.totalSales}`);
            }
        } catch (referralError) {
            console.error('Failed to update referral stats on cancellation:', referralError.message);
        }
    }

    // 5. Restock Items
    if (order.items && order.items.length > 0) {
        await restockItems(order.items);
    }

    // Add to status history
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      info: `Order cancelled by customer. ${shiprocketCancelled ? 'Shiprocket notified. ' : ''}${refundInitiated ? `Refund of ₹${order.amount} initiated (ID: ${refundId})` : ''}`
    });

    await order.save();

    res.status(200).json({
      message: 'Order cancelled successfully',
      orderId: order.id,
      shiprocketCancelled,
      refund: {
        initiated: refundInitiated,
        id: refundId,
        status: refundStatus,
        amount: refundInitiated ? order.amount : null
      }
    });

  } catch (error) {
    console.error('Order cancellation error:', error.message);
    res.status(500).json({ message: 'Failed to cancel order', error: error.message });
  }
});
// @desc    Get orders for a specific user
// @route   GET /api/orders/user/:userId
// @access  Private/Admin
export const getOrdersByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get User Orders Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch user orders', error: error.message });
  }
});

// @desc    Update an order (status, delivery status, etc.)
// @route   PUT /api/orders/:orderId
// @access  Private/Admin
export const updateOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, deliveryStatus, paymentStatus, awbCode, courierName, trackingId } = req.body;

  try {
    let order = await Order.findOne({ id: orderId });
    if (!order && mongoose.isValidObjectId(orderId)) {
      order = await Order.findById(orderId);
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update fields if provided
    if (status) order.status = status;
    if (deliveryStatus) order.deliveryStatus = deliveryStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (awbCode) order.awbCode = awbCode;
    if (courierName) order.courierName = courierName;
    if (trackingId) order.trackingId = trackingId;

    // Add to status history if status changed
    if (status && status !== order.status) {
      const oldStatus = order.status;
      order.status = status;

      // Restock if status changed to Cancelled
      if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
          if (order.items && order.items.length > 0) {
              await restockItems(order.items);
          }
      }

      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: status,
        timestamp: new Date(),
        info: `Order status manually updated to ${status}`
      });
    }

    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Update Order Error:', error.message);
    res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
});
