import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddCourseForm from '../components/AddCourseForm'; // Assuming you have this component
import CourseList from '../components/CourseList'; // Assuming you have this component
import { useAuth } from '../context/AuthContext';

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
        <div>
            <h1>Course Management</h1>
            <AddCourseForm onCourseAdded={handleCourseAdded} />
            <h2>Existing Courses</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {isLoadingCourses ? (
                <p>Loading courses...</p>
            ) : (
                <CourseList 
                    courses={courses} 
                    // Pass admin/manager specific props if CourseList needs them
                    // e.g., showEditButton={true}, showDeleteButton={true}
                    // onEditCourse={handleEditCourse} onDeleteCourse={handleDeleteCourse}
                />
            )}
        </div>
    );
}

export default CourseManagement;