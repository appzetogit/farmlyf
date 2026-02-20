import admin from 'firebase-admin';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (!firebaseInitialized) {
    try {
      // Initialize with environment variables
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
      });
      firebaseInitialized = true;
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error.message);
    }
  }
};

// Send push notification
export const sendNotification = async (req, res) => {
  try {
    initializeFirebase();

    const { heading, message, target } = req.body;

    if (!heading || !message) {
      return res.status(400).json({ error: 'Heading and message are required' });
    }

    // Get target users based on audience selection
    let targetUsers = [];
    
    if (target === 'all') {
      targetUsers = await User.find({ 
        fcmToken: { $exists: true, $nin: [null, ''] }
      });
    } else if (target === 'active') {
      // Users active in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      targetUsers = await User.find({
        fcmToken: { $exists: true, $nin: [null, ''] },
        updatedAt: { $gte: thirtyDaysAgo }
      });
    } else if (target === 'cart') {
      // For now, send to all users with tokens
      targetUsers = await User.find({ 
        fcmToken: { $exists: true, $nin: [null, ''] }
      });
    }

    // Debug: Log all users with any fcmToken field
    const allUsersWithToken = await User.find({ fcmToken: { $exists: true } }).select('email fcmToken');
    console.log('DEBUG - Users with fcmToken field:', allUsersWithToken.length);
    console.log('DEBUG - Sample tokens:', allUsersWithToken.map(u => ({ email: u.email, hasToken: !!u.fcmToken, tokenPreview: u.fcmToken?.substring(0, 30) })));
    console.log('DEBUG - Target users found:', targetUsers.length);

    if (targetUsers.length === 0) {
      return res.status(400).json({ error: 'No users found with notification tokens. Users must grant permission first.' });
    }

    // Extract FCM tokens
    const tokens = targetUsers.map(user => user.fcmToken).filter(Boolean);

    if (tokens.length === 0) {
      return res.status(400).json({ error: 'No valid tokens found' });
    }

    // Prepare notification payload
    const payload = {
      notification: {
        title: heading,
        body: message,
      },
      data: {
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        heading,
        message
      }
    };

    // Send notifications
    let successCount = 0;
    let failureCount = 0;

    // Send in batches of 500 (FCM limit)
    const batchSize = 500;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);
      
      try {
        const response = await admin.messaging().sendEachForMulticast({
          tokens: batch,
          notification: payload.notification,
          data: payload.data
        });
        
        console.log('DEBUG - FCM Response:', {
          successCount: response.successCount,
          failureCount: response.failureCount,
          responses: response.responses.map((r, i) => ({ 
            success: r.success, 
            error: r.error?.message,
            token: batch[i]?.substring(0, 20) 
          }))
        });
        
        successCount += response.successCount;
        failureCount += response.failureCount;
      } catch (error) {
        console.error('Batch send error:', error);
        failureCount += batch.length;
      }
    }

    // Save notification history
    const notificationRecord = new Notification({
      heading,
      message,
      target,
      sentTo: targetUsers.map(u => u._id),
      sentCount: tokens.length,
      successCount,
      failureCount,
      status: failureCount === 0 ? 'sent' : (successCount === 0 ? 'failed' : 'partial')
    });

    await notificationRecord.save();

    res.json({
      success: true,
      message: `Notification sent successfully to ${successCount} users`,
      stats: {
        total: tokens.length,
        success: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get notification history
export const getNotificationHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('heading message target sentCount successCount failureCount status createdAt'),
      Notification.countDocuments()
    ]);

    res.json({
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get notification history error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Public notification feed (latest broadcasts)
export const getPublicNotificationFeed = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select('heading message target createdAt');

    res.json(notifications);
  } catch (error) {
    console.error('Get public notification feed error:', error);
    res.status(500).json({ error: error.message });
  }
};
