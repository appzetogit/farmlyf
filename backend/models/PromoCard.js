import mongoose from 'mongoose';

const promoCardSchema = new mongoose.Schema({
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
  isVisible: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('PromoCard', promoCardSchema);
