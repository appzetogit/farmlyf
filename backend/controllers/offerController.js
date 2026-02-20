import Offer from '../models/Offer.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a new offer
// @route   POST /api/offers
// @access  Private/Admin
export const createOffer = asyncHandler(async (req, res) => {
  const { title, slug } = req.body;
  const finalSlug = slug || title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  
  const offerExists = await Offer.findOne({ slug: finalSlug });
  if (offerExists) {
    res.status(400);
    throw new Error('Offer with this slug already exists');
  }

  const offer = await Offer.create({
    ...req.body,
    slug: finalSlug,
    targetLink: `/offers/${finalSlug}`
  });

  res.status(201).json(offer);
});

// @desc    Get all offers
// @route   GET /api/offers
// @access  Private/Admin
export const getAllOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find({}).sort({ createdAt: -1 });
  res.json(offers);
});

// @desc    Get offer by slug (for user frontend)
// @route   GET /api/offers/slug/:slug
// @access  Public
export const getOfferBySlug = asyncHandler(async (req, res) => {
  const offer = await Offer.findOne({ 
    slug: { $regex: new RegExp(`^${req.params.slug}$`, 'i') }, 
    isActive: true 
  }).populate('products');

  if (offer) {
    res.json(offer);
  } else {
    res.status(404);
    throw new Error('Offer not found');
  }
});

// @desc    Get offer by ID (for admin edit)
// @route   GET /api/offers/:id
// @access  Private/Admin
export const getOfferById = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (offer) {
    res.json(offer);
  } else {
    res.status(404);
    throw new Error('Offer not found');
  }
});

// @desc    Update offer
// @route   PUT /api/offers/:id
// @access  Private/Admin
export const updateOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);

  if (offer) {
    const { title, slug } = req.body;
    
    // Update slug/targetLink if title or slug changes
    if (slug && slug !== offer.slug) {
        const offerExists = await Offer.findOne({ slug });
        if (offerExists) {
            res.status(400);
            throw new Error('Offer with this slug already exists');
        }
        offer.slug = slug;
        offer.targetLink = `/offers/${slug}`;
    } else if (title && title !== offer.title && !slug) {
        const newSlug = title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        offer.slug = newSlug;
        offer.targetLink = `/offers/${newSlug}`;
    }

    // Update other fields
    Object.keys(req.body).forEach(key => {
        if (key !== 'slug') { // slug is handled above
            offer[key] = req.body[key];
        }
    });

    const updatedOffer = await offer.save();
    res.json(updatedOffer);
  } else {
    res.status(404);
    throw new Error('Offer not found');
  }
});

// @desc    Delete offer
// @route   DELETE /api/offers/:id
// @access  Private/Admin
export const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findByIdAndDelete(req.params.id);
  if (offer) {
    res.json({ message: 'Offer removed' });
  } else {
    res.status(404);
    throw new Error('Offer not found');
  }
});
