import Referral from '../models/Referral.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a new referral
// @route   POST /api/referrals
// @access  Private/Admin
const createReferral = asyncHandler(async (req, res) => {
    const { name, platform, code, type, value, commissionRate, validFrom, validTo, active } = req.body;

    const referralExists = await Referral.findOne({ code });

    if (referralExists) {
        res.status(400);
        throw new Error('Referral code already exists');
    }

    const referral = await Referral.create({
        name,
        platform,
        code,
        type,
        value,
        commissionRate,
        validFrom,
        validTo,
        active
    });

    if (referral) {
        res.status(201).json(referral);
    } else {
        res.status(400);
        throw new Error('Invalid referral data');
    }
});

// @desc    Get all referrals
// @route   GET /api/referrals
// @access  Private/Admin
const getReferrals = asyncHandler(async (req, res) => {
    const referrals = await Referral.find({}).sort({ createdAt: -1 });
    res.json(referrals);
});

// @desc    Get referral by ID
// @route   GET /api/referrals/:id
// @access  Private/Admin
const getReferralById = asyncHandler(async (req, res) => {
    const referral = await Referral.findById(req.params.id);

    if (referral) {
        res.json(referral);
    } else {
        res.status(404);
        throw new Error('Referral not found');
    }
});

// @desc    Update a referral
// @route   PUT /api/referrals/:id
// @access  Private/Admin
const updateReferral = asyncHandler(async (req, res) => {
    const referral = await Referral.findById(req.params.id);

    if (referral) {
        referral.name = req.body.name || referral.name;
        referral.platform = req.body.platform || referral.platform;
        referral.code = req.body.code || referral.code;
        referral.type = req.body.type || referral.type;
        referral.value = req.body.value || referral.value;
        referral.commissionRate = req.body.commissionRate || referral.commissionRate;
        referral.validFrom = req.body.validFrom || referral.validFrom;
        referral.validTo = req.body.validTo || referral.validTo;
        if (req.body.active !== undefined) {
            referral.active = req.body.active;
        }

        const updatedReferral = await referral.save();
        res.json(updatedReferral);
    } else {
        res.status(404);
        throw new Error('Referral not found');
    }
});

// @desc    Delete a referral
// @route   DELETE /api/referrals/:id
// @access  Private/Admin
const deleteReferral = asyncHandler(async (req, res) => {
    const referral = await Referral.findById(req.params.id);

    if (referral) {
        await referral.deleteOne();
        res.json({ message: 'Referral removed' });
    } else {
        res.status(404);
        throw new Error('Referral not found');
    }
});

// @desc    Add payout
// @route   POST /api/referrals/:id/payout
// @access  Private/Admin
const addPayout = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const referral = await Referral.findById(req.params.id);

    if (referral) {
        referral.totalPaid = (referral.totalPaid || 0) + Number(amount);
        const updatedReferral = await referral.save();
        res.json(updatedReferral);
    } else {
        res.status(404);
        throw new Error('Referral not found');
    }
});

// @desc    Validate a referral code
// @route   POST /api/referrals/validate
// @access  Private (User)
const validateReferral = asyncHandler(async (req, res) => {
    const { code } = req.body;

    if (!code) {
        res.status(400);
        throw new Error('Referral code is required');
    }

    // Find referral by code (case-insensitive)
    const referral = await Referral.findOne({ 
        code: code.toUpperCase(),
        active: true 
    });

    if (!referral) {
        res.status(404);
        throw new Error('Invalid referral code');
    }

    // Check expiry if validTo is set
    if (referral.validTo && new Date(referral.validTo) < new Date()) {
        res.status(400);
        throw new Error('Referral code has expired');
    }

    // Return only necessary information for validation
    res.json({
        code: referral.code,
        type: referral.type,
        value: referral.value
    });
});

// @desc    Get orders for a specific referral
// @route   GET /api/referrals/:id/orders
// @access  Private/Admin
const getReferralOrders = asyncHandler(async (req, res) => {
    const referral = await Referral.findById(req.params.id);

    if (!referral) {
        res.status(404);
        throw new Error('Referral not found');
    }

    // Import Order model
    const Order = (await import('../models/Order.js')).default;

    // Find all orders that used this referral code and are not cancelled
    const orders = await Order.find({ 
        appliedCoupon: referral.code,
        status: { $ne: 'Cancelled' }
    }).sort({ createdAt: -1 });

    // Calculate commission for each order
    const ordersWithCommission = orders.map(order => {
        const orderAmount = order.amount || 0;
        const discount = order.discount || 0;
        const netAmount = orderAmount; // Net is the total after discount
        const commission = Math.floor(netAmount * (referral.commissionRate / 100));

        return {
            orderId: order.id,
            userName: order.userName || 'N/A',
            date: order.createdAt,
            amount: orderAmount,
            commission: commission
        };
    });

    res.json(ordersWithCommission);
});

export {
    createReferral,
    getReferrals,
    getReferralById,
    updateReferral,
    deleteReferral,
    addPayout,
    validateReferral,
    getReferralOrders
};
