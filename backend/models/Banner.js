import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  badgeText: { type: String },
  ctaText: { type: String, default: 'Shop Now' },
  image: { type: String, required: true }, // Legacy/Default Cloudinary URL
  publicId: { type: String }, // Legacy/Default Cloudinary Public ID
  slides: [{
    image: { type: String, required: true },
    publicId: { type: String },
    title: { type: String }, // Individual slide title
    subtitle: { type: String }, // Individual slide subtitle
    badgeText: { type: String }, // Individual slide badge
    link: { type: String, default: '/' },
    ctaText: { type: String, default: 'Shop Now' }
  }],
  link: { type: String, default: '/' }, // Where clicking the banner goes
  section: { type: String, enum: ['hero', 'promo'], default: 'hero' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  promoCard: {
    topBadge: { type: String, default: 'Hot Deal' },
    badgeText1: { type: String, default: 'Upto' },
    discountTitle: { type: String, default: '60' },
    discountSuffix: { type: String, default: '%' },
    discountLabel: { type: String, default: 'OFF' },
    extraDiscountSubtitle: { type: String, default: 'EXTRA SAVE' },
    extraDiscount: { type: String, default: '15' },
    extraDiscountSuffix: { type: String, default: '%' },
    couponCode: { type: String, default: 'FRESH20' },
    showCouponCode: { type: Boolean, default: true },
    isVisible: { type: Boolean, default: false }
  }
}, { timestamps: true });

export default mongoose.model('Banner', bannerSchema);
