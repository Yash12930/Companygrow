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
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // const [employees, setEmployees] = useState([]);
    // const [courses, setCourses] = useState([]);
    // const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
    // const [isLoadingCourses, setIsLoadingCourses] = useState(true);
    const [error, setError] = useState(''); // For general errors on this page

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Dummy data/placeholders for sections if not fetching data directly on this page
    // If these sections are handled by separate pages, this dashboard becomes simpler.

    return (
        <div className="admin-dashboard">
            <nav>
                <Link to="/profile">My Profile</Link>
            </nav>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {user?.name} (Admin)!</p>
            
            <nav>
                <ul>
                    <li><Link to="/manage-courses">Manage Courses</Link></li>
                    <li><Link to="/manage-employees">Manage Employees</Link></li>
                    <li><Link to="/project-management">Manage Projects</Link></li>
                </ul>
            </nav>

            {error && <p className="error-message">{error}</p>}

            <div className="dashboard-section">
                <h2>Quick Overview</h2>
                <p>This area can show summary statistics or quick actions.</p>
                {/* Example:
                <p>Total Users: {employees.length}</p>
                <p>Total Courses: {courses.length}</p> 
                */}
            </div>

            {/* 
                If you prefer to show lists directly on the dashboard instead of linking to separate pages,
                you would uncomment and integrate the fetching logic and components here.
                For example:
            */}
            {/*
            <div className="dashboard-section">
                <h2>Recent Employees</h2>
                {isLoadingEmployees ? <p className="loading-message">Loading employees...</p> : <EmployeeList employees={employees.slice(0, 5)} />} 
                <Link to="/manage-employees">View All Employees</Link>
            </div>

            <div className="dashboard-section">
                <h2>Recent Courses</h2>
                {isLoadingCourses ? <p className="loading-message">Loading courses...</p> : <CourseList courses={courses.slice(0, 5)} />}
                <Link to="/manage-courses">View All Courses</Link>
            </div>
            */}
            
            <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
        </div>
    );
}

export default AdminDashboard;
