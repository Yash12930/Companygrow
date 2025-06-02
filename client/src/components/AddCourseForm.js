// client/src/components/AddCourseForm.js
import React, { useState } from 'react';
import axios from 'axios';

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
  const [selectedTags, setSelectedTags] = useState([]);
  const [difficulty, setDifficulty] = useState('All Levels');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTagChange = (tag) => {
    setSelectedTags(prevTags =>
      prevTags.includes(tag)
        ? prevTags.filter(t => t !== tag)
        : [...prevTags, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!title || !description) {
      setError('Please enter course title and description.');
      return;
    }
    try {
      const response = await axios.post('/api/courses', {
        title,
        description,
        tags: selectedTags,
        difficulty
      });
      setSuccess('Course added successfully!');
      setTitle('');
      setDescription('');
      setSelectedTags([]);
      setDifficulty('All Levels');
      if (onCourseAdded) {
        onCourseAdded(response.data);
      }
    } catch (err) {
      console.error('Error adding course:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.msg || 'Failed to add course. Ensure you are logged in as Admin/Manager if required.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '16px', marginBottom: '16px', borderRadius: '8px' }}>
      <h3>Add New Course</h3>
      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginBottom: '10px' }}>{success}</p>}
      
      <div style={{ marginBottom: '12px' }}>
        <label htmlFor="courseTitleAddForm" style={{ display: 'block', marginBottom: '4px' }}>Title: </label>
        <input 
          type="text"
          id="courseTitleAddForm"
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <label htmlFor="courseDescriptionAddForm" style={{ display: 'block', marginBottom: '4px' }}>Description: </label>
        <textarea 
          id="courseDescriptionAddForm"
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          required 
          style={{ width: '100%', padding: '8px', minHeight: '80px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Skills/Tags:</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
          {predefinedSkills.map(skill => (
            <label key={skill + "-addform"} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', background: '#f0f0f0' }}>
              <input
                type="checkbox"
                id={`skill-checkbox-addform-${skill}`}
                value={skill}
                checked={selectedTags.includes(skill)}
                onChange={() => handleTagChange(skill)}
                style={{ marginRight: '6px' }}
              />
              {skill}
            </label>
          ))}
        </div>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="courseDifficultyAddForm" style={{ display: 'block', marginBottom: '4px' }}>Difficulty: </label>
        <select 
          id="courseDifficultyAddForm"
          value={difficulty} 
          onChange={e => setDifficulty(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          {difficultyLevels.map(level => (
            <option key={level + "-addform"} value={level}>{level}</option>
          ))}
        </select>
      </div>
      
      <button 
        type="submit" 
        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
      >
        Add Course
      </button>
    </form>
  );
}

export default AddCourseForm;
