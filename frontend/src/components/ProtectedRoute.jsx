import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component that guards admin routes
 * Redirects to login if user is not authenticated or not an admin
 */
const ProtectedRoute = ({ children }) => {
    const auth = useAuth();
    const user = auth?.user || null;
    const loading = Boolean(auth?.loading);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // If context is unavailable (outside provider), fail-safe to login.
    if (!auth) {
        return <Navigate to="/admin/login" replace />;
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    // Check if user has admin role
    // Admin user is identified by email or explicit role field
    const isAdmin = user.role === 'admin' || user.email === 'admin@farmlyf.com';

    // Redirect to home if user is authenticated but not an admin
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    // User is authenticated and is an admin, render the protected content
    return children;
};

export default ProtectedRoute;
