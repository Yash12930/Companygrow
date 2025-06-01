// client/src/components/AddEmployeeForm.js
import React, { useState } from 'react';
import axios from 'axios'; // Import axios

function AddEmployeeForm({ onEmployeeAdded }) {
    const [name, setName] = useState('');
    const [skills, setSkills] = useState(''); // Skills as a comma-separated string for simplicity

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) {
            alert('Please enter an employee name.');
            return;
        }

        const skillsArray = skills.split(',').map(skill => skill.trim()).filter(skill => skill); // Split string into array, trim whitespace, remove empty strings

        try {
            // The proxy will automatically prepend http://localhost:5001 to this URL
            const response = await axios.post('/api/employees', {
                name,
                skills: skillsArray
            });
            alert('Employee added successfully!');
            setName('');
            setSkills('');
            if(onEmployeeAdded) {
                onEmployeeAdded(response.data); // Pass the new employee data up
            }
        } catch (error) {
            console.error('Error adding employee:', error.response ? error.response.data : error.message);
            alert('Failed to add employee. Check console for details.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add New Employee</h2>
            <div>
                <label htmlFor="name">Name: </label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="skills">Skills (comma-separated): </label>
                <input
                    type="text"
                    id="skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                />
            </div>
            <button type="submit">Add Employee</button>
        </form>
    );
}

export default AddEmployeeForm;
