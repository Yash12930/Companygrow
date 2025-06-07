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
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        tags: '',
        difficulty: ''
    });

    // Fetch Courses
    const fetchCourses = useCallback(async () => {
        setIsLoadingCourses(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
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
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
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

    const startEditCourse = (course) => {
        setEditingCourseId(course._id);
        setEditFormData({
            title: course.title || '',
            description: course.description || '',
            tags: course.tags ? course.tags.join(', ') : '',
            difficulty: course.difficulty || ''
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
                difficulty: editFormData.difficulty.trim(),
                tags: editFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
            };
            
            // Fixed: Use courseId instead of id to match server endpoint
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
            setSelectedCourseId(""); // Reset selection after deletion
        } catch (error) {
            console.error("Error deleting course:", error);
            alert(error.response?.data?.msg || 'Failed to delete course.');
        }
    };

    const handleEditUser = async (updatedUser) => {
        try {
            const token = localStorage.getItem('token');
            const payload = {
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
                                <div className="course-details">
                                    {editingCourseId === selectedCourse._id ? (
                                        // Edit Form
                                        <form onSubmit={handleEditFormSubmit}> {/* Removed inline style */}
                                            <input
                                                name="title"
                                                value={editFormData.title}
                                                onChange={handleEditFormChange}
                                                placeholder="Course Title"
                                                required
                                                // Removed inline style
                                            />
                                            <textarea
                                                name="description"
                                                value={editFormData.description}
                                                onChange={handleEditFormChange}
                                                placeholder="Description"
                                                rows={3}
                                                // Removed inline style
                                            />
                                            <select
                                                name="difficulty"
                                                value={editFormData.difficulty}
                                                onChange={handleEditFormChange}
                                                // Removed inline style
                                            >
                                                <option value="">Select Difficulty</option>
                                                <option value="Beginner">Beginner</option>
                                                <option value="Intermediate">Intermediate</option>
                                                <option value="Advanced">Advanced</option>
                                                <option value="All Levels">All Levels</option>
                                            </select>
                                            <input
                                                name="tags"
                                                value={editFormData.tags}
                                                onChange={handleEditFormChange}
                                                placeholder="Tags (comma separated)"
                                                // Removed inline style
                                            />
                                            <div>
                                                <button
                                                    type="submit"
                                                    style={{ backgroundColor: '#4caf50' }} // Keep inline style for dynamic background color, relies on CSS for other properties
                                                >
                                                    Save Changes
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelEditCourse}
                                                    style={{ backgroundColor: '#777', marginLeft: '8px' }} // Keep inline style for dynamic background color, relies on CSS for other properties
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        // Display Course Details
                                        <>
                                            <h4>{selectedCourse.title}</h4>
                                            <p><strong>Description:</strong> {selectedCourse.description}</p>
                                            <p><strong>Difficulty:</strong> {selectedCourse.difficulty || "N/A"}</p>
                                            <p><strong>Tags:</strong> {selectedCourse.tags ? selectedCourse.tags.join(', ') : "N/A"}</p>
                                            <p><strong>Created:</strong> {new Date(selectedCourse.createdAt || Date.now()).toLocaleDateString()}</p>
                                            <button onClick={() => startEditCourse(selectedCourse)} style={{ backgroundColor: '#ffdd57' }}>Edit</button> {/* Keep inline style for dynamic background color */}
                                            <button onClick={() => handleDeleteCourse(selectedCourse._id)} style={{ backgroundColor: '#f76c6c', marginLeft: '10px' }}>Delete</button> {/* Keep inline style for dynamic background color */}
                                        </>
                                    )}
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