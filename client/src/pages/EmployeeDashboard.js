import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import CourseList from '../components/CourseList'; // Ensure this path is correct
import './EmployeeDashboard.css'; // Ensure this CSS file is correctly linked

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

  // Memoized function to fetch all courses with filters
  const fetchAllCourses = useCallback(async () => {
    setLoadingAllCourses(true);
    try {
      const params = {};
      if (selectedFilterSkills.length > 0) params.skills = selectedFilterSkills.join(',');
      if (selectedDifficulty && selectedDifficulty !== 'All' && selectedDifficulty !== 'All Levels') {
        params.difficulty = selectedDifficulty;
      }
      if (searchTerm) params.search = searchTerm;

      const response = await axios.get('/api/courses', { params });
      setAllCourses(response.data);
    } catch (error) {
      console.error("Failed to fetch all courses", error);
      // Optionally show an error message on the UI
    } finally {
      setLoadingAllCourses(false);
    }
  }, [selectedFilterSkills, selectedDifficulty, searchTerm]); // Dependencies for useCallback

  const fetchMyEnrolledCourses = async () => {
    setLoadingMyCourses(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users/me/enrolled-courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyEnrolledCourses(response.data);
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
      setMyCompletedCourseIds(response.data.map(course => course._id));
    } catch (error) {
      console.error("Failed to fetch my completed courses", error);
    } finally {
      setLoadingMyCompleted(false);
    }
  };

  const fetchMyProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await axios.get("/api/users/me/projects", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setMyProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch my projects", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Fetch user-specific data on user change
  useEffect(() => {
    if (user) {
      fetchMyEnrolledCourses();
      fetchMyCompletedCourses();
      fetchMyProjects();
    }
  }, [user]);

  // Fetch all courses whenever filters or search term change
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
    await fetchMyEnrolledCourses();
    await fetchAllCourses();
  };

  const handleCourseCompleted = async (completedCourseId) => {
    await fetchMyEnrolledCourses();
    await fetchMyCompletedCourses();
    await fetchAllCourses();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="employee-dashboard">
      <nav>
        <Link to="/profile">My Profile</Link>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </nav>

      <h1>Employee Dashboard</h1>
      <p>Welcome, {user?.name}!</p>

      {/* Filters Section */}
      <div className="filters-section">
        <h3>Filter Courses</h3>
        <div>
          <label htmlFor="search-courses">Search:</label>
          <input
            type="text"
            id="search-courses"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Skills/Tags as Boxes - Applied 'skills-grid' class here */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Skills/Tags:</label>
          <div className="skills-grid"> {/* This is the key change: apply class here */}
            {predefinedSkills.map(skill => (
              <label key={skill}>
                <input
                  type="checkbox"
                  value={skill}
                  checked={selectedFilterSkills.includes(skill)}
                  onChange={() => handleFilterSkillChange(skill)}
                />
                <span>{skill}</span> {/* Wrap text in a span for easier styling */}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="difficulty-filter">Difficulty:</label>
          <select
            id="difficulty-filter"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            {difficultyLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
        <button onClick={clearFilters}>Clear Filters</button>
      </div>

      <hr />

      <section>
        <h2>My Enrolled Courses</h2>
        {loadingMyCourses ? <p className="loading-message">Loading your courses...</p> :
          myEnrolledCourses.length > 0 ?
            <CourseList
              courses={myEnrolledCourses}
              showEnrollButton={false}
              showCompleteButton={true}
              onCompleted={handleCourseCompleted}
              completedCourseIds={myCompletedCourseIds}
              enrolledCourseIds={myEnrolledCourseIds}
            /> :
            <p className="no-results-message">You are not enrolled in any courses yet.</p>
        }
      </section>

      <hr />

      <section>
        <h2>Available Courses to Enroll</h2>
        {loadingAllCourses ? <p className="loading-message">Loading courses...</p> :
          allCourses.length > 0 ?
            <CourseList
              courses={allCourses}
              showEnrollButton={true}
              onEnrolled={handleCourseEnrolled}
              onCompleted={handleCourseCompleted}
              enrolledCourseIds={myEnrolledCourseIds}
              completedCourseIds={myCompletedCourseIds}
            /> :
            <p className="no-results-message">No courses match your current filters or no courses available.</p>
        }
      </section>

      <hr />

      <section>
        <h2>My Completed Courses</h2>
        {loadingMyCompleted ? <p className="loading-message">Loading completed courses...</p> :
          myCompletedCourses.length > 0 ?
            <CourseList
              courses={myCompletedCourses}
              showEnrollButton={false}
              showCompleteButton={false}
              completedCourseIds={myCompletedCourseIds}
              enrolledCourseIds={myEnrolledCourseIds}
            /> :
            <p className="no-results-message">You have not completed any courses yet.</p>
        }
      </section>

      <hr />

      <section>
        <h2>My Projects</h2>
        {loadingProjects ? <p className="loading-message">Loading projects...</p> :
          myProjects.length === 0 ?
            <p className="no-results-message">No projects assigned yet.</p> :
            (
              <ul>
                {myProjects.map((project) => (
                  <li key={project._id}>
                    <strong>{project.name}</strong> - Status: {project.status}
                    {project.description && <p>Description: {project.description}</p>}
                    {project.dueDate && <p>Due Date: {new Date(project.dueDate).toLocaleDateString()}</p>}
                  </li>
                ))}
              </ul>
            )
        }
      </section>
    </div>
  );
}

export default EmployeeDashboard;
