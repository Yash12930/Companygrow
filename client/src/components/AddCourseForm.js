// client/src/components/AddCourseForm.js
import React, { useState } from 'react';
import axios from 'axios';

function AddCourseForm({ onCourseAdded }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !description) {
            alert('Please enter course title and description.');
            return;
        }
        try {
            const response = await axios.post('/api/courses', { title, description });
            alert('Course added successfully!');
            setTitle('');
            setDescription('');
            if (onCourseAdded) {
                onCourseAdded(response.data);
            }
        } catch (error) {
            console.error('Error adding course:', error.response ? error.response.data : error.message);
            alert('Failed to add course. Check console for details.');
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
            <button type="submit">Add Course</button>
        </form>
    );
}

export default AddCourseForm;
