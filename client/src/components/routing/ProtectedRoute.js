// client/src/components/routing/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return <p>Loading authentication state...</p>; // Or a spinner component
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        // User is authenticated but does not have the required role
        // Redirect to a "not authorized" page or employee dashboard as fallback
        return <Navigate to="/employee/dashboard" replace />; // Or a dedicated /unauthorized page
    }

    return <Outlet />; // Render the child route (the actual protected page)
};

export default ProtectedRoute;
