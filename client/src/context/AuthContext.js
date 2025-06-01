// client/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Could be { id, name, email, role, token }
    const [loading, setLoading] = useState(true); // To check initial auth status

    useEffect(() => {
        // Check if token exists in localStorage on initial load
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user'); // Storing basic user info
        if (token && userData) {
            const parsedUser = JSON.parse(userData);
            setUser({ ...parsedUser, token });
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Set auth header for future requests
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            const { token, userId, role, name } = response.data;
            const userData = { id: userId, name, email, role }; // Store email too for convenience
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser({ ...userData, token });
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return { success: true, role: role };
        } catch (error) {
            console.error("Login failed:", error.response ? error.response.data : error.message);
            return { success: false, message: error.response?.data?.msg || 'Login failed' };
        }
    };

    const signup = async (name, email, password, skills, role = 'employee') => {
        try {
            const response = await axios.post('/api/auth/signup', { name, email, password, skills, role });
            const { token, userId, role: userRole, name: userName } = response.data;
            const userData = { id: userId, name: userName, email, role: userRole };

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser({ ...userData, token });
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return { success: true, role: userRole };
        } catch (error) {
            console.error("Signup failed:", error.response ? error.response.data : error.message);
            return { success: false, message: error.response?.data?.msg || 'Signup failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
