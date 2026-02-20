import Return from '../models/Return.js';
import Order from '../models/Order.js';
import shiprocketService from '../utils/shiprocketService.js';
import asyncHandler from 'express-async-handler';

export const getReturns = async (req, res) => {
  try {
    const returns = await Return.find().sort({ createdAt: -1 });
    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReturn = asyncHandler(async (req, res) => {
  try {
    // Generate unique return ID
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    const returnId = `RET-${timestamp}-${randomSuffix}`;

    // Fetch original order for user/address info
    const originalOrder = await Order.findOne({ id: req.body.orderId });
    
    const newReturn = new Return({
      ...req.body,
      id: returnId,
      userName: originalOrder?.userName || originalOrder?.shippingAddress?.fullName || req.body.userName,
      requestDate: new Date(),
      status: 'Pending',
      pickupStatus: 'Not Scheduled'
    });

    const savedReturn = await newReturn.save();
    res.status(201).json(savedReturn);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Approve return and create Shiprocket return order
// @route   PUT /api/returns/:id/approve
// @access  Private/Admin
export const approveReturn = asyncHandler(async (req, res) => {
  try {
    const returnReq = await Return.findById(req.params.id);

    if (!returnReq) {
      return res.status(404).json({ message: 'Return request not found' });
    }

    if (returnReq.status !== 'Pending') {
      return res.status(400).json({ message: `Cannot approve return with status "${returnReq.status}"` });
    }

    // Fetch original order for Shiprocket
    const originalOrder = await Order.findOne({ id: returnReq.orderId });

    if (!originalOrder) {
      return res.status(404).json({ message: 'Original order not found' });
    }

    // Update status to Approved
    returnReq.status = 'Approved';
    returnReq.pickupStatusHistory.push({
      status: 'Approved',
      timestamp: new Date(),
      info: 'Return request approved by admin'
    });

    // Create return order in Shiprocket if configured
    if (shiprocketService.isConfigured()) {
      try {
        const shiprocketResponse = await shiprocketService.createReturnOrder(returnReq, originalOrder);

        if (shiprocketResponse && shiprocketResponse.order_id) {
          returnReq.shiprocketReturnId = shiprocketResponse.order_id;
          returnReq.shiprocketShipmentId = shiprocketResponse.shipment_id;
          returnReq.pickupStatus = 'Scheduled';

          // Try to get AWB
          if (shiprocketResponse.shipment_id) {
            try {
              const awbResponse = await shiprocketService.assignAWB(shiprocketResponse.shipment_id);
              if (awbResponse && awbResponse.response?.data) {
                returnReq.awbCode = awbResponse.response.data.awb_code;
                returnReq.courierName = awbResponse.response.data.courier_name;
              }
            } catch (awbError) {
              console.error('Return AWB assignment failed:', awbError.message);
            }
          }

          returnReq.pickupStatusHistory.push({
            status: 'Shiprocket Order Created',
            timestamp: new Date(),
            info: `Return order ${shiprocketResponse.order_id} created in Shiprocket`
          });
        }
      } catch (shiprocketError) {
        console.error('Shiprocket return order failed:', shiprocketError.message);
        // Continue with approval even if Shiprocket fails
        returnReq.pickupStatusHistory.push({
          status: 'Shiprocket Failed',
          timestamp: new Date(),
          info: shiprocketError.message
        });
      }
    } else {
      console.log('Shiprocket not configured, skipping return order creation');
    }

    await returnReq.save();

    res.json({
      message: 'Return approved successfully',
      return: returnReq
    });
  } catch (error) {
    console.error('Approve return error:', error.message);
    res.status(500).json({ message: 'Failed to approve return', error: error.message });
  }
});

export const getReturnById = asyncHandler(async (req, res) => {
  try {
    const returnReq = await Return.findById(req.params.id);
    if (returnReq) {
      res.json(returnReq);
    } else {
      res.status(404).json({ message: 'Return request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update return status
// @route   PUT /api/returns/:id
// @access  Private/Admin
export const updateReturn = asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;
    const returnReq = await Return.findById(req.params.id);

    if (returnReq) {
      const oldStatus = returnReq.status;
      returnReq.status = status;

      // Add to history
      returnReq.pickupStatusHistory.push({
        status: status,
        timestamp: new Date(),
        info: `Status changed from ${oldStatus} to ${status}`
      });

      // If status is Refunded, update refund info
      if (status === 'Refunded') {
        returnReq.refundStatus = 'processed';
        returnReq.refundProcessedAt = new Date();
      }

      const updatedReturn = await returnReq.save();
      res.json(updatedReturn);
    } else {
      res.status(404).json({ message: 'Return request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
