import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from './models/Review.js';

dotenv.config();

const reviews = [
    {
        name: "Shravya Kapoor",
        comment: "What an amazing brand, never disappoints me. Simply love their range of dry fruits super affordable and premium.",
        image: "https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-female-user-profile-vector-illustration-isolated-background-women-profile-sign-business-concept_157943-38866.jpg?semt=ais_hybrid",
        user: "admin_01",
        status: "Active",
        rating: 5
    },
    {
        name: "Rahul Sharma",
        comment: "The quality of walnuts and almonds is just superior. I've been a regular customer for 6 months now!",
        image: "https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-male-user-profile-vector-illustration-isolated-background-man-profile-sign-business-concept_157943-38825.jpg?semt=ais_hybrid",
        user: "admin_01",
        status: "Active",
        rating: 5
    },
    {
        name: "Priya Singh",
        comment: "Packaging is top-notch and delivery was super fast. Highly recommended for daily nutrition needs.",
        image: "https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-female-user-profile-vector-illustration-isolated-background-women-profile-sign-business-concept_157943-38866.jpg?semt=ais_hybrid",
        user: "admin_01",
        status: "Active",
        rating: 5
    },
    {
        name: "Amit Patel",
        comment: "Best prices in the market for such premium quality. The cranberries are my absolute favorite.",
        image: "https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-male-user-profile-vector-illustration-isolated-background-man-profile-sign-business-concept_157943-38825.jpg?semt=ais_hybrid",
        user: "admin_01",
        status: "Active",
        rating: 5
    }
];

const seedReviews = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding reviews...');

        // Clear existing admin testimonials (where product is null)
        await Review.deleteMany({ product: null });
        console.log('Existing admin reviews cleared.');

        await Review.insertMany(reviews);
        console.log('Homepage reviews seeded successfully!');

        process.exit();
    } catch (error) {
        console.error('Error seeding reviews:', error);
        process.exit(1);
    }
};

seedReviews();
