import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import UserLayout from './modules/user/layouts/UserLayout';
import SmoothScroll from './modules/user/components/SmoothScroll';
import HomePage from './modules/user/pages/HomePage';
import CatalogPage from './modules/user/pages/CatalogPage';
import ProductDetailPage from './modules/user/pages/ProductDetailPage';
import WishlistPage from './modules/user/pages/WishlistPage';
import CartPage from './modules/user/pages/CartPage';
import AuthPage from './modules/user/pages/AuthPage';
import CheckoutPage from './modules/user/pages/CheckoutPage';
import OrderSuccessPage from './modules/user/pages/OrderSuccessPage';
import OrdersPage from './modules/user/pages/OrdersPage';
import OrderDetailPage from './modules/user/pages/OrderDetailPage';
import ReturnsPage from './modules/user/pages/ReturnsPage';
import ReturnDetailPage from './modules/user/pages/ReturnDetailPage';
import ReturnRequestPage from './modules/user/pages/ReturnRequestPage';
import ProfilePage from './modules/user/pages/ProfilePage';
import InfoPage from './modules/user/pages/InfoPage';
import VaultPage from './modules/user/pages/VaultPage';
import OTPPage from './modules/user/pages/OTPPage';
import AdminLayout from './modules/admin/layout/AdminLayout';
import DashboardPage from './modules/admin/pages/DashboardPage';
import UsersPage from './modules/admin/pages/UsersPage';
import UserDetailPage from './modules/admin/pages/UserDetailPage';
import CategoriesPage from './modules/admin/pages/CategoriesPage';
import SubCategoriesPage from './modules/admin/pages/SubCategoriesPage';
import ProductListPage from './modules/admin/pages/ProductListPage';
import ProductFormPage from './modules/admin/pages/ProductFormPage';
import ComboListPage from './modules/admin/pages/ComboListPage';
import ComboFormPage from './modules/admin/pages/ComboFormPage';
import ComboProductsPage from './modules/admin/pages/ComboProductsPage';
import OrderListPage from './modules/admin/pages/OrderListPage';
import AdminOrderDetailPage from './modules/admin/pages/OrderDetailPage';
import ReturnRequestsPage from './modules/admin/pages/ReturnRequestsPage';
import ReplacementRequestsPage from './modules/admin/pages/ReplacementRequestsPage';
import AdminReturnDetailPage from './modules/admin/pages/ReturnDetailPage';
import ReplacementDetailPage from './modules/admin/pages/ReplacementDetailPage';
import CouponListPage from './modules/admin/pages/CouponListPage';
import CouponFormPage from './modules/admin/pages/CouponFormPage';
import SettingsPage from './modules/admin/pages/SettingsPage';
import InfluencerReferralPage from './modules/admin/pages/InfluencerReferralPage';
import LoginPage from './modules/admin/pages/LoginPage';
import BannerListPage from './modules/admin/pages/BannerListPage';
import ReelsPage from './modules/admin/pages/ReelsPage';
import AdminReviewsPage from './modules/admin/pages/AdminReviewsPage';
import AdminProfilePage from './modules/admin/pages/AdminProfilePage';
import InfluencerDetailPage from './modules/admin/pages/InfluencerDetailPage';
import StockAdjustmentPage from './modules/admin/pages/StockAdjustmentPage';
import StockHistoryPage from './modules/admin/pages/StockHistoryPage';
import LowStockAlertsPage from './modules/admin/pages/LowStockAlertsPage';
import OfferListPage from './modules/admin/pages/OfferListPage';
import OfferFormPage from './modules/admin/pages/OfferFormPage';
import SingleOfferPage from './modules/user/pages/SingleOfferPage';

import InventoryReportsPage from './modules/admin/pages/InventoryReportsPage';
import HomepageSectionPage from './modules/admin/pages/HomepageSectionPage';
import WhyChooseUsPage from './modules/admin/pages/WhyChooseUsPage'; // New Page
import AboutSectionPage from './modules/admin/pages/AboutSectionPage'; // New Page
import HealthBenefitsSectionPage from './modules/admin/pages/HealthBenefitsSectionPage'; // New Page
import FAQSectionPage from './modules/admin/pages/FAQSectionPage'; // New Page
import FooterManagerPage from './modules/admin/pages/FooterManagerPage'; // New Page
import HeaderAnnouncementPage from './modules/admin/pages/HeaderAnnouncementPage'; // New Page
import HeaderCategoryPage from './modules/admin/pages/HeaderCategoryPage'; // New Page
import StaticPageEditor from './modules/admin/pages/StaticPageEditor'; // New Page
import PushNotificationPage from './modules/admin/pages/PushNotificationPage'; // New Page
import BlogListPage from './modules/admin/pages/BlogListPage'; // New Page 
import BlogFormPage from './modules/admin/pages/BlogFormPage'; // New Page
import BlogDetailPage from './modules/user/pages/BlogDetailPage'; // New Page
import ProtectedRoute from './components/ProtectedRoute'; // Auth Guard

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { Provider } from 'react-redux'; // Removed
// import store from './redux/store'; // Removed

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 401 (Unauthorized) or 403 (Forbidden) errors
        if (error?.message?.includes('401') || error?.message?.includes('403')) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      refetchOnWindowFocus: false, // Disable automatic refetch on window focus
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SmoothScroll>
          <Router>
            <ScrollToTop />
            <Toaster position="top-center" toastOptions={{ duration: 3000, style: { background: '#fff', color: '#333' } }} />
            <Routes>
              {/* User Routes */}
              <Route path="/" element={<UserLayout />}>
                <Route index element={<HomePage />} />
                <Route path="catalog" element={<CatalogPage />} />
                <Route path="product/:slug" element={<ProductDetailPage />} />
                <Route path="shop" element={<div className="p-20 text-center">Shop Page Coming Soon</div>} />
                <Route path="category/:category" element={<CatalogPage />} />
                <Route path="category/:category/:subCategory" element={<CatalogPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="order-success/:orderId" element={<OrderSuccessPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="order/:orderId" element={<OrderDetailPage />} />
                <Route path="returns" element={<ReturnsPage />} />
                <Route path="return/:returnId" element={<ReturnDetailPage />} />
                <Route path="replacement/:returnId" element={<ReturnDetailPage />} />
                <Route path="request-return/:orderId" element={<ReturnRequestPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="vault" element={<VaultPage />} />
                <Route path="profile/:tab?" element={<ProfilePage />} />
                <Route path="about-us" element={<InfoPage type="about-us" />} />
                <Route path="privacy-policy" element={<InfoPage type="privacy-policy" />} />
                <Route path="terms-conditions" element={<InfoPage type="terms-conditions" />} />
                <Route path="contact-us" element={<InfoPage type="contact-us" />} />
                <Route path="blog/:slug" element={<BlogDetailPage />} />
                <Route path="login" element={<AuthPage />} />
                <Route path="otp-verification" element={<OTPPage />} />
                <Route path="offers/:slug" element={<SingleOfferPage />} />
              </Route>

              <Route path="/admin/login" element={<LoginPage />} />

              {/* Admin Routes - Protected */}
              <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="users/:id" element={<UserDetailPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="sub-categories" element={<SubCategoriesPage />} />
                <Route path="products" element={<ProductListPage />} />
                <Route path="products/add" element={<ProductFormPage />} />
                <Route path="products/edit/:id" element={<ProductFormPage />} />
                <Route path="banners" element={<BannerListPage />} />
                <Route path="combo-categories" element={<ComboListPage />} />
                <Route path="combo-products" element={<ComboProductsPage />} />
                <Route path="combo-products/add" element={<ComboFormPage />} />
                <Route path="combo-products/edit/:id" element={<ComboFormPage />} />
                <Route path="combos/add" element={<ComboFormPage />} />
                <Route path="combos/edit/:id" element={<ComboFormPage />} />
                <Route path="orders" element={<OrderListPage />} />
                <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                <Route path="returns" element={<ReturnRequestsPage />} />
                <Route path="returns/:id" element={<AdminReturnDetailPage />} />
                <Route path="replacements" element={<ReplacementRequestsPage />} />
                <Route path="replacements/:id" element={<ReplacementDetailPage />} />
                <Route path="coupons" element={<CouponListPage />} />
                <Route path="coupons/add" element={<CouponFormPage />} />
                <Route path="coupons/edit/:id" element={<CouponFormPage />} />
                <Route path="referrals" element={<InfluencerReferralPage />} />
                <Route path="referrals/:id" element={<InfluencerDetailPage />} />
                <Route path="inventory/adjust" element={<StockAdjustmentPage />} />
                <Route path="inventory/history" element={<StockHistoryPage />} />
                <Route path="inventory/alerts" element={<LowStockAlertsPage />} />
                <Route path="inventory/reports" element={<InventoryReportsPage />} />
                <Route path="offers" element={<OfferListPage />} />
                <Route path="offers/add" element={<OfferFormPage />} />
                <Route path="offers/edit/:id" element={<OfferFormPage />} />
                <Route path="sections/why-choose-us" element={<WhyChooseUsPage />} />
                <Route path="sections/about-us" element={<AboutSectionPage />} />
                <Route path="sections/health-benefits" element={<HealthBenefitsSectionPage />} />
                <Route path="sections/:sectionId" element={<HomepageSectionPage />} />
                <Route path="manage-faq" element={<FAQSectionPage />} />
                <Route path="manage-header" element={<HeaderAnnouncementPage />} />
                <Route path="manage-header-categories" element={<HeaderCategoryPage />} />
                <Route path="manage-footer" element={<FooterManagerPage />} />
                <Route path="pages/:pageId" element={<StaticPageEditor />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="notifications" element={<PushNotificationPage />} />
                <Route path="reviews" element={<AdminReviewsPage />} />
                <Route path="reels" element={<ReelsPage />} />
                <Route path="blogs" element={<BlogListPage />} />
                <Route path="blogs/add" element={<BlogFormPage />} />
                <Route path="blogs/edit/:id" element={<BlogFormPage />} />
                <Route path="profile" element={<AdminProfilePage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </SmoothScroll>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
