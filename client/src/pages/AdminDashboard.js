// client/src/pages/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import AddCourseForm from '../components/AddCourseForm'; // Your AddCourseForm
import CourseList from '../components/CourseList';     // Your existing CourseList
import EmployeeList from '../components/EmployeeList';   // Your existing EmployeeList
import './AdminDashboard.css'; // Your existing CSS file

function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [error, setError] = useState('');

    const fetchCourses = useCallback(async () => {
        setIsLoadingCourses(true);
        setError(''); 
        try {
            const response = await axios.get('/api/courses'); 
            setCourses(response.data);
        } catch (err) {
            console.error("AdminDashboard: Error fetching courses:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.msg || 'Failed to fetch courses.');
        } finally {
            setIsLoadingCourses(false);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        setError(''); 
        try {
            const response = await axios.get('/api/users'); 
            setUsers(response.data);
        } catch (err) {
            console.error("AdminDashboard: Error fetching users:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.msg || 'Failed to fetch users.');
        } finally {
            setIsLoadingUsers(false);
        }
    }, []);

    useEffect(() => {
        if (user && (user.role === 'admin' || user.role === 'manager')) {
            fetchCourses();
            fetchUsers();
        }
    }, [user, fetchCourses, fetchUsers]); // Removed navigate from dependencies as it should be stable

    const handleCourseAdded = (newCourse) => {
        fetchCourses(); 
    };

    // Placeholder handlers for Edit/Delete for CourseList and EmployeeList
    // These would be implemented when you add Edit/Delete features
    const handleEditCourse = (course) => alert(`Edit course: ${course.title} (Not implemented)`);
    const handleDeleteCourse = (courseId) => alert(`Delete course ID: ${courseId} (Not implemented)`);
    const handleEditUser = (employee) => alert(`Edit user: ${employee.name} (Not implemented)`);
    const handleDeleteUser = (employeeId) => alert(`Delete user ID: ${employeeId} (Not implemented)`);


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
        return <div className="loading-message">Loading dashboard or checking authorization...</div>;
    }

    return (
        <div className="admin-dashboard"> 
            <nav> 
                <ul>
                    <li><Link to="/profile">My Profile</Link></li>
                </ul>
                <button onClick={handleLogout}>Logout</button> 
            </nav>

            <h1>Admin Dashboard</h1>
            <p className="welcome-message">Welcome, {user.name} ({user.role})!</p>
            {error && <p className="error-message">{error}</p>}

            <section className="dashboard-section">
                <h2>Manage Courses</h2>
                <AddCourseForm onCourseAdded={handleCourseAdded} />
                <div className="list-container" style={{marginTop: '20px'}}>
                    <h3>Existing Courses</h3>
                    {isLoadingCourses ? (
                        <p className="loading-message">Loading courses...</p>
                    ) : (
                        <CourseList 
                            courses={courses} 
                            // Since this is admin view, don't show employee-specific buttons
                            showEnrollButton={false} 
                            showCompleteButton={false}
                            // Pass placeholder edit/delete handlers for future functionality
                            // and a prop to indicate it's an admin view if CourseList handles it
                            // For now, your CourseList doesn't have specific admin action UI
                            // so these props might not be used by it yet.
                            onEditCourse={handleEditCourse} // Example
                            onDeleteCourse={handleDeleteCourse} // Example
                        />
                    )}
                </div>
            </section>

            <section className="dashboard-section">
                <h2>Manage Users</h2>
                <div className="list-container" style={{marginTop: '20px'}}>
                    <h3>Registered Users</h3>
                    {isLoadingUsers ? (
                        <p className="loading-message">Loading users...</p>
                    ) : (
                        <EmployeeList 
                            employees={users} 
                            // Pass placeholder edit/delete handlers for future functionality
                            onEditUser={handleEditUser} // Example
                            onDeleteUser={handleDeleteUser} // Example
                        />
                    )}
                </div>
            </section>
            
            <section className="dashboard-section placeholder-section">
                <h2>Project Management (Coming Soon)</h2>
                <p>Assign projects based on skills/training, track progress.</p>
            </section>
             <section className="dashboard-section placeholder-section">
                <h2>Performance Analytics (Coming Soon)</h2>
                <p>Track training/project metrics and visualize progress.</p>
            </section>
        </div>
    );
}

export default AdminDashboard;
