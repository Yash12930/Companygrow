// client/src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Import your existing management components (assuming they exist and are styled or will be)
// import AddEmployeeForm from '../components/AddEmployeeForm';
// import EmployeeList from '../components/EmployeeList';
// import AddCourseForm from '../components/AddCourseForm';
// import CourseList from '../components/CourseList';

import './AdminDashboard.css'; // Import the CSS file

function AdminDashboard() {
    const { user, logout, token: contextToken } = useAuth(); // Rename token from context to avoid conflict
    const navigate = useNavigate();

    const [totalUsers, setTotalUsers] = useState(0);
    const [totalCourses, setTotalCourses] = useState(0);
    const [totalProjects, setTotalProjects] = useState(0);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const apiToken = contextToken || localStorage.getItem("token"); // Use context token or fallback to localStorage

        const fetchStats = async () => {
            if (!apiToken) { // Check if token is available from either source
                setIsLoadingStats(false);
                setError("Authentication token not found. Please log in.");
                return;
            }

            setIsLoadingStats(true);
            setError('');
            try {
                // Fetch total users
                const usersResponse = await axios.get('/api/users', {
                    headers: { Authorization: `Bearer ${apiToken}` }
                });
                setTotalUsers(usersResponse.data.length);

                // Fetch total courses
                const coursesResponse = await axios.get('/api/courses', {
                    headers: { Authorization: `Bearer ${apiToken}` }
                });
                setTotalCourses(coursesResponse.data.length);

                // Fetch total projects
                const projectsResponse = await axios.get('/api/projects', {
                    headers: { Authorization: `Bearer ${apiToken}` }
                });
                setTotalProjects(projectsResponse.data.length);

            } catch (err) {
                console.error("Error fetching dashboard stats:", err);
                let errorMessage = 'Failed to load dashboard statistics. Please try again later.';
                if (err.response) {
                    if (err.response.status === 401 || err.response.status === 403) {
                        errorMessage = 'Session expired or unauthorized. Please log in again.';
                        // Optional: redirect to login after a delay
                        // setTimeout(() => navigate('/login'), 3000);
                    } else if (err.response.data && err.response.data.msg) {
                        errorMessage = err.response.data.msg;
                    }
                }
                setError(errorMessage);
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchStats();

    }, [contextToken, navigate]); // Depend on contextToken, navigate

    const handleLogout = () => {
        logout(); // This should also clear localStorage token if AuthContext handles it
        navigate('/login');
    };

    // Dummy data/placeholders for sections if not fetching data directly on this page
    // If these sections are handled by separate pages, this dashboard becomes simpler.

    if (!user && !localStorage.getItem("token")) { // Redirect if no user and no token at all
        navigate('/login');
        return null; // Render nothing while redirecting
    }
    
    return (
        <div className="admin-dashboard">
            <nav className="dashboard-nav"> {/* Assuming similar nav as EmployeeDashboard */}
                <Link to="/profile">My Profile</Link>
                <button onClick={handleLogout} className="logout-button">Logout</button>
            </nav>
            <h1>Admin Dashboard</h1>
            <p className="welcome-message">Welcome, {user?.name || 'Admin'}!</p> {/* Fallback name */}
            
            {error && <p className="error-message" style={{color: 'red', backgroundColor: '#ffebee', border: '1px solid red', padding: '10px', borderRadius: '4px'}}>{error}</p>}

            <div className="dashboard-section-card"> {/* Using class from EmployeeDashboard.css for consistency */}
                <h2>Quick Overview</h2>
                {isLoadingStats ? (
                    <p className="loading-message">Loading statistics...</p>
                ) : (
                    <>
                        <p>Total Users: {totalUsers}</p>
                        <p>Total Courses: {totalCourses}</p>
                        <p>Total Projects: {totalProjects}</p>
                    </>
                )}
            </div>

            <div className="dashboard-section-card">
                <h2>Management Links</h2>
                <ul className="management-links">
                    <li><Link to="/manage-courses">Manage Courses</Link></li>
                    <li><Link to="/manage-employees">Manage Employees</Link></li>
                    <li><Link to="/project-management">Manage Projects</Link></li>
                </ul>
            </div>
            {/* Add more sections as needed */}
        </div>
    );
}

export default AdminDashboard;
