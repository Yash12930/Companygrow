// client/src/pages/MyProfilePage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For navigation if needed

// Re-using the predefined skills list for editing skills (optional for this step, but good for future)
const predefinedSkills = [
    "JavaScript", "Python", "Java", "SQL", "HTML", "CSS", "React.js", "Node.js",
    "Data Analysis", "Project Management", "Communication", "Leadership",
    "Problem Solving", "Cloud Computing", "Cybersecurity", "DevOps",
    "Agile Methodologies", "UI/UX Design", "Marketing", "Sales"
];

function MyProfilePage() {
    const { user, logout, loading: authLoading, setUser: setAuthUser } = useAuth(); // Get setUser to update context
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // States for editing experience
    const [isEditingExperience, setIsEditingExperience] = useState(false);
    const [currentExperience, setCurrentExperience] = useState({
        _id: null, // For identifying existing experience item for update
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        description: ''
    });
    const [editingExperienceIndex, setEditingExperienceIndex] = useState(null); // To track which item is being edited

    // States for editing basic info (name, skills) - can be expanded
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [editableName, setEditableName] = useState('');
    const [editableSkills, setEditableSkills] = useState([]);


    useEffect(() => {
        if (!authLoading && user) {
            fetchProfile();
        } else if (!authLoading && !user) {
            navigate('/login'); // Redirect if not logged in
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
            setProfileData(response.data); // Update local profile data
            setAuthUser(prevUser => ({...prevUser, ...response.data})); // Update auth context if name/skills changed
            alert('Profile updated successfully!');
            setIsEditingInfo(false); // Close info edit form
            setIsEditingExperience(false); // Close experience edit form
            setCurrentExperience({ title: '', company: '', startDate: '', endDate: '', description: '', _id: null });
            setEditingExperienceIndex(null);
        } catch (err) {
            console.error("Error updating profile:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.msg || 'Failed to update profile.');
            alert(`Update failed: ${err.response?.data?.msg || 'Server error'}`);
        }
    };

    // --- Experience Management Handlers ---
    const handleExperienceChange = (e) => {
        setCurrentExperience({ ...currentExperience, [e.target.name]: e.target.value });
    };

    const handleAddOrUpdateExperience = () => {
        if (!currentExperience.title || !currentExperience.company || !currentExperience.startDate) {
            alert('Title, Company, and Start Date are required for experience.');
            return;
        }
        let updatedExperienceArray = [...(profileData.experience || [])];
        if (editingExperienceIndex !== null) { // Editing existing
            updatedExperienceArray[editingExperienceIndex] = currentExperience;
        } else { // Adding new
            updatedExperienceArray.push(currentExperience);
        }
        handleProfileUpdate({ experience: updatedExperienceArray });
    };

    const handleEditExperience = (exp, index) => {
        setIsEditingExperience(true);
        setCurrentExperience({ ...exp }); // Populate form with existing data
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
        setEditingExperienceIndex(null); // Indicates new item
    };

    // --- Info (Name, Skills) Management Handlers ---
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


    if (authLoading || isLoading) return <p>Loading profile...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!profileData) return <p>No profile data found.</p>;

    return (
        <div>
            <h1>My Profile</h1>
            <button onClick={() => { logout(); navigate('/login'); }}>Logout</button>

            {/* Display Basic Info */}
            <section>
                <h2>Basic Information</h2>
                {!isEditingInfo ? (
                    <>
                        <p><strong>Name:</strong> {profileData.name}</p>
                        <p><strong>Email:</strong> {profileData.email}</p>
                        <p><strong>Role:</strong> {profileData.role}</p>
                        <p><strong>Skills:</strong> {profileData.skills?.join(', ') || 'No skills listed'}</p>
                        <button onClick={() => { setEditableName(profileData.name); setEditableSkills(profileData.skills || []); setIsEditingInfo(true); }}>Edit Info</button>
                    </>
                ) : (
                    <div>
                        <div>
                            <label>Name: </label>
                            <input type="text" value={editableName} onChange={(e) => setEditableName(e.target.value)} />
                        </div>
                        <div style={{ margin: "10px 0" }}>
                            <label>Skills:</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', border: '1px solid #ccc', padding: '10px' }}>
                                {predefinedSkills.map(skill => (
                                    <div key={skill} style={{ flexBasis: 'calc(33.33% - 10px)'}}>
                                        <input
                                            type="checkbox"
                                            id={`profile-skill-${skill}`}
                                            value={skill}
                                            checked={editableSkills.includes(skill)}
                                            onChange={() => handleSkillChange(skill)}
                                        />
                                        <label htmlFor={`profile-skill-${skill}`} style={{ marginLeft: '5px' }}>{skill}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button onClick={handleInfoSubmit}>Save Info</button>
                        <button onClick={() => setIsEditingInfo(false)}>Cancel</button>
                    </div>
                )}
            </section>
            <hr />

            {/* Experience Section */}
            <section>
                <h2>Work Experience</h2>
                {!isEditingExperience && <button onClick={openNewExperienceForm}>Add New Experience</button>}
                
                {isEditingExperience && (
                    <div style={{ border: '1px solid green', padding: '10px', margin: '10px 0' }}>
                        <h3>{editingExperienceIndex !== null ? 'Edit Experience' : 'Add New Experience'}</h3>
                        <div><label>Title: <input type="text" name="title" value={currentExperience.title} onChange={handleExperienceChange} /></label></div>
                        <div><label>Company: <input type="text" name="company" value={currentExperience.company} onChange={handleExperienceChange} /></label></div>
                        <div><label>Start Date: <input type="date" name="startDate" value={currentExperience.startDate ? currentExperience.startDate.substring(0,10) : ''} onChange={handleExperienceChange} /></label></div>
                        <div><label>End Date (leave blank if current): <input type="date" name="endDate" value={currentExperience.endDate ? currentExperience.endDate.substring(0,10) : ''} onChange={handleExperienceChange} /></label></div>
                        <div><label>Description: <textarea name="description" value={currentExperience.description} onChange={handleExperienceChange}></textarea></label></div>
                        <button onClick={handleAddOrUpdateExperience}>{editingExperienceIndex !== null ? 'Update Experience' : 'Save Experience'}</button>
                        <button onClick={() => { setIsEditingExperience(false); setCurrentExperience({ title: '', company: '', startDate: '', endDate: '', description: '', _id:null }); setEditingExperienceIndex(null);}}>Cancel</button>
                    </div>
                )}

                {profileData.experience && profileData.experience.length > 0 ? (
                    profileData.experience.map((exp, index) => (
                        <div key={exp._id || index} style={{ border: '1px solid #eee', padding: '10px', margin: '10px 0' }}>
                            <h4>{exp.title} at {exp.company}</h4>
                            <p>
                                {new Date(exp.startDate).toLocaleDateString()} - 
                                {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                            </p>
                            <p>{exp.description}</p>
                            {!isEditingExperience && (
                                <>
                                    <button onClick={() => handleEditExperience(exp, index)}>Edit</button>
                                    <button onClick={() => handleRemoveExperience(index)} style={{marginLeft: '10px'}}>Remove</button>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No work experience added yet.</p>
                )}
            </section>
            <hr/>

            {/* Placeholder for Training Progress */}
            <section>
                <h2>Training Progress</h2>
                <p>Detailed training progress will be shown here soon.</p>
                {/* This will list enrolled courses and their progress once implemented */}
            </section>
        </div>
    );
}

export default MyProfilePage;
