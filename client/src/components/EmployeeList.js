import React, { useState } from 'react';
import './EmployeeList.css'; // same CSS file as before, add some styles for form

function EmployeeList({ employees, onEdit, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
  });

  // Start editing: fill form with employee data
  const startEdit = (employee) => {
    setEditingId(employee._id);
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      role: employee.role || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', role: '' });
  };

  // Update form state on input change
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    onEdit({
      _id: editingId,
      ...formData,
    });
    cancelEdit();
  };

  return (
    <div className="employee-grid">
      {employees.map(employee => (
        <div key={employee._id} className="employee-card">
          {editingId === employee._id ? (
            <form className="edit-form" onSubmit={handleSubmit}>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                required
                className="edit-input"
              />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="edit-input"
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="edit-select"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
              <div className="button-group">
                <button type="submit" className="btn btn-edit">Save</button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn btn-cancel"
                  style={{ marginLeft: '8px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h4 className="employee-name">{employee.name}</h4>
              <p><strong>Email:</strong> {employee.email}</p>
              <p><strong>Role:</strong> {employee.role}</p>
              <div className="button-group">
                <button className="btn btn-edit" onClick={() => startEdit(employee)}>Edit</button>
                <button className="btn btn-delete" onClick={() => onDelete(employee._id)}>Delete</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default EmployeeList;
