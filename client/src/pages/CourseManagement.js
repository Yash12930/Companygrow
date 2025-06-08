import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddCourseForm from '../components/AddCourseForm'; // Assuming you have this component
import CourseList from '../components/CourseList'; // Assuming you have this component
import { useAuth } from '../context/AuthContext';
import './CourseManagement.css'

function CourseManagement() {
    const [courses, setCourses] = useState([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth(); // Get user to ensure token is available for requests

    const fetchCourses = async () => {
        setIsLoadingCourses(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(response.data);
        } catch (err) {
            console.error("Error fetching courses:", err.response ? err.response.data : err.message);
            setError('Failed to fetch courses.');
            setCourses([]);
        } finally {
            setIsLoadingCourses(false);
        }
    };

    useEffect(() => {
        if (user) { // Ensure user context is loaded
            fetchCourses();
        }
    }, [user]);

    const handleCourseAdded = (newCourse) => {
        // Option 1: Add to local state
        // setCourses(prevCourses => [...prevCourses, newCourse]);
        // Option 2: Refetch all courses to ensure consistency
        fetchCourses();
    };
    
    // Add functions for updating and deleting courses if needed

    return (
    <div className="course-management">
        <h1>Course Management</h1>
        <p style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            fontSize: '1.1rem', 
            marginBottom: '2rem',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
        }}>
            Manage and organize your educational content
        </p>

        <div className="add-course-form-wrapper">
            <AddCourseForm onCourseAdded={handleCourseAdded} />
        </div>

        <h2>📚 Existing Courses</h2>
        
        {error && (
            <div className="error-message">
                <strong>⚠️ Error:</strong> {error}
            </div>
        )}
        
        {isLoadingCourses ? (
            <div className="loading-message">
                Loading courses...
            </div>
        ) : courses.length === 0 ? (
            <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '3rem 2rem',
                borderRadius: '20px',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📖</div>
                <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>No courses found</h3>
                <p>Start by adding your first course using the form above.</p>
            </div>
        ) : (
            <div className="course-grid">
                {courses.map(course => (
                    <div className="course-card" key={course._id}>
                        <h3>🎓 {course.title}</h3>
                        <p>
                            <strong>📝 Description:</strong> 
                            <span>{course.description}</span>
                        </p>
                        <p>
                            <strong>👨‍🏫 Instructor:</strong> 
                            <span>{course.instructor || "N/A"}</span>
                        </p>
                        <p>
                            <strong>⏱️ Duration:</strong> 
                            <span>{course.duration || "N/A"}</span>
                        </p>
                    </div>
                ))}
            </div>
        )}
    </div>
);
}

export default CourseManagement;