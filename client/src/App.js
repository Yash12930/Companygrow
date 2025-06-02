// client/src/App.js
import React from 'react';
// Remove BrowserRouter as Router from here if it's in index.js
// If Router is ONLY here, then index.js should not have it.
// For this fix, we assume Router is in index.js
import { Routes, Route, Navigate } from 'react-router-dom'; 
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import CourseManagement from './pages/CourseManagement';
import EmployeeManagement from './pages/EmployeeManagement';
import ProjectManagement from './pages/ProjectManagement';
import './App.css';

// Protected route for general authenticated users
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <p>Loading...</p>; // Or a spinner
    return user ? children : <Navigate to="/login" />;
}

// Protected route for Admin
function AdminRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <p>Loading...</p>;
    return user && user.role === 'admin' ? children : <Navigate to="/" />;
}

// Protected route for Manager (or Admin)
function ManagerAdminRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <p>Loading...</p>;
    return user && (user.role === 'admin' || user.role === 'manager') ? children : <Navigate to="/" />;
}


function App() {
    return (
        <AuthProvider>
            <div className="App">
                {/* Router component removed from here */}
                {/* You might have a Navbar component here */}
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <DashboardRedirect />
                        </ProtectedRoute>
                    } />

                    <Route path="/employee-dashboard" element={
                        <ProtectedRoute>
                            <EmployeeDashboard />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/admin-dashboard" element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    } />
                    <Route path="/manage-courses" element={
                        <ManagerAdminRoute>
                            <CourseManagement />
                        </ManagerAdminRoute>
                    } />
                    <Route path="/manage-employees" element={ 
                        <AdminRoute> 
                            <EmployeeManagement />
                        </AdminRoute>
                    } />
                    <Route path="/project-management" element={
                        <ManagerAdminRoute> 
                            <ProjectManagement />
                        </ManagerAdminRoute>
                    } />
                    
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                {/* Router component removed from here */}
            </div>
        </AuthProvider>
    );
}

// Helper component to redirect based on role after login
function DashboardRedirect() {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;

    switch (user.role) {
        case 'admin':
            return <Navigate to="/admin-dashboard" />;
        case 'manager':
            return <Navigate to="/manager-dashboard" />; 
        case 'employee':
            return <Navigate to="/employee-dashboard" />;
        default:
            return <Navigate to="/login" />;
    }
}

export default App;
