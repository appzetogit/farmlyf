import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    platform: {
        type: String,
        required: true,
        enum: ['Instagram', 'Youtube', 'Twitter', 'Blog', 'Other'],
        default: 'Instagram'
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    commissionRate: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 0
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validTo: {
        type: Date
    },
    active: {
        type: Boolean,
        default: true
    },
    usageCount: {
        type: Number,
        default: 0
    },
    totalSales: {
        type: Number,
        default: 0
    },
    totalPaid: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Referral = mongoose.model('Referral', referralSchema);

export default Referral;
