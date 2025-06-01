// client/src/components/CourseList.js
import React from 'react';
import axios from 'axios'; // Needed for enrollment action

function CourseList({ courses, showEnrollButton, onEnrolled, enrolledCourseIds = [] }) {
    if (!courses || courses.length === 0) {
        return <p>No courses available yet.</p>;
    }

    const handleEnroll = async (courseId) => {
        try {
            // The auth token should be set globally in axios headers by AuthContext
            const response = await axios.post(`/api/courses/${courseId}/enroll`);
            alert(response.data.msg || 'Successfully enrolled!');
            if (onEnrolled) {
                onEnrolled(courseId); // Notify parent component
            }
        } catch (error) {
            alert(error.response?.data?.msg || 'Failed to enroll. You might already be enrolled or an error occurred.');
            console.error("Enrollment error:", error.response?.data);
        }
    };

    return (
        <div>
            {/* This H2 might be redundant if parent component already has a title */}
            {/* <h2>Available Courses</h2> */}
            {courses.map(course => {
                const isEnrolled = enrolledCourseIds.includes(course._id);
                return (
                    <div key={course._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                        <h3>{course.title}</h3>
                        <p>{course.description}</p>
                        {showEnrollButton && (
                            isEnrolled ? (
                                <p><em>Enrolled</em></p>
                            ) : (
                                <button onClick={() => handleEnroll(course._id)}>Enroll</button>
                            )
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default CourseList;
