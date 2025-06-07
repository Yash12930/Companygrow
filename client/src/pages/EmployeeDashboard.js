// client/src/pages/EmployeeDashboard.js
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import CourseList from '../components/CourseList';
import './EmployeeDashboard.css';

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
  const [myCompletedCourses, setMyCompletedCourses] = useState([]);
  const [myCompletedCourseIds, setMyCompletedCourseIds] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loadingAllCourses, setLoadingAllCourses] = useState(true);
  const [loadingMyCourses, setLoadingMyCourses] = useState(true);
  const [loadingMyCompleted, setLoadingMyCompleted] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedFilterSkills, setSelectedFilterSkills] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllCourses = useCallback(async () => {
    setLoadingAllCourses(true);
    try {
      const params = {};
      if (selectedFilterSkills.length > 0) params.skills = selectedFilterSkills.join(',');
      if (selectedDifficulty && selectedDifficulty !== 'All' && selectedDifficulty !== 'All Levels') { // Ensure 'All' or 'All Levels' doesn't filter
        params.difficulty = selectedDifficulty;
      }
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
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users/me/enrolled-courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyEnrolledCourses(response.data);
      // Fix: Server returns course objects directly, not enrollment.course
      setMyEnrolledCourseIds(response.data.map(course => course._id));
    } catch (error) {
      console.error("Failed to fetch my enrolled courses", error);
    } finally {
      setLoadingMyCourses(false);
    }
  };

  const fetchMyCompletedCourses = async () => {
    setLoadingMyCompleted(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users/me/completed-courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyCompletedCourses(response.data);
      // Fix: Server returns course objects directly, not enrollment.course
      setMyCompletedCourseIds(response.data.map(course => course._id));
    } catch (error) {
      console.error("Failed to fetch my completed courses", error);
    } finally {
      setLoadingMyCompleted(false);
    }
  };

  const fetchMyProjects = async () => {
    setLoadingProjects(true); // Make sure to set loading true at the start
    try {
      const res = await axios.get("/api/users/me/projects", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setMyProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch my projects", err); // Added error logging
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyEnrolledCourses();
      fetchMyCompletedCourses();
      fetchMyProjects();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAllCourses();
    }
  }, [user, fetchAllCourses]);

  const handleFilterSkillChange = (skill) => {
    setSelectedFilterSkills(prevSkills =>
      prevSkills.includes(skill) ? prevSkills.filter(s => s !== skill) : [...prevSkills, skill]
    );
  };

  const clearFilters = () => {
    setSelectedFilterSkills([]);
    setSelectedDifficulty('All');
    setSearchTerm('');
  };

  const handleCourseEnrolled = async (enrolledCourseId) => {
    setMyEnrolledCourseIds(prev => [...prev, enrolledCourseId]);
    try {
      await fetchMyEnrolledCourses();
      await fetchMyCompletedCourses();
    } catch (error) {
      console.error('Error refreshing data after enrollment:', error);
    }
  };

  const handleCourseCompleted = (completedCourseId) => {
    fetchMyEnrolledCourses();
    fetchMyCompletedCourses();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="employee-dashboard">
      <nav style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/profile">My Profile</Link>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </nav>

      <h1>Employee Dashboard</h1>
      <p>Welcome, {user?.name}!</p>

      {/* ====================================================================== */}
      {/* == START: ADD THIS FILTER SECTION JSX BLOCK == */}
      {/* ====================================================================== */}
      <div className="filters-section" style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
        <h3>Filter Courses</h3>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="search-courses" style={{ marginRight: '5px' }}>Search:</label>
          <input
            type="text"
            id="search-courses"
            placeholder="Search by title/description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px', width: 'calc(100% - 100px)', marginRight: '10px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Skills/Tags:</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {predefinedSkills.map(skill => (
              <label key={skill} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  value={skill}
                  checked={selectedFilterSkills.includes(skill)}
                  onChange={() => handleFilterSkillChange(skill)}
                  style={{ marginRight: '4px' }}
                />
                {skill}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="difficulty-filter" style={{ marginRight: '5px' }}>Difficulty:</label>
          <select
            id="difficulty-filter"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            style={{ padding: '8px', minWidth: '150px' }}
          >
            {difficultyLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
        <button onClick={clearFilters} style={{ padding: '8px 12px' }}>Clear Filters</button>
      </div>
      {/* ====================================================================== */}
      {/* == END: ADD THIS FILTER SECTION JSX BLOCK == */}
      {/* ====================================================================== */}
            
      <hr style={{ margin: "20px 0" }} />
      <section>
        <h2>My Enrolled Courses</h2>
        {loadingMyCourses ? <p className="loading-message">Loading your courses...</p> :
          myEnrolledCourses.length > 0 ?
            <CourseList
              courses={myEnrolledCourses} // Remove .map(enrollment => enrollment.course)
              showEnrollButton={false}
              showCompleteButton={true}
              onCompleted={handleCourseCompleted}
              completedCourseIds={myCompletedCourseIds}
              enrolledCourseIds={myEnrolledCourseIds}
            /> :
            <p>You are not enrolled in any courses yet.</p>
        }
      </section>
      <hr style={{ margin: "20px 0" }} />
      <section>
        <h2>Available Courses to Enroll</h2>
        {loadingAllCourses ? <p className="loading-message">Loading courses...</p> :
          allCourses.length > 0 ?
            <CourseList
              courses={allCourses}
              showEnrollButton={true}
              onEnrolled={handleCourseEnrolled}
              onCompleted={handleCourseCompleted}
              enrolledCourseIds={myEnrolledCourseIds} // Pass the IDs directly
              completedCourseIds={myCompletedCourseIds}
            /> :
            <p>No courses match your current filters or no courses available.</p>
        }
      </section>
      <hr style={{ margin: "20px 0" }} />
      <section>
        <h2>My Completed Courses</h2>
        {loadingMyCompleted ? <p className="loading-message">Loading completed courses...</p> :
          myCompletedCourses.length > 0 ?
            <CourseList
              courses={myCompletedCourses} // Remove .map(enrollment => enrollment.course)
              showEnrollButton={false}
              showCompleteButton={false}
              completedCourseIds={myCompletedCourseIds}
            /> :
            <p>You have not completed any courses yet.</p>
        }
      </section>
      <hr style={{ margin: "20px 0" }} />
      <section>
        <h2>My Projects</h2>
        {loadingProjects ? <p className="loading-message">Loading projects...</p> :
          myProjects.length === 0 ?
            <p>No projects assigned yet.</p> :
            (
              <ul>
                {myProjects.map((project) => (
                  <li key={project._id}>{project.name} - {project.status}</li>
                ))}
              </ul>
            )
        }
      </section>
    </div>
  );
}

export default EmployeeDashboard;
