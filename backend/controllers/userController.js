import User from '../models/User.js';
import Admin from '../models/Admin.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';
import asyncHandler from 'express-async-handler';
import { sendOTP, verifyOTP } from '../utils/smsService.js';

const normalizePhone = (phone = '') => String(phone).replace(/\D/g, '').slice(-10);

const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findUserByPhoneFlexible = async (normalizedPhone) => {
  if (!normalizedPhone) return null;
  const suffixPattern = `${escapeRegExp(normalizedPhone)}$`;
  return User.findOne({
    $or: [
      { phone: normalizedPhone },
      { phone: { $regex: suffixPattern } }
    ]
  });
};

const getJwtCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

// @desc    Register new user
// @route   POST /api/users
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        id: 'user_' + Date.now(),
        name,
        email,
        password: hashedPassword,
        addresses: [],
        wishlist: [],
        usedCoupons: []
    });

    if (user) {
      const token = generateToken(user.id);
      res.cookie('jwt', token, getJwtCookieOptions());

      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: 'user',
        token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
     res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Admin Backdoor
  if (email === 'admin@farmlyf.com' && password === 'admin') {
      const token = generateToken('admin_01');
      res.cookie('jwt', token, getJwtCookieOptions());
      return res.json({
          _id: 'admin_01',
          name: 'Super Admin',
          email: 'admin@farmlyf.com',
          role: 'admin',
          token
      });
  }

  try {
    const user = await User.findOne({ email });
    
    if (user && user.isBanned) {
        return res.status(401).json({ message: 'This account has been restricted. Please contact support.' });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user.id);
      res.cookie('jwt', token, getJwtCookieOptions());

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.email === 'admin@farmlyf.com' ? 'admin' : 'user',
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
     res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Public
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  let profile;
  let isAdmin = req.user.role === 'admin';

  if (isAdmin) {
    profile = await Admin.findOne({ email: req.user.email });
    if (!profile && req.user.email === 'admin@farmlyf.com') {
      // Return hardcoded values for backdoor admin if not in DB yet
      return res.json({
        id: 'admin_01',
        _id: 'admin_01',
        name: 'Super Admin',
        email: 'admin@farmlyf.com',
        role: 'admin'
      });
    }
  } else {
    profile = req.user;
  }

  if (profile) {
    res.json({
        id: profile.id || profile._id,
        _id: profile.id || profile._id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        gender: profile.gender || 'Other',
        birthDate: profile.birthDate || '',
        addresses: profile.addresses || [],
        accountType: profile.accountType || 'Individual',
        gstNumber: profile.gstNumber || '',
        role: isAdmin ? 'admin' : 'user'
    });
  } else {
    res.status(401).json({ message: 'Not authorized, profile unavailable' });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
    let user;
    let isAdmin = req.user.role === 'admin';

    if (isAdmin) {
        user = await Admin.findOne({ email: req.user.email });
        if (!user && req.user.email === 'admin@farmlyf.com') {
            // Create the admin record if it doesn't exist but they are logged in via backdoor
            user = new Admin({
                email: 'admin@farmlyf.com',
                name: 'Super Admin',
                password: 'admin' // Initial password if created this way
            });
        }
    } else {
        user = await User.findOne({ id: req.user.id });
    }

    if (user) {
        if (req.body.name !== undefined) user.name = req.body.name;
        if (req.body.email !== undefined) user.email = req.body.email;
        if (req.body.phone !== undefined) user.phone = req.body.phone;
        if (req.body.gender !== undefined) user.gender = req.body.gender;
        if (req.body.birthDate !== undefined) user.birthDate = req.body.birthDate;
        if (req.body.accountType !== undefined) user.accountType = req.body.accountType;
        if (req.body.gstNumber !== undefined) user.gstNumber = req.body.gstNumber;
        
        if (req.body.addresses) {
            user.addresses = req.body.addresses;
        }

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            id: isAdmin ? 'admin_01' : updatedUser.id,
            _id: isAdmin ? 'admin_01' : updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone || '',
            gender: isAdmin ? 'Other' : updatedUser.gender,
            birthDate: isAdmin ? '' : updatedUser.birthDate,
            addresses: isAdmin ? [] : updatedUser.addresses,
            accountType: isAdmin ? 'Admin' : (updatedUser.accountType || 'Individual'),
            gstNumber: isAdmin ? '' : updatedUser.gstNumber,
            role: isAdmin ? 'admin' : 'user'
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private (admin only)
export const getUserById = async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id }).select('-password').lean(); 
        if (user) {
            // Get stats for this user
            const orderStats = await mongoose.model('Order').aggregate([
                { $match: { userId: user.id, status: { $ne: 'Cancelled' } } },
                { 
                    $group: { 
                        _id: "$userId", 
                        totalOrders: { $sum: 1 }, 
                        totalSpend: { $sum: "$amount" } 
                    } 
                }
            ]);

            const stats = orderStats[0] || { totalOrders: 0, totalSpend: 0 };
            
            res.json({
                ...user,
                totalOrders: stats.totalOrders,
                totalSpend: stats.totalSpend
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status; // 'Active' or 'Blocked'

    const query = {};
    
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
        ];
    }
    
    if (status === 'Active') {
        query.isBanned = { $ne: true };
    } else if (status === 'Blocked') {
        query.isBanned = true;
    }

    const count = await User.countDocuments(query);
    const users = await User.find(query)
        .select('-password')
        .limit(limit)
        .skip(limit * (page - 1))
        .sort({ createdAt: -1 })
        .lean();

    // Get Order Stats for these users
    const userIds = users.map(u => u.id);
    const orderStats = await mongoose.model('Order').aggregate([
        { $match: { userId: { $in: userIds }, status: { $ne: 'Cancelled' } } },
        { 
            $group: { 
                _id: "$userId", 
                totalOrders: { $sum: 1 }, 
                totalSpend: { $sum: "$amount" } 
            } 
        }
    ]);

    const statsMap = orderStats.reduce((acc, stat) => {
        acc[stat._id] = stat;
        return acc;
    }, {});

    const usersWithStats = users.map(user => ({
        ...user,
        totalOrders: statsMap[user.id]?.totalOrders || 0,
        totalSpend: statsMap[user.id]?.totalSpend || 0
    }));

    // Global Stats for Dashboard
    const totalResidents = await User.countDocuments({});
    const activeAccounts = await User.countDocuments({ isBanned: { $ne: true } });
    const restrictedAccounts = await User.countDocuments({ isBanned: true });

    res.json({
        users: usersWithStats,
        page,
        pages: Math.ceil(count / limit),
        total: count,
        stats: {
            totalResidents,
            activeAccounts,
            restrictedAccounts
        }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ban/Unban user
// @route   PUT /api/users/:id/ban
// @access  Private/Admin
export const toggleBanUser = async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id }); 
        if (user) {
            user.isBanned = !user.isBanned;
            await user.save();
            res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'}`, isBanned: user.isBanned });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update FCM token for push notifications
// @route   PUT /api/users/fcm-token
// @access  Private
export const updateFcmToken = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) {
        res.status(400);
        throw new Error('FCM token is required');
    }

    let user;
    if (req.user.role === 'admin') {
        user = await Admin.findOne({ email: req.user.email });
        if (!user && req.user.email === 'admin@farmlyf.com') {
            user = new Admin({
                email: 'admin@farmlyf.com',
                name: 'Super Admin',
                password: 'admin'
            });
        }
    } else {
        user = await User.findOne({ id: req.user.id });
    }

    if (user) {
        user.fcmToken = token;
        await user.save();
        res.json({ message: 'FCM token updated successfully' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

/**
 * @desc    Send OTP for login
 * @route   POST /api/users/send-otp-login
 * @access  Public
 */
export const sendOtpForLogin = asyncHandler(async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        res.status(400);
        throw new Error('Please provide a mobile number');
    }

    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length !== 10) {
        res.status(400);
        throw new Error('Please provide a valid 10-digit mobile number');
    }

    // Check if user exists and is banned
    const user = await findUserByPhoneFlexible(normalizedPhone);
    if (user && user.isBanned) {
        res.status(401);
        throw new Error('This account has been restricted. Please contact support.');
    }

    const result = await sendOTP(normalizedPhone, 'Customer');
    res.json(result);
});

/**
 * @desc    Verify OTP for login
 * @route   POST /api/users/verify-otp-login
 * @access  Public
 */
export const verifyOtpForLogin = asyncHandler(async (req, res) => {
    const { phone, otp, name, email, accountType, gstNumber } = req.body;

    if (!phone || !otp) {
        res.status(400);
        throw new Error('Please provide phone and OTP');
    }

    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length !== 10) {
        res.status(400);
        throw new Error('Please provide a valid 10-digit mobile number');
    }

    // First, check if user exists to decide whether to delete OTP on success
    let user = await findUserByPhoneFlexible(normalizedPhone);
    const deleteOnSuccess = !!user || (!!name && !!email);

    const isValid = await verifyOTP(normalizedPhone, otp, 'Customer', deleteOnSuccess);

    if (!isValid) {
        res.status(401);
        throw new Error('Invalid or expired OTP');
    }

    if (!user) {
        // If user doesn't exist and name/email are not provided, signal that it's a new user
        if (!name || !email) {
            return res.json({ isNewUser: true, phone: normalizedPhone });
        }

        // Check if email is already taken by another account (without this phone)
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            res.status(400);
            throw new Error('Email is already registered with another account');
        }

        // Create new user
        user = await User.create({
            id: 'user_' + Date.now(),
            name,
            email,
            phone: normalizedPhone,
            accountType: accountType || 'Individual',
            gstNumber: gstNumber || undefined,
            addresses: [],
            wishlist: [],
            usedCoupons: []
        });
    }

    if (user && user.isBanned) {
        res.status(401);
        throw new Error('This account has been restricted. Please contact support.');
    }

    // Ensure phone used to sign in is always persisted in normalized format.
    if (user && user.phone !== normalizedPhone) {
        user.phone = normalizedPhone;
        await user.save();
    }

    // Login successful
    const token = generateToken(user.id);
    res.cookie('jwt', token, getJwtCookieOptions());

    res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        accountType: user.accountType,
        role: user.email === 'admin@farmlyf.com' ? 'admin' : 'user',
        token
    });
});
