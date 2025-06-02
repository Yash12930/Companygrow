import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmployeeList from '../components/EmployeeList'; // Assuming you have this component
// If you have a form for admins to add users (different from signup), import it here
// import AdminAddUserForm from '../components/AdminAddUserForm';
import { useAuth } from '../context/AuthContext';


function EmployeeManagement() {
    const [employees, setEmployees] = useState([]);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    const fetchEmployees = async () => {
        setIsLoadingEmployees(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            // Ensure this endpoint is protected and returns users for admin/manager
            const response = await axios.get('/api/users', {
                 headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(response.data);
        } catch (err) {
            console.error("Error fetching employees:", err.response ? err.response.data : err.message);
            setError('Failed to fetch employees.');
            setEmployees([]);
        } finally {
            setIsLoadingEmployees(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchEmployees();
        }
    }, [user]);

    // const handleEmployeeAdded = (newEmployee) => {
    //     fetchEmployees(); // Re-fetch the list
    // };

    // Add functions for updating roles, deleting users etc.

    return (
        <div>
            <h1>Employee Management</h1>
            {/* If admins can create users directly: */}
            {/* <AdminAddUserForm onEmployeeAdded={handleEmployeeAdded} /> */}
            <h2>Registered Users</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {isLoadingEmployees ? (
                <p>Loading employees...</p>
            ) : (
                <EmployeeList 
                    employees={employees} 
                    // Pass admin/manager specific props if EmployeeList needs them
                    // e.g., onEditUser={handleEditUser} onDeleteUser={handleDeleteUser}
                />
            )}
        </div>
    );
}

export default EmployeeManagement;