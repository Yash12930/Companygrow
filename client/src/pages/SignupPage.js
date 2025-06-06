// SignupPage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './SignupPage.css';

const predefinedSkills = [
  "JavaScript", "Python", "Java", "SQL", 
  "React.js", "Node.js", "Data Analysis", 
  "Project Management", "UI/UX Design"
];

function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [role, setRole] = useState('employee');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSkillChange = (skill) => {
    setSelectedSkills(prev => prev.includes(skill) 
      ? prev.filter(s => s !== skill)
      : [...prev, skill]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (selectedSkills.length < 3) {
      setError('Please select at least 3 skills');
      return;
    }

    const result = await signup(name, email, password, selectedSkills, role);
    
    if (result.success) {
      navigate(result.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
    } else {
      setError(result.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Create Account</h1>
          <p>Start your journey with us</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Select Role</label>
            <div className="role-select">
              <label>
                <input
                  type="radio"
                  value="employee"
                  checked={role === 'employee'}
                  onChange={() => setRole('employee')}
                />
                Employee
              </label>
              <label>
                <input
                  type="radio"
                  value="manager"
                  checked={role === 'manager'}
                  onChange={() => setRole('manager')}
                />
                Manager
              </label>
              <label>
                <input
                  type="radio"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                />
                Admin
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Skills (Select 3+)</label>
            <div className="skills-grid">
              {predefinedSkills.map((skill) => (
                <label key={skill} className="skill-option">
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill)}
                    onChange={() => handleSkillChange(skill)}
                  />
                  {skill}
                </label>
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="signup-button">
            Create Account
          </button>
        </form>

        <div className="signup-footer">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
