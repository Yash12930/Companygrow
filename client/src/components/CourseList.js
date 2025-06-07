import React, { useState } from 'react';
import axios from 'axios';
import './CourseList.css';

function CourseList({ 
  courses, 
  showEnrollButton, 
  onEnrolled, 
  enrolledCourseIds = [],
  showCompleteButton,
  onCompleted,
  completedCourseIds = [],
  onEdit, // function to call with updated course object
  onDelete
}) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: '',
    tags: '',
  });

  if (!courses || courses.length === 0) {
    return <p>No courses available yet.</p>;
  }

  const startEdit = (course) => {
    setEditingId(course._id);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      difficulty: course.difficulty || '',
      tags: course.tags ? course.tags.join(', ') : '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', difficulty: '', tags: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Title is required.');
      return;
    }
    // Prepare updated course object
    const updatedCourse = {
      _id: editingId,
      title: formData.title.trim(),
      description: formData.description.trim(),
      difficulty: formData.difficulty.trim(),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
    };
    onEdit && onEdit(updatedCourse);
    cancelEdit();
  };

  const handleEnroll = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to enroll in courses');
        return;
      }
      
      const response = await axios.post(`/api/courses/${courseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(response.data.msg || 'Successfully enrolled!');
      if (onEnrolled) onEnrolled(courseId);
    } catch (error) {
      alert(error.response?.data?.msg || 'Failed to enroll.');
      console.error("Enrollment error:", error.response?.data);
    }
  };

  const handleComplete = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/courses/${courseId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(response.data.msg || 'Course marked as complete!');
      if (onCompleted) onCompleted(courseId);
    } catch (error) {
      alert(error.response?.data?.msg || 'Failed to mark as complete.');
      console.error("Completion error:", error.response?.data);
    }
  };

  return (
    <div>
      {courses.map(course => {
         if (!course || !course._id) return null;
        const isEnrolled = enrolledCourseIds.includes(course._id);
        const isCompleted = completedCourseIds.includes(course._id);

        return (
          <div
            key={course._id}
            style={{ border: '1px solid #ccc', margin: '10px', padding: '10px', borderRadius: '5px' }}
          >
            {editingId === course._id ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Course Title"
                  required
                  style={{ padding: '6px', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description"
                  rows={3}
                  style={{ padding: '6px', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  placeholder="Difficulty (e.g., beginner, intermediate)"
                  style={{ padding: '6px', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="Tags (comma separated)"
                  style={{ padding: '6px', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <div>
                  <button
                    type="submit"
                    style={{ padding: '6px 12px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    style={{ marginLeft: '8px', padding: '6px 12px', backgroundColor: '#777', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h3>{course.title}</h3>
                <p>{course.description}</p>

                {course.tags?.length > 0 && (
                  <div><strong>Skills/Tags:</strong> {course.tags.join(', ')}</div>
                )}

                {course.difficulty && (
                  <div><strong>Difficulty:</strong> {course.difficulty}</div>
                )}

                {/* User features */}
                {showEnrollButton && !isCompleted && (
                  isEnrolled ? (
                    <p style={{ color: 'green' }}><em>Enrolled</em></p>
                  ) : (
                    <button onClick={() => handleEnroll(course._id)}>Enroll</button>
                  )
                )}

                {showCompleteButton && isEnrolled && !isCompleted && (
                  <button
                    onClick={() => handleComplete(course._id)}
                    style={{ marginLeft: '10px', backgroundColor: '#a0e8a0' }}
                  >
                    Mark as Complete
                  </button>
                )}

                {isCompleted && (
                  <p style={{ color: 'blue' }}><em>Course Completed! 🎉</em></p>
                )}

                {/* Admin features */}
                {(onEdit || onDelete) && (
                  <div style={{ marginTop: '10px' }}>
                    {onEdit && (
                      <button
                        onClick={() => startEdit(course)}
                        style={{ marginRight: '10px', backgroundColor: '#ffdd57' }}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(course._id)}
                        style={{ backgroundColor: '#f76c6c', color: 'white' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default CourseList;
