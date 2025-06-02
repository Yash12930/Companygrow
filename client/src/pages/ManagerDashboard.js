import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ManagerDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div>
            <h1>Manager Dashboard</h1>
            <p>Welcome, {user?.name} (Manager)!</p>
            <nav>
                <ul>
                    <li><Link to="/manage-courses">Manage Courses</Link></li>
                    <li><Link to="/project-management">Manage Projects</Link></li>
                    {/* Add other manager-specific links here */}
                </ul>
            </nav>
            <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
            {/* Manager-specific content will go here */}
        </div>
    );
}

export default ManagerDashboard;