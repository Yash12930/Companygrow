// client/src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard'; // Kept from your HEAD
import CourseManagement from './pages/CourseManagement'; // Kept from your HEAD
import EmployeeManagement from './pages/EmployeeManagement'; // Kept from your HEAD
import ProjectManagement from './pages/ProjectManagement'; // Kept from your HEAD
import MyProfilePage from './pages/MyProfilePage'; // Kept from origin/main (friend's changes)
// We will use the locally defined ProtectedRoute, AdminRoute, ManagerAdminRoute for now
// import ProtectedRoute from './components/routing/ProtectedRoute'; // Commented out, using local versions
import './App.css';

// Your local ProtectedRoute (from HEAD)
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <p>Loading...</p>;
    return user ? children : <Navigate to="/login" />;
}

// Your local AdminRoute (from HEAD)
function AdminRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <p>Loading...</p>;
    return user && user.role === 'admin' ? children : <Navigate to="/" />;
}

// Your local ManagerAdminRoute (from HEAD)
function ManagerAdminRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <p>Loading...</p>;
    return user && (user.role === 'admin' || user.role === 'manager') ? children : <Navigate to="/" />;
}

// Your DashboardRedirect (from HEAD)
function DashboardRedirect() {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;

    switch (user.role) {
        case 'admin':
            return <Navigate to="/admin-dashboard" />;
        case 'manager':
            // Ensure ManagerDashboard component and route exist if redirecting here
            return <Navigate to="/manager-dashboard" />;
        case 'employee':
            return <Navigate to="/employee-dashboard" />;
        default:
            return <Navigate to="/login" />;
    }
}

function App() {
    // const { isAuthenticated, user } = useAuth(); // This was in your friend's version, but your ProtectedRoutes handle this logic

    return (
        <AuthProvider> {/* Single AuthProvider at the top level */}
            <div className="App">
                <Routes> {/* Single Routes component */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />

                    {/* Your main redirect logic */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <DashboardRedirect />
                        </ProtectedRoute>
                    } />

                    {/* Your specific dashboard routes */}
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
                     {/* Added ManagerDashboard route based on DashboardRedirect */}
                    <Route path="/manager-dashboard" element={
                        <ManagerAdminRoute> {/* Or specific ManagerRoute if you create one */}
                            <ManagerDashboard />
                        </ManagerAdminRoute>
                    }/>

                    {/* Your management routes */}
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

                    {/* Friend's Profile Page Route - integrated and protected */}
                    <Route path="/profile" element={
                        <ProtectedRoute> {/* All authenticated users can see their profile */}
                            <MyProfilePage />
                        </ProtectedRoute>
                    } />
                    
                    {/* Your fallback route from HEAD */}
                    <Route path="*" element={<Navigate to="/" />} />

                    {/* The following routes from origin/main seem to be an alternative way of structuring
                        or a different fallback logic. For now, I've used your HEAD's fallback.
                        If the `allowedRoles` prop on ProtectedRoute is from your friend's component,
                        and you decide to use that component, this section would need to be revisited.
                    */}
                    {/* 
                    <Route element={<ProtectedRoute allowedRoles={['employee', 'admin', 'manager']} />}>
                        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                    </Route>
                    */}
                    {/*
                    <Route 
                        path="*" 
                        element={
                            isAuthenticated // This variable is not defined in this scope if using your HEAD's AuthContext
                                ? <Navigate to={user?.role === 'admin' || user?.role === 'manager' ? "/admin/dashboard" : "/employee/dashboard"} replace /> 
                                : <Navigate to="/login" replace />
                        } 
                    />
                    */}
                </Routes>
            </div>
        </AuthProvider>
    );
}

export default App;
