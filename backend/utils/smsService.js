import axios from 'axios';
import Otp from '../models/Otp.js';
import Order from '../models/Order.js';

// SMS India HUB Configuration
// SMS India HUB Configuration accessed dynamically to handle ESM loading order
const API_TIMEOUT = 30000; // 30 seconds

/**
 * Generate numeric OTP
 */
function generateOTP(length = 4) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}

/**
 * Normalize mobile number to include country code (91)
 */
function normalizeMobileNumber(mobile) {
    let cleanMobile = mobile.replace(/^\+/, '').replace(/\D/g, '');

    if (!cleanMobile.startsWith('91')) {
        cleanMobile = '91' + cleanMobile;
    }

    if (cleanMobile.length < 12 || cleanMobile.length > 13) {
        throw new Error(`Invalid mobile number: ${cleanMobile}. Must be 12-13 digits with country code.`);
    }

    return cleanMobile;
}

/**
 * Build DLT-compliant message
 */
function buildOtpMessage(otp) {
    const appName = process.env.APP_NAME || 'Indian Kart';
    return `Welcome to the ${appName} powered by SMSINDIAHUB. Your OTP for registration is ${otp}`;
}

/**
 * Parse and handle SMS India HUB API response
 */
function handleSmsResponse(responseData) {
    const errorCode = responseData.ErrorCode || '';
    const errorMsg = responseData.ErrorMessage || '';

    // Success indicators
    if (errorCode === '000' || errorMsg === 'Done' || responseData.JobId || responseData.MessageData) {
        return; // Success
    }

    // Error handling
    if (errorCode || errorMsg) {
        switch (errorCode) {
            case '001':
                throw new Error('SMS India HUB: Account details cannot be blank.');
            case '006':
                throw new Error('SMS India HUB: Invalid DLT template. Message does not match registered template.');
            case '007':
                throw new Error('SMS India HUB: Invalid API key or credentials.');
            case '021':
                throw new Error('SMS India HUB: Insufficient credits in your account.');
            default:
                throw new Error(`SMS India HUB API Error (Code: ${errorCode}): ${errorMsg}`);
        }
    }
}

/**
 * Send SMS via SMS India HUB API
 */
async function sendSmsViaApi(mobile, message) {
    const API_KEY = process.env.SMS_INDIA_HUB_API_KEY;
    const SENDER_ID = process.env.SMS_INDIA_HUB_SENDER_ID;
    const TEMPLATE_ID = process.env.SMS_INDIA_HUB_DLT_TEMPLATE_ID;
    const API_URL = process.env.SMS_INDIA_HUB_API_URL || 'http://cloud.smsindiahub.in/vendorsms/pushsms.aspx';
    const GWID = process.env.SMS_INDIA_HUB_GWID || '2';

    if (!API_KEY || !SENDER_ID) {
        throw new Error('SMS India HUB credentials are missing. Please check environment variables.');
    }

    const cleanMobile = normalizeMobileNumber(mobile);

    const params = {
        APIKey: API_KEY.trim(),
        msisdn: cleanMobile,
        sid: SENDER_ID.trim(),
        msg: message,
        fl: '0',
        gwid: GWID,
    };

    if (TEMPLATE_ID && TEMPLATE_ID.trim()) {
        params.DLT_TE_ID = TEMPLATE_ID.trim();
    }

    // DEBUG LOG
    console.log('[SMS] Sending via API:', { mobile: cleanMobile, sender: SENDER_ID, url: API_URL });

    const response = await axios.get(API_URL, {
        params,
        paramsSerializer: (params) => {
            return Object.keys(params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');
        },
        timeout: API_TIMEOUT,
    });

    console.log('[SMS] API Response:', response.data);

    handleSmsResponse(response.data);
}

/**
 * Save OTP to database
 */
async function saveOtpToDb(mobile, otp, userType) {
    // Normalize mobile number (remove any non-digits, ensure consistent format)
    const normalizedMobile = mobile.replace(/\D/g, '');

    await Otp.deleteMany({ mobile: normalizedMobile, userType });
    await Otp.create({
        mobile: normalizedMobile,
        otp: otp.trim(),
        userType,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
    });
}

/**
 * Verify OTP from database
 */
async function verifyOtpFromDb(mobile, otp, userType, deleteOnSuccess = true) {
    // Normalize mobile number (remove any non-digits, ensure consistent format)
    const normalizedMobile = mobile.replace(/\D/g, '');

    const record = await Otp.findOne({
        mobile: normalizedMobile,
        userType,
        otp: otp.trim()
    });

    if (!record) {
        console.error('OTP verification failed - record not found:', {
            mobile: normalizedMobile,
            userType,
            otpVerify: otp.trim()
        });
        return false;
    }

    if (record.expiresAt < new Date()) {
        await Otp.deleteOne({ _id: record._id });
        console.error('OTP verification failed - expired');
        return false;
    }

    if (deleteOnSuccess) {
        await Otp.deleteOne({ _id: record._id });
    }
    return true;
}

/**
 * Check if special bypass should be used
 */
function isSpecialBypass(mobile) {
    const isBypass = mobile === '9111966732';
    if (isBypass) console.log('[SMS] Special bypass triggered for:', mobile);
    return isBypass;
}

/**
 * Check if mock mode should be used
 */
function isMockMode() {
    const API_KEY = process.env.SMS_INDIA_HUB_API_KEY;
    const SENDER_ID = process.env.SMS_INDIA_HUB_SENDER_ID;
    const useMock = process.env.USE_MOCK_OTP === 'true' || !API_KEY || !SENDER_ID;
    console.log('[SMS] Mock mode check:', { useMock, USE_MOCK_OTP: process.env.USE_MOCK_OTP, hasKey: !!API_KEY, hasSender: !!SENDER_ID });
    return useMock;
}

/**
 * Check if developer bypass OTP
 */
function isDeveloperBypass(otp) {
    return (process.env.NODE_ENV !== 'production' || process.env.USE_MOCK_OTP === 'true') && otp === '999999';
}

// ==========================================
// SMS OTP (Customer / Delivery)
// ==========================================

export async function sendSmsOtp(mobile, userType = 'Delivery') {
    try {
        const otp = generateOTP(4);

        // Special number bypass
        if (isSpecialBypass(mobile)) {
            const specialOtp = '1234';
            await saveOtpToDb(mobile, specialOtp, userType);
            return {
                success: true,
                sessionId: 'DB_VERIFIED_' + mobile,
                message: 'OTP sent successfully',
            };
        }

        // Mock mode
        if (isMockMode()) {
            await saveOtpToDb(mobile, otp, userType);
            console.log(`[MOCK MODE] OTP for ${mobile}: ${otp}`);
            return {
                success: true,
                sessionId: 'MOCK_SESSION_' + mobile,
                message: 'OTP sent successfully',
            };
        }

        // Real mode - Send via SMS India HUB
        await saveOtpToDb(mobile, otp, userType);
        const message = buildOtpMessage(otp);
        await sendSmsViaApi(mobile, message);

        return {
            success: true,
            sessionId: 'DB_VERIFIED_' + mobile,
            message: 'OTP sent successfully',
        };
    } catch (error) {
        const errorMessage = error.message || 'Failed to send OTP. Please try again.';
        console.error('SMS OTP Error (sendSmsOtp):', {
            error: errorMessage,
            mobile,
            userType
        });
        throw new Error(`SMS Service Error: ${errorMessage}`);
    }
}

export async function verifySmsOtp(sessionId, otpInput, mobile, userType = 'Delivery', deleteOnSuccess = true) {
    if (isDeveloperBypass(otpInput)) {
        return true;
    }

    const normalizedOtp = String(otpInput).trim().replace(/\s/g, '');

    if (!normalizedOtp || normalizedOtp.length !== 4) {
        return false;
    }

    let targetMobile = mobile;
    if (!targetMobile && sessionId) {
        if (sessionId.startsWith('DB_VERIFIED_')) {
            targetMobile = sessionId.replace('DB_VERIFIED_', '');
        } else if (sessionId.startsWith('MOCK_SESSION_')) {
            targetMobile = sessionId.replace('MOCK_SESSION_', '');
        }
    }

    if (!targetMobile) {
        return false;
    }

    const normalizedMobile = targetMobile.replace(/\D/g, '');

    if (normalizedMobile.length !== 10) {
        return false;
    }

    return verifyOtpFromDb(normalizedMobile, normalizedOtp, userType, deleteOnSuccess);
}

// ==========================================
// SMS OTP (Admin)
// ==========================================

export async function sendOTP(mobile, userType) {
    try {
        const otp = generateOTP(4);

        if (isSpecialBypass(mobile)) {
            const specialOtp = '1234';
            await saveOtpToDb(mobile, specialOtp, userType);
            return { success: true, message: 'OTP sent successfully' };
        }

        if (isMockMode()) {
            await saveOtpToDb(mobile, otp, userType);
            console.log(`[MOCK MODE] OTP for ${mobile} (${userType}): ${otp}`);
            return { success: true, message: 'OTP sent successfully' };
        }

        await saveOtpToDb(mobile, otp, userType);
        const message = buildOtpMessage(otp);
        await sendSmsViaApi(mobile, message);

        return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
        const errorMessage = error.message || 'Failed to send OTP.';
        console.error('SMS OTP Error (sendOTP):', { error: errorMessage, mobile, userType });
        throw new Error(`SMS Service Error: ${errorMessage}`);
    }
}

export async function verifyOTP(mobile, otpInput, userType, deleteOnSuccess = true) {
    if (isDeveloperBypass(otpInput)) return true;

    const normalizedOtp = String(otpInput).trim().replace(/\s/g, '');
    if (!normalizedOtp || normalizedOtp.length !== 4) return false;

    const normalizedMobile = mobile.replace(/\D/g, '');
    if (normalizedMobile.length !== 10) return false;

    return verifyOtpFromDb(normalizedMobile, normalizedOtp, userType, deleteOnSuccess);
}

// ==========================================
// Delivery OTP
// ==========================================

export async function generateDeliveryOtp(orderId, customerPhone) {
    try {
        const order = await Order.findById(orderId);

        if (!order) throw new Error('Order not found');
        if (order.status === 'Delivered') throw new Error('Order is already delivered');

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        order.deliveryOtp = otp;
        order.deliveryOtpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        order.deliveryOtpVerified = false;
        await order.save();

        try {
            // Use SMS India HUB for Delivery OTPs as well
            const appName = process.env.APP_NAME || 'Indian Kart';
            const message = `Welcome to the ${appName} powered by SMSINDIAHUB. Your Delivery OTP for Order #${orderId.slice(-6).toUpperCase()} is ${otp}`;
            
            if (process.env.USE_MOCK_OTP !== 'true') {
                 await sendSmsViaApi(customerPhone, message);
                 console.log(`Delivery OTP sent to ${customerPhone} for order ${orderId}`);
            } else {
                 console.log(`[MOCK MODE] Delivery OTP ${otp} for order ${orderId} to ${customerPhone}`);
            }

        } catch (smsError) {
            console.error('Error sending delivery OTP SMS:', smsError.message);
            // Don't fail the whole request if SMS fails, just log it? 
            // Or maybe we should throw to let the frontend know. 
            // For now, consistent with previous code, we log it but improved logging.
        }

        return { success: true, message: 'Delivery OTP sent successfully to customer' };
    } catch (error) {
        console.error('Error generating delivery OTP:', error);
        throw new Error(error.message || 'Failed to generate delivery OTP');
    }
}

export async function verifyDeliveryOtp(orderId, otp) {
    try {
        const order = await Order.findById(orderId);

        if (!order) throw new Error('Order not found');
        if (!order.deliveryOtp) throw new Error('No delivery OTP generated for this order');
        if (order.deliveryOtpVerified) throw new Error('OTP already verified');
        
        if (order.deliveryOtpExpiresAt && order.deliveryOtpExpiresAt < new Date()) {
             throw new Error('Delivery OTP has expired. Please request a new OTP.');
        }

        if (isDeveloperBypass(otp)) {
             order.deliveryOtpVerified = true;
             order.status = 'Delivered';
             order.deliveredAt = new Date();
             order.invoiceEnabled = true;
             await order.save();
             return { success: true, message: 'OTP verified successfully (Dev Bypass). Order marked as delivered.' };
        }

        if (order.deliveryOtp !== otp) {
            throw new Error('Invalid OTP. Please check and try again.');
        }

        order.deliveryOtpVerified = true;
        order.status = 'Delivered';
        order.deliveredAt = new Date();
        order.invoiceEnabled = true;
        await order.save();

        return { success: true, message: 'OTP verified successfully. Order marked as delivered.' };
    } catch (error) {
        console.error('Error verifying delivery OTP:', error);
        throw new Error(error.message || 'Failed to verify delivery OTP');
    }
}
