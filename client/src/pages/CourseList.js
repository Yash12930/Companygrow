// src/components/CourseList.js
import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// A simple CourseCard component to render each course.
// You might already have a more complex one, but this is a basic structure.
function CourseCard({
  course,
  showEnrollButton,
  showCompleteButton,
  onEnrolled,
  onCompleted,
  enrolledCourseIds,
  completedCourseIds
}) {
  const navigate = useNavigate();
  const isEnrolled = enrolledCourseIds.includes(course._id);
  const isCompleted = completedCourseIds.includes(course._id);

  const handleEnroll = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/courses/${course._id}/enroll`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Enrolled in course successfully!');
      if (onEnrolled) onEnrolled(course._id);
    } catch (error) {
      console.error('Failed to enroll in course', error);
      alert('Failed to enroll in course: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/courses/${course._id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Course marked as complete!');
      if (onCompleted) onCompleted(course._id);
    } catch (error) {
      console.error('Failed to mark course as complete', error);
      alert('Failed to mark course as complete: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  return (
    <div className="course-card">
      <h4>{course.title}</h4>
      <p>{course.description}</p>
      <p><strong>Difficulty:</strong> {course.difficulty}</p>
      <div className="tags">
        {course.skills && course.skills.map(skill => (
          <span key={skill} className="tag">{skill}</span>
        ))}
      </div>
      {isCompleted && <p className="completed-status">Completed!</p>}
      <div className="course-actions">
        {showEnrollButton && !isEnrolled && !isCompleted && (
          <button onClick={handleEnroll} className="enroll-button">Enroll</button>
        )}
        {showCompleteButton && isEnrolled && !isCompleted && (
          <button onClick={handleComplete} className="complete-button">Mark Complete</button>
        )}
        <button onClick={() => navigate(`/courses/${course._id}`)} className="view-button">View Details</button>
      </div>
    </div>
  );
}

function CourseList({
  courses,
  showEnrollButton,
  showCompleteButton,
  onEnrolled,
  onCompleted,
  enrolledCourseIds,
  completedCourseIds
}) {
  if (!courses || courses.length === 0) {
    return null; // Or return a message like "No courses found" if parent doesn't handle it
  }

  return (
    <div className="course-list-container">
      {courses.map(course => (
        <CourseCard
          key={course._id}
          course={course}
          showEnrollButton={showEnrollButton}
          showCompleteButton={showCompleteButton}
          onEnrolled={onEnrolled}
          onCompleted={onCompleted}
          enrolledCourseIds={enrolledCourseIds}
          completedCourseIds={completedCourseIds}
        />
      ))}
    </div>
  );
}

export default CourseList;