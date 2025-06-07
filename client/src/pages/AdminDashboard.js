// // client/src/pages/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import AddCourseForm from '../components/AddCourseForm';
import EmployeeList from '../components/EmployeeList';
import './AdminDashboard.css';

function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [error, setError] = useState('');

    // Fetch Courses
    const fetchCourses = useCallback(async () => {
        setIsLoadingCourses(true);
        setError('');
        try {
            const response = await axios.get('/api/courses');
            setCourses(response.data);
        } catch (err) {
            console.error("AdminDashboard: Error fetching courses:", err);
            setError(err.response?.data?.msg || 'Failed to fetch courses.');
        } finally {
            setIsLoadingCourses(false);
        }
    }, []);

    // Fetch Users
    const fetchUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        setError('');
        try {
            const response = await axios.get('/api/users');
            setUsers(response.data);
        } catch (err) {
            console.error("AdminDashboard: Error fetching users:", err);
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
    }, [user, fetchCourses, fetchUsers]);

    // Handlers
    const handleCourseAdded = () => fetchCourses();

    const handleEditCourse = async (updatedCourse) => {
        try {
            await axios.put(`/api/courses/${updatedCourse._id}`, updatedCourse);
            alert('Course updated successfully!');
            fetchCourses();
        } catch (error) {
            console.error("Error updating course:", error);
            alert(error.response?.data?.msg || 'Failed to update course.');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            await axios.delete(`/api/courses/${courseId}`);
            alert('Course deleted successfully!');
            fetchCourses();
        } catch (error) {
            console.error("Error deleting course:", error);
            alert(error.response?.data?.msg || 'Failed to delete course.');
        }
    };

    const handleEditUser = async (updatedUser) => {
    try {
        const payload = {
            name: updatedUser.name,
            skills: updatedUser.skills,
            role: updatedUser.role,
        };
        await axios.put(`/api/users/${updatedUser._id}`, payload);
        alert('User updated successfully!');
        fetchUsers();
    } catch (error) {
        console.error("Error updating user:", error);
        alert(error.response?.data?.msg || 'Failed to update user.');
    }
};



    const handleDeleteUser = async (employeeId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`/api/users/${employeeId}`);
            alert('User deleted successfully!');
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            alert(error.response?.data?.msg || 'Failed to delete user.');
        }
    };

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

                {isLoadingCourses ? (
                    <p className="loading-message">Loading courses...</p>
                ) : (
                    <>
                        <div className="dropdown-container">
                            <label htmlFor="courseDropdown"><strong>Select a Course:</strong></label>
                            <select
                                id="courseDropdown"
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                            >
                                <option value="">-- Select a Course --</option>
                                {courses.map(course => (
                                    <option key={course._id} value={course._id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedCourseId && (() => {
                            const selectedCourse = courses.find(c => c._id === selectedCourseId);
                            return selectedCourse ? (
                                <div className="course-details">
                                    <h4>{selectedCourse.title}</h4>
                                    <p><strong>Description:</strong> {selectedCourse.description}</p>
                                    <p><strong>Instructor:</strong> {selectedCourse.instructor?.name || "N/A"}</p>
                                    <p><strong>Enrolled Users:</strong> {selectedCourse.enrolledUsers?.length || 0}</p>
                                    <button onClick={() => handleEditCourse(selectedCourse)}>Edit</button>
                                    <button onClick={() => handleDeleteCourse(selectedCourse._id)}>Delete</button>
                                </div>
                            ) : <p>Course not found.</p>;
                        })()}
                    </>
                )}
            </section>

            <section className="dashboard-section">
                <h2>Manage Users</h2>
                {isLoadingUsers ? (
                    <p className="loading-message">Loading users...</p>
                ) : (
                    <EmployeeList
                        employees={users}
                        onEdit={handleEditUser}
                        onDelete={handleDeleteUser}
                    />
                )}
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
