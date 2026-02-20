import admin from 'firebase-admin';
import Admin from '../models/Admin.js';

// Initialize Firebase Admin if not already done
const initializeFirebase = () => {
    if (admin.apps.length === 0) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
                })
            });
            console.log('Firebase Admin initialized in notificationUtils');
        } catch (error) {
            console.error('Firebase initialization error in notificationUtils:', error.message);
        }
    }
};

/**
 * Sends a "Low Stock" notification to all admin users with FCM tokens.
 * @param {Object} product The product that has low stock.
 * @param {String|null} variantId ID or weight of the variant if applicable.
 */
export const sendAdminLowStockNotification = async (product, variantId = null) => {
    try {
        initializeFirebase();

        // Find all admins with FCM tokens
        const admins = await Admin.find({ 
            fcmToken: { $exists: true, $nin: [null, ''] } 
        });

        if (admins.length === 0) {
            console.log('No admins found with FCM tokens for low stock alert');
            return;
        }

        const tokens = admins.map(a => a.fcmToken);
        let stockMsg = `Stock is low for ${product.name}`;
        
        if (variantId && product.variants?.length > 0) {
            const variant = product.variants.find(v => String(v.id) === String(variantId) || v.weight === variantId);
            if (variant) {
                stockMsg = `Stock is low for ${product.name} (${variant.weight || variant.quantity + variant.unit}): ${variant.stock} left`;
            }
        } else {
            stockMsg = `Stock is low for ${product.name}: ${product.stock?.quantity || 0} left`;
        }

        const payload = {
            notification: {
                title: '⚠️ Low Stock Alert!',
                body: stockMsg,
            },
            data: {
                type: 'LOW_STOCK',
                productId: product.id,
                variantId: variantId || '',
                click_action: 'FLUTTER_NOTIFICATION_CLICK'
            }
        };

        const response = await admin.messaging().sendEachForMulticast({
            tokens: tokens,
            notification: payload.notification,
            data: payload.data
        });

        console.log(`Admin low stock notification sent: ${response.successCount} success, ${response.failureCount} failure`);
    } catch (error) {
        console.error('Error sending admin low stock notification:', error.message);
    }
};

/**
 * Sends a "New Order" notification to all admin users with FCM tokens.
 * @param {Object} order The order object that was just created.
 */
export const sendAdminOrderNotification = async (order) => {
    try {
        initializeFirebase();

        // Find all admins with FCM tokens
        const admins = await Admin.find({ 
            fcmToken: { $exists: true, $nin: [null, ''] } 
        });

        if (admins.length === 0) {
            console.log('No admins found with FCM tokens for order alert');
            return;
        }

        const tokens = admins.map(a => a.fcmToken);
        const orderId = order.id || (order._id ? order._id.toString() : 'New');
        const customerName = order.userName || order.shippingAddress?.fullName || 'Guest';

        const payload = {
            notification: {
                title: '🚨 New Order Received!',
                body: `Order #${orderId.slice(-8)} placed by ${customerName} for ₹${order.amount}`,
            },
            data: {
                type: 'NEW_ORDER',
                orderId: orderId,
                amount: String(order.amount),
                click_action: 'FLUTTER_NOTIFICATION_CLICK'
            }
        };

        const response = await admin.messaging().sendEachForMulticast({
            tokens: tokens,
            notification: payload.notification,
            data: payload.data
        });

        console.log(`Admin order notification sent: ${response.successCount} success, ${response.failureCount} failure`);
    } catch (error) {
        console.error('Error sending admin order notification:', error.message);
    }
};


