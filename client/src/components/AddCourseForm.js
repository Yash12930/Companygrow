// client/src/components/AddCourseForm.js
import React, { useState } from 'react';
import axios from 'axios';

// Reuse the predefined skills list (consider moving this to a shared constants file later)
const predefinedSkills = [
    "JavaScript", "Python", "Java", "SQL", "HTML", "CSS", "React.js", "Node.js",
    "Data Analysis", "Project Management", "Communication", "Leadership",
    "Problem Solving", "Cloud Computing", "Cybersecurity", "DevOps",
    "Agile Methodologies", "UI/UX Design", "Marketing", "Sales"
];
const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

function AddCourseForm({ onCourseAdded }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTags, setSelectedTags] = useState([]); // For course skills/tags
    const [difficulty, setDifficulty] = useState('All Levels');

    const handleTagChange = (tag) => {
        setSelectedTags(prevTags =>
            prevTags.includes(tag)
                ? prevTags.filter(t => t !== tag)
                : [...prevTags, tag]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !description) {
            alert('Please enter course title and description.');
            return;
        }
        try {
            const response = await axios.post('/api/courses', { 
                title, 
                description,
                tags: selectedTags, // Send selected tags
                difficulty        // Send difficulty
            });
            alert('Course added successfully!');
            setTitle('');
            setDescription('');
            setSelectedTags([]);
            setDifficulty('All Levels');
            if (onCourseAdded) {
                onCourseAdded(response.data);
            }
        } catch (error) {
            console.error('Error adding course:', error.response ? error.response.data : error.message);
            alert('Failed to add course. Check console for details. Ensure you are logged in as Admin/Manager.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add New Course</h2>
            <div>
                <label htmlFor="courseTitle">Title: </label>
                <input
                    type="text"
                    id="courseTitle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="courseDescription">Description: </label>
                <textarea
                    id="courseDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>

            {/* Course Tags (Skills) Selection */}
            <div style={{ margin: "10px 0" }}>
                <label>Course Skills/Tags:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', border: '1px solid #ccc', padding: '10px' }}>
                    {predefinedSkills.map(skill => (
                        <div key={`tag-${skill}`} style={{ flexBasis: 'calc(33.33% - 10px)'}}>
                            <input
                                type="checkbox"
                                id={`tag-${skill}`}
                                value={skill}
                                checked={selectedTags.includes(skill)}
                                onChange={() => handleTagChange(skill)}
                            />
                            <label htmlFor={`tag-${skill}`} style={{ marginLeft: '5px' }}>{skill}</label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Difficulty Selection */}
            <div style={{ margin: "10px 0" }}>
                <label htmlFor="courseDifficulty">Difficulty: </label>
                <select 
                    id="courseDifficulty" 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(e.target.value)}
                >
                    {difficultyLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                    ))}
                </select>
            </div>

            <button type="submit">Add Course</button>
        </form>
    );
}

export default AddCourseForm;
