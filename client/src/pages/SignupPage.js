// client/src/pages/SignupPage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// Predefined list of skills
const predefinedSkills = [
    "JavaScript", "Python", "Java", "SQL", "HTML", "CSS", "React.js", "Node.js",
    "Data Analysis", "Project Management", "Communication", "Leadership",
    "Problem Solving", "Cloud Computing", "Cybersecurity", "DevOps",
    "Agile Methodologies", "UI/UX Design", "Marketing", "Sales"
];

function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedSkills, setSelectedSkills] = useState([]); // State for selected skills (array of strings)
    const [role, setRole] = useState('employee'); // Default role for signup
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSkillChange = (skill) => {
        setSelectedSkills(prevSkills =>
            prevSkills.includes(skill)
                ? prevSkills.filter(s => s !== skill) // Deselect if already selected
                : [...prevSkills, skill] // Select if not selected
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        // selectedSkills is already an array, no need to split a comma-separated string anymore
        const result = await signup(name, email, password, selectedSkills, role);
        if (result.success) {
            if (result.role === 'admin' || result.role === 'manager') {
                navigate('/admin/dashboard');
            } else {
                navigate('/employee/dashboard');
            }
        } else {
            setError(result.message || 'Failed to sign up. Please try again.');
        }
    };

    return (
        <div>
            <h2>Sign Up</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                
                {/* Skills Selection Section */}
                <div style={{ margin: "10px 0" }}>
                    <label>Skills:</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', border: '1px solid #ccc', padding: '10px' }}>
                        {predefinedSkills.map(skill => (
                            <div key={skill} style={{ flexBasis: 'calc(33.33% - 10px)' /* Adjust for layout */}}>
                                <input
                                    type="checkbox"
                                    id={`skill-${skill}`}
                                    value={skill}
                                    checked={selectedSkills.includes(skill)}
                                    onChange={() => handleSkillChange(skill)}
                                />
                                <label htmlFor={`skill-${skill}`} style={{ marginLeft: '5px' }}>{skill}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="role">Role:</label>
                    <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button type="submit">Sign Up</button>
            </form>
            <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    );
}

export default SignupPage;
