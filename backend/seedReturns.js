import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Return from './models/Return.js';
import Order from './models/Order.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/farmlyf';

const seedReturns = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected for Seeding Returns');

        // Clear existing returns
        await Return.deleteMany({});
        console.log('Cleared existing returns');

        // Fetch some orders to link returns to
        const orders = await Order.find().limit(5);
        
        if (orders.length === 0) {
            console.log('No orders found to link returns. Please seed orders first.');
            process.exit(1);
        }

        const returnRequests = [
            {
                id: 'RET-101',
                orderId: orders[0].id,
                userId: orders[0].userId,
                userName: orders[0].userName || 'Aditya Raj',
                type: 'refund',
                status: 'Pending',
                reason: 'Damaged Product',
                comments: 'The packet was torn on arrival.',
                items: [orders[0].items[0]],
                refundAmount: orders[0].items[0].price * orders[0].items[0].qty,
                requestDate: new Date(),
                pickupStatus: 'Not Scheduled'
            },
            {
                id: 'RET-102',
                orderId: orders[1]?.id || orders[0].id,
                userId: orders[1]?.userId || orders[0].userId,
                userName: orders[1]?.userName || 'Priya Sharma',
                type: 'replace',
                status: 'Approved',
                reason: 'Wrong Item Received',
                comments: 'Received almonds instead of cashews.',
                items: [orders[1]?.items[0] || orders[0].items[0]],
                refundAmount: 0,
                requestDate: new Date(Date.now() - 86400000), // Yesterday
                pickupStatus: 'Scheduled',
                awbCode: 'RT987654321',
                courierName: 'Delhivery'
            }
        ];

        await Return.insertMany(returnRequests);
        console.log('Returns Seeded Successfully');
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding returns:', error);
        process.exit(1);
    }
};

seedReturns();
