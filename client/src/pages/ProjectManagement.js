import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProjectManagement.css";

function ProjectManagement() {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ title: "", description: "", requiredSkills: "", deadline: "" });
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch all projects and users
    useEffect(() => {
        fetchProjects();
        fetchUsers();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await axios.get("/api/projects", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
            setProjects(res.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to load projects");
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get("/api/users", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
            setUsers(res.data);
        } catch (err) {
            setError("Failed to load users");
        }
    };

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleEmployeeSelect = (e) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedEmployees(value);
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await axios.post(
                "/api/projects",
                {
                    ...form,
                    requiredSkills: form.requiredSkills.split(",").map(s => s.trim()),
                    assignedEmployees: selectedEmployees,
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            setForm({ title: "", description: "", requiredSkills: "", deadline: "" });
            setSelectedEmployees([]);
            fetchProjects();
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to create project");
        }
    };

    return (
    <div className="project-container">
        <h1>🚀 Project Management</h1>
        
        <form onSubmit={handleCreateProject}>
            <input
                name="title"
                placeholder="📝 Project Title"
                value={form.title}
                onChange={handleInputChange}
                required
            />
            <input
                name="description"
                placeholder="📋 Project Description"
                value={form.description}
                onChange={handleInputChange}
                required
            />
            <input
                name="requiredSkills"
                placeholder="🔧 Required Skills (comma separated)"
                value={form.requiredSkills}
                onChange={handleInputChange}
            />
            <input
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={handleInputChange}
                title="📅 Project Deadline"
            />
            <select 
                multiple 
                value={selectedEmployees} 
                onChange={handleEmployeeSelect}
                title="👥 Select Team Members (Hold Ctrl/Cmd for multiple selection)"
            >
                {users.map(u => (
                    <option key={u._id} value={u._id}>
                        {u.name} ({u.email})
                    </option>
                ))}
            </select>
            <button type="submit">✨ Create Project</button>
        </form>

        {error && <div className="error">⚠️ {error}</div>}

        <h2>📊 All Projects</h2>
        {loading ? (
            <div className="loading-message">Loading projects...</div>
        ) : projects.length === 0 ? (
            <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '3rem 2rem',
                borderRadius: '20px',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                maxWidth: '600px',
                margin: '2rem auto'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>No projects found</h3>
                <p>Create your first project using the form above.</p>
            </div>
        ) : (
            <ul className="project-list">
                {projects.map(p => (
                    <li key={p._id}>
                        <b>🎯 {p.title}</b>
                        <div className="project-info">
                            <strong>📝 Description:</strong> {p.description}
                        </div>
                        <div className="project-info">
                            <strong>🔧 Skills:</strong>
                            <div style={{ marginTop: '0.5rem' }}>
                                {p.requiredSkills.map((skill, index) => (
                                    <span key={index} className="skills-tag">{skill}</span>
                                ))}
                            </div>
                        </div>
                        <div className="project-info">
                            <strong>📅 Deadline:</strong> {p.deadline ? new Date(p.deadline).toLocaleDateString() : "No deadline set"}
                        </div>
                        <div className="project-info">
                            <strong>👥 Team:</strong>
                            <div style={{ marginTop: '0.5rem' }}>
                                {p.assignedEmployees.length > 0 ? (
                                    p.assignedEmployees.map((employee, index) => (
                                        <span key={index} className="employee-tag">{employee.name}</span>
                                    ))
                                ) : (
                                    <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No team members assigned</span>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

}

export default ProjectManagement;