// client/src/pages/EmployeeDashboard.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseList from '../components/CourseList';
import { Link } from 'react-router-dom';

function EmployeeDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [allCourses, setAllCourses] = useState([]);
    const [myEnrolledCourses, setMyEnrolledCourses] = useState([]); // To store full course objects
    const [myEnrolledCourseIds, setMyEnrolledCourseIds] = useState([]); // Just the IDs for quick checks
    const [loadingAllCourses, setLoadingAllCourses] = useState(true);
    const [loadingMyCourses, setLoadingMyCourses] = useState(true);

    const fetchAllCourses = async () => {
        setLoadingAllCourses(true);
        try {
            const response = await axios.get('/api/courses');
            setAllCourses(response.data);
        } catch (error) {
            console.error("Failed to fetch all courses", error);
        } finally {
            setLoadingAllCourses(false);
        }
    };

    const fetchMyEnrolledCourses = async () => {
        setLoadingMyCourses(true);
        try {
            // This endpoint now returns populated courses
            const response = await axios.get('/api/users/me/enrolled-courses'); 
            setMyEnrolledCourses(response.data);
            setMyEnrolledCourseIds(response.data.map(course => course._id));
        } catch (error) {
            console.error("Failed to fetch my enrolled courses", error);
        } finally {
            setLoadingMyCourses(false);
        }
    };

    useEffect(() => {
        if (user) { // Ensure user is loaded from AuthContext
            fetchAllCourses();
            fetchMyEnrolledCourses();
        }
    }, [user]);

    const handleCourseEnrolled = (enrolledCourseId) => {
        // Re-fetch enrolled courses to update the state and "Enrolled" status
        fetchMyEnrolledCourses();
        // Optionally, you could also update the allCourses list if needed,
        // but for just changing button text, re-fetching enrolled is enough.
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div>
            <nav>
                <Link to="/profile">My Profile</Link>
            </nav>
            <h1>Employee Dashboard</h1>
            <p>Welcome, {user?.name}!</p>
            <button onClick={handleLogout}>Logout</button>
            
            <hr style={{margin: "20px 0"}}/>

            <section>
                <h2>My Enrolled Courses</h2>
                {loadingMyCourses ? <p>Loading your courses...</p> : 
                    myEnrolledCourses.length > 0 ? 
                    <CourseList courses={myEnrolledCourses} showEnrollButton={false} /> : // Don't show enroll button for already enrolled list
                    <p>You are not enrolled in any courses yet.</p>
                }
            </section>

            <hr style={{margin: "20px 0"}}/>

            <section>
                <h2>Available Courses to Enroll</h2>
                {loadingAllCourses ? <p>Loading courses...</p> : 
                    <CourseList 
                        courses={allCourses} 
                        showEnrollButton={true} 
                        onEnrolled={handleCourseEnrolled}
                        enrolledCourseIds={myEnrolledCourseIds} 
                    />
                }
            </section>
        </div>
    );
}

export default EmployeeDashboard;
