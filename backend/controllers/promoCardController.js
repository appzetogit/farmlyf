import PromoCard from '../models/PromoCard.js';

// @desc    Get Promo Card Details
// @route   GET /api/promo-card
// @access  Public
export const getPromoCard = async (req, res) => {
  try {
    let promo = await PromoCard.findOne();
    if (!promo) {
      // Create default if not exists
      promo = await PromoCard.create({});
    }
    res.json(promo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Promo Card Details
// @route   PUT /api/promo-card
// @access  Private/Admin
export const updatePromoCard = async (req, res) => {
  try {
    let promo = await PromoCard.findOne();
    if (!promo) {
      promo = new PromoCard(req.body);
    } else {
      Object.assign(promo, req.body);
    }
    const updatedPromo = await promo.save();
    res.json(updatedPromo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
