import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MyProfilePage.css'; // Import the CSS file

// Re-using the predefined skills list for editing skills (optional for this step, but good for future)
const predefinedSkills = [
    "JavaScript", "Python", "Java", "SQL", "HTML", "CSS", "React.js", "Node.js",
    "Data Analysis", "Project Management", "Communication", "Leadership",
    "Problem Solving", "Cloud Computing", "Cybersecurity", "DevOps",
    "Agile Methodologies", "UI/UX Design", "Marketing", "Sales"
];

function MyProfilePage() {
    const { user, logout, loading: authLoading, setUser: setAuthUser } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // States for editing experience
    const [isEditingExperience, setIsEditingExperience] = useState(false);
    const [currentExperience, setCurrentExperience] = useState({
        _id: null,
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        description: ''
    });
    const [editingExperienceIndex, setEditingExperienceIndex] = useState(null);

    // States for editing basic info (name, skills)
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [editableName, setEditableName] = useState('');
    const [editableSkills, setEditableSkills] = useState([]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchProfile();
        } else if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    const fetchProfile = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.get('/api/profile/me');
            setProfileData(response.data);
            setEditableName(response.data.name);
            setEditableSkills(response.data.skills || []);
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError('Failed to fetch profile data.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileUpdate = async (updatedFields) => {
        try {
            const response = await axios.put('/api/profile/me', updatedFields);
            setProfileData(response.data);
            setAuthUser(prevUser => ({...prevUser, ...response.data}));
            alert('Profile updated successfully!');
            setIsEditingInfo(false);
            setIsEditingExperience(false);
            setCurrentExperience({ title: '', company: '', startDate: '', endDate: '', description: '', _id: null });
            setEditingExperienceIndex(null);
        } catch (err) {
            console.error("Error updating profile:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.msg || 'Failed to update profile.');
            alert(`Update failed: ${err.response?.data?.msg || 'Server error'}`);
        }
    };

    // Experience Management Handlers
    const handleExperienceChange = (e) => {
        setCurrentExperience({ ...currentExperience, [e.target.name]: e.target.value });
    };

    const handleAddOrUpdateExperience = () => {
        if (!currentExperience.title || !currentExperience.company || !currentExperience.startDate) {
            alert('Title, Company, and Start Date are required for experience.');
            return;
        }
        let updatedExperienceArray = [...(profileData.experience || [])];
        if (editingExperienceIndex !== null) {
            updatedExperienceArray[editingExperienceIndex] = currentExperience;
        } else {
            updatedExperienceArray.push(currentExperience);
        }
        handleProfileUpdate({ experience: updatedExperienceArray });
    };

    const handleEditExperience = (exp, index) => {
        setIsEditingExperience(true);
        setCurrentExperience({ ...exp });
        setEditingExperienceIndex(index);
    };
    
    const handleRemoveExperience = (indexToRemove) => {
        if (window.confirm("Are you sure you want to remove this experience item?")) {
            const updatedExperienceArray = profileData.experience.filter((_, index) => index !== indexToRemove);
            handleProfileUpdate({ experience: updatedExperienceArray });
        }
    };
    
    const openNewExperienceForm = () => {
        setIsEditingExperience(true);
        setCurrentExperience({ title: '', company: '', startDate: '', endDate: '', description: '', _id: null });
        setEditingExperienceIndex(null);
    };

    // Info (Name, Skills) Management Handlers
    const handleInfoSubmit = () => {
        handleProfileUpdate({ name: editableName, skills: editableSkills });
    };

    const handleSkillChange = (skill) => {
        setEditableSkills(prevSkills =>
            prevSkills.includes(skill)
                ? prevSkills.filter(s => s !== skill)
                : [...prevSkills, skill]
        );
    };

    if (authLoading || isLoading) return <p className="loading-message">Loading profile...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!profileData) return <p className="no-data-message">No profile data found.</p>;

    return (
        <div className="profile-container">
            <header className="profile-header">
                <h1 className="profile-title">My Profile</h1>
                <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}>
                    Logout
                </button>
            </header>

            {/* Display Basic Info */}
            <section className="profile-section">
                <h2 className="section-title">Basic Information</h2>
                {!isEditingInfo ? (
                    <div className="info-display">
                        <div className="info-item">
                            <span className="info-label">Name:</span>
                            <span className="info-value">{profileData.name}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Email:</span>
                            <span className="info-value">{profileData.email}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Role:</span>
                            <span className="info-value">{profileData.role}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Skills:</span>
                            <div className="skills-list">
                                {profileData.skills?.length > 0 ? (
                                    profileData.skills.map(skill => (
                                        <span key={skill} className="skill-tag">{skill}</span>
                                    ))
                                ) : (
                                    <span className="info-value">No skills listed</span>
                                )}
                            </div>
                        </div>
                        <button 
                            className="btn btn-primary"
                            onClick={() => { 
                                setEditableName(profileData.name); 
                                setEditableSkills(profileData.skills || []); 
                                setIsEditingInfo(true); 
                            }}
                        >
                            Edit Info
                        </button>
                    </div>
                ) : (
                    <div className="edit-form">
                        <div className="form-group">
                            <label className="form-label">Name:</label>
                            <input 
                                type="text" 
                                className="form-input"
                                value={editableName} 
                                onChange={(e) => setEditableName(e.target.value)} 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Skills:</label>
                            <div className="skills-grid">
                                {predefinedSkills.map(skill => (
                                    <div key={skill} className="skill-checkbox-item">
                                        <input
                                            type="checkbox"
                                            className="skill-checkbox"
                                            id={`profile-skill-${skill}`}
                                            value={skill}
                                            checked={editableSkills.includes(skill)}
                                            onChange={() => handleSkillChange(skill)}
                                        />
                                        <label 
                                            htmlFor={`profile-skill-${skill}`} 
                                            className="skill-checkbox-label"
                                        >
                                            {skill}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="form-actions">
                            <button className="btn btn-success" onClick={handleInfoSubmit}>
                                Save Info
                            </button>
                            <button className="btn btn-secondary" onClick={() => setIsEditingInfo(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* Experience Section */}
            <section className="profile-section">
                <h2 className="section-title">Work Experience</h2>
                {!isEditingExperience && (
                    <button className="btn btn-primary" onClick={openNewExperienceForm}>
                        Add New Experience
                    </button>
                )}
                
                {isEditingExperience && (
                    <div className="experience-form">
                        <h3 className="experience-form-title">
                            {editingExperienceIndex !== null ? 'Edit Experience' : 'Add New Experience'}
                        </h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Title:</label>
                                <input 
                                    type="text" 
                                    name="title" 
                                    className="form-input"
                                    value={currentExperience.title} 
                                    onChange={handleExperienceChange} 
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Company:</label>
                                <input 
                                    type="text" 
                                    name="company" 
                                    className="form-input"
                                    value={currentExperience.company} 
                                    onChange={handleExperienceChange} 
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Start Date:</label>
                                <input 
                                    type="date" 
                                    name="startDate" 
                                    className="form-input"
                                    value={currentExperience.startDate ? currentExperience.startDate.substring(0,10) : ''} 
                                    onChange={handleExperienceChange} 
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">End Date (leave blank if current):</label>
                                <input 
                                    type="date" 
                                    name="endDate" 
                                    className="form-input"
                                    value={currentExperience.endDate ? currentExperience.endDate.substring(0,10) : ''} 
                                    onChange={handleExperienceChange} 
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description:</label>
                            <textarea 
                                name="description" 
                                className="form-textarea"
                                value={currentExperience.description} 
                                onChange={handleExperienceChange}
                                placeholder="Describe your role and achievements..."
                            />
                        </div>
                        <div className="form-actions">
                            <button className="btn btn-success" onClick={handleAddOrUpdateExperience}>
                                {editingExperienceIndex !== null ? 'Update Experience' : 'Save Experience'}
                            </button>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => { 
                                    setIsEditingExperience(false); 
                                    setCurrentExperience({ title: '', company: '', startDate: '', endDate: '', description: '', _id:null }); 
                                    setEditingExperienceIndex(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {profileData.experience && profileData.experience.length > 0 ? (
                    profileData.experience.map((exp, index) => (
                        <div key={exp._id || index} className="experience-item">
                            <h4 className="experience-title">{exp.title} at {exp.company}</h4>
                            <p className="experience-duration">
                                {new Date(exp.startDate).toLocaleDateString()} - 
                                {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                            </p>
                            <p className="experience-description">{exp.description}</p>
                            {!isEditingExperience && (
                                <div className="experience-actions">
                                    <button className="btn btn-primary" onClick={() => handleEditExperience(exp, index)}>
                                        Edit
                                    </button>
                                    <button className="btn btn-danger" onClick={() => handleRemoveExperience(index)}>
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="no-experience">No work experience added yet.</p>
                )}
            </section>

            {/* Placeholder for Training Progress */}
            <section className="profile-section">
                <h2 className="section-title">Training Progress</h2>
                <div className="training-placeholder">
                    <p>Detailed training progress will be shown here soon.</p>
                    <small>This will list enrolled courses and their progress once implemented</small>
                </div>
            </section>
        </div>
    );
}

export default MyProfilePage;
