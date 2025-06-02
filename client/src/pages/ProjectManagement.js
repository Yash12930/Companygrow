import React, { useEffect, useState } from "react";
import axios from "axios";

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
        <div>
            <h1>Project Management</h1>
            <form onSubmit={handleCreateProject} style={{ marginBottom: 20 }}>
                <input
                    name="title"
                    placeholder="Title"
                    value={form.title}
                    onChange={handleInputChange}
                    required
                />
                <input
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleInputChange}
                    required
                />
                <input
                    name="requiredSkills"
                    placeholder="Required Skills (comma separated)"
                    value={form.requiredSkills}
                    onChange={handleInputChange}
                />
                <input
                    name="deadline"
                    type="date"
                    value={form.deadline}
                    onChange={handleInputChange}
                />
                <select multiple value={selectedEmployees} onChange={handleEmployeeSelect}>
                    {users.map(u => (
                        <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                </select>
                <button type="submit">Create Project</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <h2>All Projects</h2>
            {loading ? <p>Loading...</p> : (
                <ul>
                    {projects.map(p => (
                        <li key={p._id}>
                            <b>{p.title}</b> - {p.description} <br />
                            Skills: {p.requiredSkills.join(", ")} <br />
                            Deadline: {p.deadline ? new Date(p.deadline).toLocaleDateString() : "N/A"} <br />
                            Assigned: {p.assignedEmployees.map(e => e.name).join(", ")}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ProjectManagement;