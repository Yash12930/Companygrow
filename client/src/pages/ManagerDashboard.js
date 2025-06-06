import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ManagerDashboard.css';

function ManagerDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="manager-dashboard">
            <div className="dashboard-content">
                <header className="dashboard-header">
                    <h1 className="dashboard-title">🎯 Manager Dashboard</h1>
                    <p className="welcome-message">Welcome back, {user?.name}!</p>
                </header>

                {/* Quick Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-number">12</div>
                        <div className="stat-label">Active Courses</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">8</div>
                        <div className="stat-label">Projects</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">156</div>
                        <div className="stat-label">Total Students</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">94%</div>
                        <div className="stat-label">Completion Rate</div>
                    </div>
                </div>

                <nav className="dashboard-nav">
                    <ul className="nav-list">
                        <li className="nav-item">
                            <Link to="/manage-courses" className="nav-link">
                                <span className="nav-icon">📚</span>
                                Manage Courses
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/project-management" className="nav-link">
                                <span className="nav-icon">🚀</span>
                                Manage Projects
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/analytics" className="nav-link">
                                <span className="nav-icon">📊</span>
                                Analytics & Reports
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/user-management" className="nav-link">
                                <span className="nav-icon">👥</span>
                                User Management
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="logout-section">
                    <button onClick={handleLogout} className="logout-button">
                        🚪 Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ManagerDashboard;