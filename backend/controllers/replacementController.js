import asyncHandler from 'express-async-handler';
import Replacement from '../models/Replacement.js';
import Order from '../models/Order.js';
import shiprocketService from '../utils/shiprocketService.js';

// @desc    Get all replacements
// @route   GET /api/replacements
export const getReplacements = asyncHandler(async (req, res) => {
  const replacements = await Replacement.find().sort({ createdAt: -1 });
  res.json(replacements);
});

// @desc    Get single replacement
// @route   GET /api/replacements/:id
export const getReplacement = asyncHandler(async (req, res) => {
  const replacement = await Replacement.findById(req.params.id);
  if (!replacement) {
    return res.status(404).json({ message: 'Replacement not found' });
  }
  res.json(replacement);
});

// @desc    Create replacement request
// @route   POST /api/replacements
export const createReplacement = asyncHandler(async (req, res) => {
  try {
    // Generate unique ID
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    const replacementId = `RPL-${timestamp}-${randomSuffix}`;

    // Fetch original order for user/address info
    const originalOrder = await Order.findOne({ id: req.body.orderId });
    
    const newReplacement = new Replacement({
      ...req.body,
      id: replacementId,
      userName: originalOrder?.userName || originalOrder?.shippingAddress?.fullName || req.body.userName,
      userEmail: originalOrder?.userEmail || req.body.userEmail,
      userPhone: originalOrder?.shippingAddress?.phone || req.body.userPhone,
      pickupAddress: req.body.pickupAddress || originalOrder?.shippingAddress,
      deliveryAddress: req.body.deliveryAddress || originalOrder?.shippingAddress,
      requestDate: new Date(),
      status: 'Pending',
      pickupStatus: 'Not Scheduled',
      shipmentStatus: 'Not Shipped',
      statusHistory: [{
        status: 'Pending',
        timestamp: new Date(),
        info: 'Replacement request submitted'
      }]
    });

    const savedReplacement = await newReplacement.save();
    res.status(201).json(savedReplacement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Approve replacement and create Shiprocket pickup
// @route   PUT /api/replacements/:id/approve
export const approveReplacement = asyncHandler(async (req, res) => {
  try {
    const replacement = await Replacement.findById(req.params.id);

    if (!replacement) {
      return res.status(404).json({ message: 'Replacement not found' });
    }

    if (replacement.status !== 'Pending') {
      return res.status(400).json({ message: `Cannot approve replacement with status "${replacement.status}"` });
    }

    // Fetch original order for Shiprocket
    const originalOrder = await Order.findOne({ id: replacement.orderId });

    // Update status to Approved
    replacement.status = 'Approved';
    replacement.approvedAt = new Date();
    replacement.statusHistory.push({
      status: 'Approved',
      timestamp: new Date(),
      info: 'Replacement request approved by admin'
    });

    // Create return pickup order in Shiprocket if configured
    if (shiprocketService.isConfigured()) {
      try {
        const shiprocketResponse = await shiprocketService.createReturnOrder({
          id: replacement.id,
          items: replacement.originalItems,
          requestDate: replacement.requestDate
        }, originalOrder || {
          shippingAddress: replacement.pickupAddress,
          userName: replacement.userName,
          userEmail: replacement.userEmail
        });

        if (shiprocketResponse && shiprocketResponse.order_id) {
          replacement.shiprocketPickupId = shiprocketResponse.order_id;
          replacement.shiprocketPickupShipmentId = shiprocketResponse.shipment_id;
          replacement.pickupStatus = 'Scheduled';
          replacement.status = 'Pickup Scheduled';

          // Try to get AWB
          if (shiprocketResponse.shipment_id) {
            try {
              const awbResponse = await shiprocketService.assignAWB(shiprocketResponse.shipment_id);
              if (awbResponse && awbResponse.response?.data) {
                replacement.pickupAwbCode = awbResponse.response.data.awb_code;
                replacement.pickupCourierName = awbResponse.response.data.courier_name;
              }
            } catch (awbError) {
              console.error('Replacement pickup AWB assignment failed:', awbError.message);
            }
          }

          replacement.statusHistory.push({
            status: 'Pickup Scheduled',
            timestamp: new Date(),
            info: `Pickup order ${shiprocketResponse.order_id} created in Shiprocket`
          });
        }
      } catch (shiprocketError) {
        console.error('Shiprocket pickup order failed:', shiprocketError.message);
        replacement.statusHistory.push({
          status: 'Shiprocket Failed',
          timestamp: new Date(),
          info: shiprocketError.message
        });
      }
    }

    await replacement.save();

    res.json({
      message: 'Replacement approved successfully',
      replacement
    });
  } catch (error) {
    console.error('Approve replacement error:', error.message);
    res.status(500).json({ message: 'Failed to approve replacement', error: error.message });
  }
});

// @desc    Update replacement status
// @route   PUT /api/replacements/:id
export const updateReplacement = asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;
    const replacement = await Replacement.findById(req.params.id);

    if (!replacement) {
      return res.status(404).json({ message: 'Replacement not found' });
    }

    const oldStatus = replacement.status;
    replacement.status = status;

    // Add to history
    replacement.statusHistory.push({
      status: status,
      timestamp: new Date(),
      info: `Status changed from ${oldStatus} to ${status}`
    });

    // Special handling for different statuses
    if (status === 'Pickup Completed') {
      replacement.pickupStatus = 'Delivered';
    } else if (status === 'Replacement Shipped') {
      replacement.shipmentStatus = 'Shipped';
    } else if (status === 'Delivered') {
      replacement.shipmentStatus = 'Delivered';
      replacement.completedAt = new Date();
    }

    const updatedReplacement = await replacement.save();
    res.json(updatedReplacement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Ship replacement (create new order in Shiprocket)
// @route   PUT /api/replacements/:id/ship
export const shipReplacement = asyncHandler(async (req, res) => {
  try {
    const replacement = await Replacement.findById(req.params.id);

    if (!replacement) {
      return res.status(404).json({ message: 'Replacement not found' });
    }

    if (!['Approved', 'Pickup Scheduled', 'Pickup Completed'].includes(replacement.status)) {
      return res.status(400).json({ message: `Cannot ship replacement with status "${replacement.status}"` });
    }

    // Create shipment in Shiprocket for replacement item
    if (shiprocketService.isConfigured()) {
      try {
        // Build order for replacement shipment
        const shipmentOrder = {
          order_id: `${replacement.id}-SHIP`,
          order_date: new Date().toISOString().split('T')[0],
          billing_customer_name: replacement.userName,
          billing_address: replacement.deliveryAddress?.address,
          billing_city: replacement.deliveryAddress?.city,
          billing_state: replacement.deliveryAddress?.state,
          billing_pincode: replacement.deliveryAddress?.pincode,
          billing_email: replacement.userEmail,
          billing_phone: replacement.deliveryAddress?.phone || replacement.userPhone,
          shipping_is_billing: true,
          order_items: replacement.replacementItems.map(item => ({
            name: item.name,
            sku: item.sku,
            units: item.qty,
            selling_price: 0,
          })),
          payment_method: 'Prepaid',
          sub_total: 0,
          length: 10,
          breadth: 10,
          height: 10,
          weight: 0.5,
        };

        const shiprocketResponse = await shiprocketService.createOrder(shipmentOrder);

        if (shiprocketResponse && shiprocketResponse.order_id) {
          replacement.shiprocketShipmentId = shiprocketResponse.shipment_id;
          replacement.status = 'Replacement Shipped';
          replacement.shipmentStatus = 'Shipped';

          // Try to get AWB
          if (shiprocketResponse.shipment_id) {
            try {
              const awbResponse = await shiprocketService.assignAWB(shiprocketResponse.shipment_id);
              if (awbResponse && awbResponse.response?.data) {
                replacement.shipmentAwbCode = awbResponse.response.data.awb_code;
                replacement.shipmentCourierName = awbResponse.response.data.courier_name;
              }
            } catch (awbError) {
              console.error('Replacement shipment AWB assignment failed:', awbError.message);
            }
          }

          replacement.statusHistory.push({
            status: 'Replacement Shipped',
            timestamp: new Date(),
            info: `Replacement shipped via Shiprocket`
          });
        }
      } catch (shiprocketError) {
        console.error('Shiprocket shipment failed:', shiprocketError.message);
        replacement.statusHistory.push({
          status: 'Shipment Failed',
          timestamp: new Date(),
          info: shiprocketError.message
        });
        return res.status(500).json({ message: 'Failed to create shipment', error: shiprocketError.message });
      }
    } else {
      // Manual shipment without Shiprocket
      replacement.status = 'Replacement Shipped';
      replacement.shipmentStatus = 'Shipped';
      replacement.statusHistory.push({
        status: 'Replacement Shipped',
        timestamp: new Date(),
        info: 'Replacement shipped manually'
      });
    }

    await replacement.save();

    res.json({
      message: 'Replacement shipped successfully',
      replacement
    });
  } catch (error) {
    console.error('Ship replacement error:', error.message);
    res.status(500).json({ message: 'Failed to ship replacement', error: error.message });
  }
});
