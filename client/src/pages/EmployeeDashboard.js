// client/src/pages/EmployeeDashboard.js
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseList from '../components/CourseList';
import { Link } from 'react-router-dom';

const predefinedSkills = [
    "JavaScript", "Python", "Java", "SQL", "HTML", "CSS", "React.js", "Node.js",
    "Data Analysis", "Project Management", "Communication", "Leadership",
    "Problem Solving", "Cloud Computing", "Cybersecurity", "DevOps",
    "Agile Methodologies", "UI/UX Design", "Marketing", "Sales"
];
const difficultyLevels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'];

function EmployeeDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [allCourses, setAllCourses] = useState([]);
    const [myEnrolledCourses, setMyEnrolledCourses] = useState([]);
    const [myEnrolledCourseIds, setMyEnrolledCourseIds] = useState([]);
    const [myCompletedCourses, setMyCompletedCourses] = useState([]); // State for completed courses
    const [myCompletedCourseIds, setMyCompletedCourseIds] = useState([]); // State for completed course IDs
    const [myProjects, setMyProjects] = useState([]);

    const [loadingAllCourses, setLoadingAllCourses] = useState(true);
    const [loadingMyCourses, setLoadingMyCourses] = useState(true);
    const [loadingMyCompleted, setLoadingMyCompleted] = useState(true); // Loading state for completed
    const [loadingProjects, setLoadingProjects] = useState(true);

    // Filters State
    const [selectedFilterSkills, setSelectedFilterSkills] = useState([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAllCourses = useCallback(async () => {
        setLoadingAllCourses(true);
        try {
            const params = {};
            if (selectedFilterSkills.length > 0) params.skills = selectedFilterSkills.join(',');
            if (selectedDifficulty && selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
            if (searchTerm) params.search = searchTerm;
            const response = await axios.get('/api/courses', { params });
            setAllCourses(response.data);
        } catch (error) {
            console.error("Failed to fetch all courses", error);
        } finally {
            setLoadingAllCourses(false);
        }
    }, [selectedFilterSkills, selectedDifficulty, searchTerm]);

    const fetchMyEnrolledCourses = async () => {
        setLoadingMyCourses(true);
        try {
            const response = await axios.get('/api/users/me/enrolled-courses'); 
            setMyEnrolledCourses(response.data);
            setMyEnrolledCourseIds(response.data.map(course => course._id));
        } catch (error) {
            console.error("Failed to fetch my enrolled courses", error);
        } finally {
            setLoadingMyCourses(false);
        }
    };

    const fetchMyCompletedCourses = async () => { // New function
        setLoadingMyCompleted(true);
        try {
            const response = await axios.get('/api/users/me/completed-courses');
            setMyCompletedCourses(response.data);
            setMyCompletedCourseIds(response.data.map(course => course._id));
        } catch (error) {
            console.error("Failed to fetch my completed courses", error);
        } finally {
            setLoadingMyCompleted(false);
        }
    };

    const fetchMyProjects = async () => {
        try {
            const res = await axios.get("/api/users/me/projects", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
            setMyProjects(res.data);
        } catch (err) {
            // handle error
        } finally {
            setLoadingProjects(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMyEnrolledCourses();
            fetchMyCompletedCourses(); // Fetch completed courses on load
            fetchMyProjects();
        }
    }, [user]);

    useEffect(() => {
        if (user) { 
            fetchAllCourses();
        }
    }, [user, fetchAllCourses]);

    const handleFilterSkillChange = (skill) => { /* ... no change ... */ 
        setSelectedFilterSkills(prevSkills =>
            prevSkills.includes(skill)
                ? prevSkills.filter(s => s !== skill)
                : [...prevSkills, skill]
        );
    };
    
    const clearFilters = () => { /* ... no change ... */
        setSelectedFilterSkills([]);
        setSelectedDifficulty('All');
        setSearchTerm('');
    };


    const handleCourseEnrolled = (enrolledCourseId) => {
        fetchMyEnrolledCourses(); // Re-fetch to update "Enrolled" status across lists if needed
        fetchMyCompletedCourses(); // Also ensure completion status is fresh
    };

    const handleCourseCompleted = (completedCourseId) => {
        fetchMyEnrolledCourses(); // To update the button state in "My Enrolled Courses" if displayed there
        fetchMyCompletedCourses(); // To update the list of completed courses and button states
    };

    const handleLogout = () => { /* ... no change ... */
        logout();
        navigate('/login');
    };
    
    return (
        <div>
            <nav>
                <Link to="/profile">My Profile</Link>
            </nav>
            <h1>Employee Dashboard</h1>
            <p>Welcome, {user?.name}!</p>
            <button onClick={handleLogout}>Logout</button>
            
            <hr style={{margin: "20px 0"}}/>

            <section>
                <h2>My Enrolled Courses</h2>
                {loadingMyCourses ? <p>Loading your courses...</p> : 
                    myEnrolledCourses.length > 0 ? 
                    <CourseList 
                        courses={myEnrolledCourses} 
                        showEnrollButton={false} // Don't show enroll for "My Courses" list
                        showCompleteButton={true}  // DO show complete button here
                        onCompleted={handleCourseCompleted}
                        completedCourseIds={myCompletedCourseIds}
                        // enrolledCourseIds are implicitly all courses in this list
                        enrolledCourseIds={myEnrolledCourses.map(c => c._id)} 
                    /> : 
                    <p>You are not enrolled in any courses yet.</p>
                }
            </section>

            <hr style={{margin: "20px 0"}}/>

            <section>
                <h2>My Completed Courses</h2>
                {loadingMyCompleted ? <p>Loading completed courses...</p> :
                    myCompletedCourses.length > 0 ?
                    <CourseList 
                        courses={myCompletedCourses}
                        showEnrollButton={false}
                        showCompleteButton={false} // No buttons needed for already completed
                        completedCourseIds={myCompletedCourseIds} // To show "Completed!" status
                    /> :
                    <p>You have not completed any courses yet.</p>
                }
            </section>

            <hr style={{margin: "20px 0"}}/>

            <section>
                <h2>Available Courses to Enroll</h2>
                {/* Filter UI ... no change to its JSX structure */}
                <div style={{ border: '1px solid #eee', padding: '15px', margin: '15px 0' }}>
                    <h4>Filter Courses</h4>
                    <div>
                        <label>By Skills: </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                            {predefinedSkills.map(skill => (
                                <button 
                                    key={`filter-skill-${skill}`}
                                    onClick={() => handleFilterSkillChange(skill)}
                                    style={{ 
                                        padding: '5px 8px', 
                                        cursor: 'pointer',
                                        backgroundColor: selectedFilterSkills.includes(skill) ? 'lightblue' : 'white',
                                        border: '1px solid #ccc'
                                    }}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="filterDifficulty">By Difficulty: </label>
                        <select 
                            id="filterDifficulty" 
                            value={selectedDifficulty} 
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            style={{ marginBottom: '10px', padding: '5px' }}
                        >
                            {difficultyLevels.map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="filterSearch">Search Title/Description: </label>
                        <input 
                            type="text" 
                            id="filterSearch"
                            placeholder="Enter keywords..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ marginBottom: '10px', padding: '5px', width: '200px' }}
                        />
                    </div>
                    <button onClick={clearFilters} style={{ padding: '5px 10px'}}>Clear Filters</button>
                </div>

                {loadingAllCourses ? <p>Loading courses...</p> : 
                    <CourseList 
                        courses={allCourses} 
                        showEnrollButton={true} 
                        onEnrolled={handleCourseEnrolled}
                        enrolledCourseIds={myEnrolledCourseIds}
                        showCompleteButton={false} // Don't show complete for general browse list
                        completedCourseIds={myCompletedCourseIds} // To correctly show "Enrolled" vs "Completed"
                    />
                }
            </section>

            <hr style={{margin: "20px 0"}}/>
            <section>
                <h2>My Assigned Projects</h2>
                {loadingProjects ? <p>Loading projects...</p> :
                    myProjects.length === 0 ? <p>No projects assigned yet.</p> :
                    <ul>
                        {myProjects.map(p => (
                            <li key={p._id}>
                                <b>{p.title}</b> - {p.description} <br />
                                Skills: {p.requiredSkills.join(", ")} <br />
                                Deadline: {p.deadline ? new Date(p.deadline).toLocaleDateString() : "N/A"}
                            </li>
                        ))}
                    </ul>
                }
            </section>
        </div>
    );
}

export default EmployeeDashboard;
