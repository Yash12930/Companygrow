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
    const [selectedCourseId, setSelectedCourseId] = useState("");
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
        </section>
        {selectedCourseId && (
        <div className="course-details">
            {(() => {
                const selectedCourse = courses.find(c => c._id === selectedCourseId);
                return selectedCourse ? (
                    <>
                        <h4>{selectedCourse.title}</h4>
                        <p><strong>Description:</strong> {selectedCourse.description}</p>
                        <p><strong>Instructor:</strong> {selectedCourse.instructor?.name || "N/A"}</p>
                        <p><strong>Enrolled Users:</strong> {selectedCourse.enrolledUsers?.length || 0}</p>
                    </>
                ) : <p>Course not found.</p>;
            })()}
        </div>
    )}
        <section className="dashboard-section">
            <h2>Manage Users</h2>
            {isLoadingUsers ? (
                <p className="loading-message">Loading users...</p>
            ) : (
                <div className="employee-grid">
                    {users.map((employee) => (
                        <div key={employee._id} className="employee-card">
                            <h4>{employee.name}</h4>
                            <p><strong>Email:</strong> {employee.email}</p>
                            <p><strong>Role:</strong> {employee.role}</p>
                        </div>
                    ))}
                </div>
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
