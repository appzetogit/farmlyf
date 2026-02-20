import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import returnRoutes from './routes/returnRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import subCategoryRoutes from './routes/subCategoryRoutes.js';
import comboCategoryRoutes from './routes/comboCategoryRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reelRoutes from './routes/reelRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import promoCardRoutes from './routes/promoCardRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import featuredSectionRoutes from './routes/featuredSectionRoutes.js';
import trustSignalRoutes from './routes/trustSignalRoutes.js';
import aboutSectionRoutes from './routes/aboutSectionRoutes.js';
import healthBenefitSectionRoutes from './routes/healthBenefitSectionRoutes.js';
import faqRoutes from './routes/faqRoutes.js';
import websiteContentRoutes from './routes/websiteContentRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import shipmentRoutes from './routes/shipmentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import replacementRoutes from './routes/replacementRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const parseOrigins = (value) =>
  (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://farmlyf.in',
  'https://www.farmlyf.in',
  'http://farmlyf.in',
  'http://www.farmlyf.in',
  process.env.FRONTEND_URL,
  ...parseOrigins(process.env.FRONTEND_URLS)
].filter(Boolean));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (process.env.CORS_ALLOW_ALL === 'true') {
      return callback(null, true);
    }

    const isAllowed = allowedOrigins.has(origin);
    const isVercel = origin.endsWith('.vercel.app');
    const isLocal = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
    const isFarmlyf = origin.includes('farmlyf.in');

    if (isAllowed || isLocal || isVercel || isFarmlyf || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/combo-categories', comboCategoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/promo-card', promoCardRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/featured-sections', featuredSectionRoutes);
app.use('/api/trust-signals', trustSignalRoutes);
app.use('/api/about-section', aboutSectionRoutes);

app.use('/api/health-benefits', healthBenefitSectionRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/page-content', websiteContentRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/replacements', replacementRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
