import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import AddCourseForm from '../components/AddCourseForm';
import EmployeeList from '../components/EmployeeList';
import './AdminDashboard.css'; // Ensure this CSS file exists and is styled

function AdminDashboard() {
    const { user, logout, token: contextToken } = useAuth();
    const navigate = useNavigate();

    // Stats states
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalCourses, setTotalCourses] = useState(0);
    const [totalProjects, setTotalProjects] = useState(0);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    
    // General error state for the page
    const [pageError, setPageError] = useState(''); // Renamed to avoid conflict if other error states are needed

    // Course management states
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        tags: '',
        difficulty: ''
    });

    // User management states
    const [users, setUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);

    // Fetch Dashboard Stats
    useEffect(() => {
        const apiToken = contextToken || localStorage.getItem("token");

        const fetchStats = async () => {
            if (!apiToken) {
                setIsLoadingStats(false);
                setPageError("Authentication token not found. Please log in.");
                return;
            }
            setIsLoadingStats(true);
            setPageError('');
            try {
                const usersResponse = await axios.get('/api/users', {
                    headers: { Authorization: `Bearer ${apiToken}` }
                });
                setTotalUsers(usersResponse.data.length);

                const coursesResponse = await axios.get('/api/courses', { // Assuming this is a general count
                    headers: { Authorization: `Bearer ${apiToken}` }
                });
                setTotalCourses(coursesResponse.data.length);

                const projectsResponse = await axios.get('/api/projects', {
                    headers: { Authorization: `Bearer ${apiToken}` }
                });
                setTotalProjects(projectsResponse.data.length);
            } catch (err) {
                console.error("Error fetching dashboard stats:", err);
                let errorMessage = 'Failed to load dashboard statistics.';
                if (err.response) {
                    if (err.response.status === 401 || err.response.status === 403) {
                        errorMessage = 'Session expired or unauthorized. Please log in again.';
                    } else if (err.response.data && err.response.data.msg) {
                        errorMessage = err.response.data.msg;
                    }
                }
                setPageError(errorMessage);
            } finally {
                setIsLoadingStats(false);
            }
        };
        fetchStats();
    }, [contextToken]); // Removed navigate from deps as it's stable

    // Fetch Courses for Management
    const fetchCourses = useCallback(async () => {
        setIsLoadingCourses(true);
        // setPageError(''); // Avoid clearing pageError from other fetches
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/courses', { // This might be the same as stats, or a more detailed list
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(response.data);
        } catch (err) {
            console.error("AdminDashboard: Error fetching courses:", err);
            setPageError(err.response?.data?.msg || 'Failed to fetch courses for management.');
        } finally {
            setIsLoadingCourses(false);
        }
    }, []);

    // Fetch Users for Management
    const fetchUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        // setPageError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (err) {
            console.error("AdminDashboard: Error fetching users:", err);
            setPageError(err.response?.data?.msg || 'Failed to fetch users for management.');
        } finally {
            setIsLoadingUsers(false);
        }
    }, []);

    useEffect(() => {
        if (user && (user.role === 'admin' || user.role === 'manager')) {
            const token = contextToken || localStorage.getItem("token");
            if (token) { // Ensure token exists before fetching management data
                fetchCourses();
                fetchUsers();
            }
        }
    }, [user, contextToken, fetchCourses, fetchUsers]);


    const handleCourseAdded = () => fetchCourses();

    const startEditCourse = (course) => {
        setEditingCourseId(course._id);
        setEditFormData({
            title: course.title || '',
            description: course.description || '',
            tags: course.tags ? course.tags.join(', ') : '',
            difficulty: course.difficulty || 'All Levels' // Default if not set
        });
    };

    const cancelEditCourse = () => {
        setEditingCourseId(null);
        setEditFormData({ title: '', description: '', tags: '', difficulty: '' });
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditFormSubmit = async (e) => {
        e.preventDefault();
        if (!editFormData.title.trim()) {
            alert('Title is required.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const updatedCourse = {
                title: editFormData.title.trim(),
                description: editFormData.description.trim(),
                difficulty: editFormData.difficulty.trim() || 'All Levels',
                tags: editFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
            };
            await axios.put(`/api/courses/${editingCourseId}`, updatedCourse, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Course updated successfully!');
            fetchCourses();
            cancelEditCourse();
        } catch (error) {
            console.error("Error updating course:", error);
            alert(error.response?.data?.msg || 'Failed to update course.');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Course deleted successfully!');
            fetchCourses();
            if (selectedCourseId === courseId) setSelectedCourseId("");
            if (editingCourseId === courseId) cancelEditCourse();
        } catch (error) {
            console.error("Error deleting course:", error);
            alert(error.response?.data?.msg || 'Failed to delete course.');
        }
    };

    const handleEditUser = async (updatedUser) => {
        try {
            const token = localStorage.getItem('token');
            const payload = { // Only send fields that can be edited
                name: updatedUser.name,
                skills: updatedUser.skills,
                role: updatedUser.role,
            };
            await axios.put(`/api/users/${updatedUser._id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
            const token = localStorage.getItem('token');
            await axios.delete(`/api/users/${employeeId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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

    // Authorization Check
    useEffect(() => {
        const currentToken = contextToken || localStorage.getItem("token");
        if (!currentToken) {
            navigate('/login');
        } else if (user && user.role !== 'admin' && user.role !== 'manager') {
            // If user data is loaded but role is not admin/manager
            setPageError("Access Denied: You do not have permission to view this page.");
            // Optionally navigate away: navigate('/unauthorized'); or navigate('/');
        }
    }, [user, contextToken, navigate]);


    if (!user && (contextToken || localStorage.getItem("token"))) {
        // Token exists, but user object not yet populated by useAuth
        return <div className="loading-message">Loading user data...</div>;
    }
    if (!user && !(contextToken || localStorage.getItem("token"))) {
        // No token and no user, should be caught by useEffect above to navigate, but as a fallback:
        return <div className="loading-message">Redirecting to login...</div>;
    }
     if (user && user.role !== 'admin' && user.role !== 'manager') {
        return (
            <div className="admin-dashboard">
                <nav className="dashboard-nav">
                    <Link to="/profile">My Profile</Link>
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </nav>
                <h1>Admin Dashboard</h1>
                <p className="error-message">{pageError || "Access Denied: You do not have permission to view this page."}</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <nav className="dashboard-nav">
                <Link to="/profile">My Profile</Link>
                <button onClick={handleLogout} className="logout-button">Logout</button>
            </nav>
            <h1>Admin Dashboard</h1>
            <p className="welcome-message">Welcome, {user?.name || 'Admin'} ({user?.role})!</p>
            
            {pageError && <p className="error-message" style={{color: 'red', backgroundColor: '#ffebee', border: '1px solid red', padding: '10px', borderRadius: '4px', marginBottom: '15px'}}>{pageError}</p>}

            <section className="dashboard-section-card">
                <h2>Quick Overview</h2>
                {isLoadingStats ? (
                    <p className="loading-message">Loading statistics...</p>
                ) : (
                    <div className="stats-overview">
                        <p>Total Users: {totalUsers}</p>
                        <p>Total Courses: {totalCourses}</p>
                        <p>Total Projects: {totalProjects}</p>
                    </div>
                )}
            </section>

            {/* Removed the generic "Management Links" section as we are embedding management here */}

            <section className="dashboard-section-card">
                <h2>Manage Courses</h2>
                <AddCourseForm onCourseAdded={handleCourseAdded} />
                {isLoadingCourses ? (
                    <p className="loading-message">Loading courses...</p>
                ) : (
                    <div className="course-management-area">
                        <div className="dropdown-container">
                            <label htmlFor="courseDropdown"><strong>Select a Course to View/Edit:</strong></label>
                            <select
                                id="courseDropdown"
                                value={selectedCourseId}
                                onChange={(e) => {
                                    setSelectedCourseId(e.target.value);
                                    if (editingCourseId && editingCourseId !== e.target.value) cancelEditCourse();
                                }}
                            >
                                <option value="">-- Select a Course --</option>
                                {courses && courses.length > 0 ? (
                                    courses.map(course => (
                                        <option key={course._id} value={course._id}>
                                            {course.title}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No courses available</option>
                                )}
                            </select>
                        </div>

                        {selectedCourseId && (() => {
                            const selectedCourse = courses.find(c => c._id === selectedCourseId);
                            return selectedCourse ? (
                                <div className="course-details-admin"> {/* Added specific class */}
                                    {editingCourseId === selectedCourse._id ? (
                                        <form onSubmit={handleEditFormSubmit} className="edit-course-form">
                                            <input
                                                name="title" value={editFormData.title} onChange={handleEditFormChange}
                                                placeholder="Course Title" required
                                            />
                                            <textarea
                                                name="description" value={editFormData.description} onChange={handleEditFormChange}
                                                placeholder="Description" rows={3}
                                            />
                                            <select name="difficulty" value={editFormData.difficulty} onChange={handleEditFormChange}>
                                                <option value="">Select Difficulty</option>
                                                <option value="Beginner">Beginner</option>
                                                <option value="Intermediate">Intermediate</option>
                                                <option value="Advanced">Advanced</option>
                                                <option value="All Levels">All Levels</option>
                                            </select>
                                            <input
                                                name="tags" value={editFormData.tags} onChange={handleEditFormChange}
                                                placeholder="Tags (comma separated)"
                                            />
                                            <div className="form-actions">
                                                <button type="submit" className="button-save">Save Changes</button>
                                                <button type="button" onClick={cancelEditCourse} className="button-cancel">Cancel</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <h4>{selectedCourse.title}</h4>
                                            <p><strong>Description:</strong> {selectedCourse.description}</p>
                                            <p><strong>Difficulty:</strong> {selectedCourse.difficulty || "N/A"}</p>
                                            <p><strong>Tags:</strong> {selectedCourse.tags && selectedCourse.tags.length > 0 ? selectedCourse.tags.join(', ') : "N/A"}</p>
                                            <p><strong>Created:</strong> {new Date(selectedCourse.createdAt || Date.now()).toLocaleDateString()}</p>
                                            <div className="item-actions">
                                                <button onClick={() => startEditCourse(selectedCourse)} className="button-edit">Edit</button>
                                                <button onClick={() => handleDeleteCourse(selectedCourse._id)} className="button-delete">Delete</button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : <p className="info-message">Course not found or selection cleared.</p>;
                        })()}
                    </div>
                )}
            </section>

            <section className="dashboard-section-card">
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

            {/* Placeholder sections from the original merge, can be developed later */}
            <section className="dashboard-section-card placeholder-section">
                <h2>Project Management (Coming Soon)</h2>
                <p>Assign projects based on skills/training, track progress.</p>
            </section>

            <section className="dashboard-section-card placeholder-section">
                <h2>Performance Analytics (Coming Soon)</h2>
                <p>Track training/project metrics and visualize progress.</p>
            </section>
        </div>
    );
}

export default AdminDashboard;