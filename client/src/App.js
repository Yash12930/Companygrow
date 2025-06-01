// client/src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ProtectedRoute from './components/routing/ProtectedRoute'; // Import ProtectedRoute
import './App.css';

function App() {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return <p>Loading application...</p>; // Or a global spinner
    }

    return (
        <div className="App">
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={user?.role === 'admin' || user?.role === 'manager' ? "/admin/dashboard" : "/employee/dashboard"} replace />} />
                <Route path="/signup" element={!isAuthenticated ? <SignupPage /> : <Navigate to={user?.role === 'admin' || user?.role === 'manager' ? "/admin/dashboard" : "/employee/dashboard"} replace />} />

                {/* Protected Routes for Admin/Manager */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    {/* Add other admin-specific routes here later, e.g., managing users, courses fully */}
                </Route>

                {/* Protected Routes for Employee (and also accessible by Admin/Manager) */}
                <Route element={<ProtectedRoute allowedRoles={['employee', 'admin', 'manager']} />}>
                    <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                    {/* Add other employee-specific routes here, e.g., my courses, profile */}
                </Route>
                
                {/* Fallback route - redirect to login or appropriate dashboard */}
                <Route 
                    path="*" 
                    element={
                        isAuthenticated 
                            ? <Navigate to={user?.role === 'admin' || user?.role === 'manager' ? "/admin/dashboard" : "/employee/dashboard"} replace /> 
                            : <Navigate to="/login" replace />
                    } 
                />
            </Routes>
        </div>
    );
}

export default App;
