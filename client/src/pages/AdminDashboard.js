// client/src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import your existing management components
import AddEmployeeForm from '../components/AddEmployeeForm'; // Assuming this is for admin to add/manage basic profiles
import EmployeeList from '../components/EmployeeList';
import AddCourseForm from '../components/AddCourseForm';
import CourseList from '../components/CourseList';

function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [courses, setCourses] = useState([]);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);
    const [error, setError] = useState(''); // For general errors on this page

    // Fetch employees
    const fetchEmployees = async () => {
        setIsLoadingEmployees(true);
        setError('');
        try {
            // Remember we changed the GET route for users to /api/users in the backend for admin
            const response = await axios.get('/api/users'); 
            setEmployees(response.data);
        } catch (err) {
            console.error("Error fetching employees for admin:", err.response ? err.response.data : err.message);
            setError('Failed to fetch employees.');
            setEmployees([]);
        } finally {
            setIsLoadingEmployees(false);
        }
    };

    // Fetch courses
    const fetchCourses = async () => {
        setIsLoadingCourses(true);
        setError('');
        try {
            const response = await axios.get('/api/courses');
            setCourses(response.data);
        } catch (err) {
            console.error("Error fetching courses for admin:", err.response ? err.response.data : err.message);
            setError('Failed to fetch courses.');
            setCourses([]);
        } finally {
            setIsLoadingCourses(false);
        }
    };

    useEffect(() => {
        // Ensure user is loaded and is an admin/manager before fetching data
        // (though ProtectedRoute should already handle unauthorized access)
        if (user && (user.role === 'admin' || user.role === 'manager')) {
            fetchEmployees();
            fetchCourses();
        }
    }, [user]); // Re-fetch if user changes, though unlikely on this page once loaded

    const handleEmployeeAdded = (newEmployee) => {
        // If AddEmployeeForm is used by admin to create full profiles via signup endpoint
        // this might need adjustment, or AddEmployeeForm needs to be an AdminAddUserForm.
        // For now, assuming it adds to the list if AddEmployeeForm POSTs to an admin-specific create endpoint.
        // If AddEmployeeForm is NOT used by admin, this callback can be removed from it.
        // Let's assume for simplicity the old AddEmployeeForm is NOT for admin adding full users.
        // We'll rely on signup for user creation. The AdminDashboard lists users.
        // So, we might not need AddEmployeeForm here if users only signup.
        // Let's reconsider this part.
        // For now, let's assume admin can only LIST employees. Creation is via signup.
         fetchEmployees(); // Re-fetch the list
    };
    
    const handleCourseAdded = (newCourse) => {
        setCourses(prevCourses => [...prevCourses, newCourse]);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Decide if AddEmployeeForm is still relevant for Admin or if admins create users through a modified signup / dedicated admin tool
    // For this iteration, let's REMOVE AddEmployeeForm from admin dashboard,
    // assuming admins/managers are also created via the signup page by selecting their role.
    // The admin dashboard will manage existing users (view, edit, delete - later) and courses.

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {user?.name} ({user?.role})!</p>
            <button onClick={handleLogout}>Logout</button>
            {error && <p style={{color: 'red'}}>{error}</p>}

            <hr style={{ margin: "20px 0" }}/>

            <section>
                <h2>Manage Courses</h2>
                <AddCourseForm onCourseAdded={handleCourseAdded} />
                <h3>Existing Courses</h3>
                {isLoadingCourses ? <p>Loading courses...</p> : <CourseList courses={courses} />}
            </section>

            <hr style={{ margin: "20px 0" }}/>

            <section>
                <h2>Manage Employees/Users</h2>
                {/* 
                    If admins need to create user accounts directly from here, 
                    we'd need a specific AdminCreateUserForm that calls an admin-only backend endpoint
                    or potentially uses the /api/auth/signup endpoint with admin privileges.
                    For simplicity of this step, we assume admins are viewing users created via general signup.
                */}
                <h3>Registered Users</h3>
                {isLoadingEmployees ? <p>Loading employees...</p> : <EmployeeList employees={employees} />}
                {/* TODO: Add functionality to edit/delete users, view profiles in detail from here */}
            </section>
        </div>
    );
}

export default AdminDashboard;
