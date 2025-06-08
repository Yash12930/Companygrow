import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmployeeList from '../components/EmployeeList'; // Assuming you have this component
// If you have a form for admins to add users (different from signup), import it here
// import AdminAddUserForm from '../components/AdminAddUserForm';
import { useAuth } from '../context/AuthContext';
import './EmployeeManagement.css'; // Import the CSS file

function EmployeeManagement() {
    const [employees, setEmployees] = useState([]);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
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

    // Filter employees based on search term and role
    const filteredEmployees = employees.filter(employee => {
        const matchesSearch = employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            employee.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || employee.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Get role counts for stats
    const getRoleStats = () => {
        const roleCount = employees.reduce((acc, emp) => {
            acc[emp.role] = (acc[emp.role] || 0) + 1;
            return acc;
        }, {});
        return roleCount;
    };

    const roleStats = getRoleStats();

    return (
        <div className="employee-management-container">
            {/* Header Section */}
            <header className="employee-management-header">
                <h1 className="main-title">Employee Management</h1>
                <p className="header-subtitle">Manage and oversee your team members</p>
            </header>

            {/* Stats Section */}
            <div className="stats-container">
                <div className="stat-card">
                    <span className="stat-number">{employees.length}</span>
                    <span className="stat-label">Total Employees</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{roleStats.employee || 0}</span>
                    <span className="stat-label">Employees</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{roleStats.manager || 0}</span>
                    <span className="stat-label">Managers</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{roleStats.admin || 0}</span>
                    <span className="stat-label">Admins</span>
                </div>
            </div>

            {/* Action Bar */}
            <div className="action-bar">
                <div className="action-buttons">
                    <button className="btn btn-primary" onClick={fetchEmployees}>
                        🔄 Refresh List
                    </button>
                    {/* Uncomment when AdminAddUserForm is available */}
                    {/* <button className="btn btn-success">
                        ➕ Add Employee
                    </button> */}
                    <button className="btn btn-outline">
                        📊 Export Data
                    </button>
                </div>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search employees by name or email..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Filters Section */}
            <div className="filters-section">
                <h3 className="filters-title">Filter Options</h3>
                <div className="filters-grid">
                    <div className="filter-group">
                        <label className="filter-label">Filter by Role:</label>
                        <select 
                            className="filter-select"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="employee">Employee</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Sort by:</label>
                        <select className="filter-select">
                            <option value="name">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                            <option value="role">Role</option>
                            <option value="date">Date Added</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Content Section */}
            <section className="management-section">
                <div className="section-header">
                    <h2 className="section-title">Registered Users</h2>
                    <span className="employee-count">
                        Showing {filteredEmployees.length} of {employees.length} employees
                    </span>
                </div>

                {/* Error State */}
                {error && (
                    <div className="error-container">
                        <span className="error-icon">⚠️</span>
                        <div className="error-message">Error Loading Employees</div>
                        <div className="error-description">{error}</div>
                        <button className="btn btn-primary" onClick={fetchEmployees} style={{marginTop: '1rem'}}>
                            Try Again
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {isLoadingEmployees && (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <div className="loading-message">Loading employees...</div>
                    </div>
                )}

                {/* Employee List */}
                {!isLoadingEmployees && !error && (
                    <div className="employee-list-container">
                        {filteredEmployees.length > 0 ? (
                            <>
                                <div className="employee-list-header">
                                    <h3 className="employee-list-title">Employee Directory</h3>
                                    <p className="employee-count">
                                        {searchTerm && `Search results for "${searchTerm}"`}
                                        {roleFilter !== 'all' && ` • Filtered by ${roleFilter}`}
                                    </p>
                                </div>
                                <EmployeeList
                                    employees={filteredEmployees}
                                    // Pass admin/manager specific props if EmployeeList needs them
                                    // e.g., onEditUser={handleEditUser} onDeleteUser={handleDeleteUser}
                                />
                            </>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">👥</div>
                                <h3 className="empty-state-title">
                                    {searchTerm || roleFilter !== 'all' ? 'No matching employees found' : 'No employees found'}
                                </h3>
                                <p className="empty-state-description">
                                    {searchTerm || roleFilter !== 'all' 
                                        ? 'Try adjusting your search criteria or filters.' 
                                        : 'Start by adding some employees to your organization.'}
                                </p>
                                {(searchTerm || roleFilter !== 'all') && (
                                    <button 
                                        className="btn btn-outline"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setRoleFilter('all');
                                        }}
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* If admins can create users directly: */}
            {/* <section className="management-section">
                <AdminAddUserForm onEmployeeAdded={handleEmployeeAdded} />
            </section> */}
        </div>
    );
}

export default EmployeeManagement;