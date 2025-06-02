// client/src/components/CourseList.js
import React from 'react';
import axios from 'axios';

function CourseList({ 
    courses, 
    showEnrollButton, 
    onEnrolled, 
    enrolledCourseIds = [],
    showCompleteButton, // New prop
    onCompleted,        // New prop
    completedCourseIds = [] // New prop
}) {
    if (!courses || courses.length === 0) {
        return <p>No courses available yet.</p>;
    }

    const handleEnroll = async (courseId) => {
        // ... (existing handleEnroll logic)
        try {
            const response = await axios.post(`/api/courses/${courseId}/enroll`);
            alert(response.data.msg || 'Successfully enrolled!');
            if (onEnrolled) {
                onEnrolled(courseId);
            }
        } catch (error) {
            alert(error.response?.data?.msg || 'Failed to enroll.');
            console.error("Enrollment error:", error.response?.data);
        }
    };

    const handleComplete = async (courseId) => {
        try {
            const response = await axios.post(`/api/courses/${courseId}/complete`);
            alert(response.data.msg || 'Course marked as complete!');
            if (onCompleted) {
                onCompleted(courseId);
            }
        } catch (error) {
            alert(error.response?.data?.msg || 'Failed to mark as complete.');
            console.error("Completion error:", error.response?.data);
        }
    };

    return (
        <div>
            {courses.map(course => {
                const isEnrolled = enrolledCourseIds.includes(course._id);
                const isCompleted = completedCourseIds.includes(course._id); // Check if completed

                return (
                    <div key={course._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px', borderRadius: '5px' }}>
                        <h3>{course.title}</h3>
                        <p>{course.description}</p>
                        {course.tags && course.tags.length > 0 && (
                            <div style={{ marginBottom: '5px' }}><strong>Skills/Tags: </strong> {course.tags.join(', ')}</div>
                        )}
                        {course.difficulty && (
                            <div style={{ marginBottom: '10px' }}><strong>Difficulty: </strong>{course.difficulty}</div>
                        )}
                        
                        {/* Enrollment Button Logic */}
                        {showEnrollButton && !isCompleted && ( // Don't show enroll if completed
                            isEnrolled ? (
                                <p style={{ color: 'green', fontWeight: 'bold' }}><em>Enrolled</em></p>
                            ) : (
                                <button onClick={() => handleEnroll(course._id)}>Enroll</button>
                            )
                        )}

                        {/* Completion Button Logic */}
                        {showCompleteButton && isEnrolled && !isCompleted && ( // Show only if enrolled and not completed
                            <button onClick={() => handleComplete(course._id)} style={{ marginLeft: '10px', backgroundColor: '#a0e8a0' }}>
                                Mark as Complete
                            </button>
                        )}

                        {isCompleted && ( // Show if completed
                            <p style={{ color: 'blue', fontWeight: 'bold' }}><em>Course Completed! 🎉</em></p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default CourseList;
