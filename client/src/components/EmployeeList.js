// client/src/components/EmployeeList.js
import React from 'react';

function EmployeeList({ employees }) {
    if (!employees || employees.length === 0) {
        return <p>No employees found.</p>;
    }

    return (
        <div>
            <h2>Employee List</h2>
            <ul>
                {employees.map(employee => (
                    <li key={employee._id}>
                        <strong>{employee.name}</strong>
                        {employee.skills && employee.skills.length > 0 && (
                            <span> - Skills: {employee.skills.join(', ')}</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default EmployeeList;
