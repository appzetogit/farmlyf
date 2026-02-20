
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Navbar from '../components/Navbar';
import CategoryNav from '../components/CategoryNav';
import OfferStrip from '../components/OfferStrip';
import Footer from '../components/Footer';
import FloatingContact from '../components/FloatingContact';
import BottomNavbar from '../components/BottomNavbar';
import { useNotifications } from '../../../hooks/useNotifications.jsx';

const UserLayout = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';
    
    // Initialize notification listeners and token registration
    useNotifications();

    return (
        <div className="flex flex-col min-h-screen font-sans bg-background">
            <header className="sticky top-0 shadow-md flex flex-col shrink-0 bg-white" style={{ zIndex: 100 }}>
                <div className="hidden md:block">
                    <TopBar />
                </div>
                <Navbar />
                <div className="hidden md:block">
                    <CategoryNav />
                </div>
                <OfferStrip />
            </header>
            <main className="flex-grow pb-16 md:pb-0">
                <Outlet />
            </main>
            <Footer />
            <FloatingContact />
            <BottomNavbar />
        </div>
    );
};

export default UserLayout;
