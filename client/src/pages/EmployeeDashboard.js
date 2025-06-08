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
      if (selectedDifficulty && selectedDifficulty !== 'All' && selectedDifficulty !== 'All Levels') {
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
      const token = localStorage.getItem('token');
      const res = await axios.get("/api/users/me/projects", { headers: { Authorization: `Bearer ${token}` } });
      setMyProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch my projects", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (user && token) {
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
    await fetchMyEnrolledCourses();
    // Consider if fetchAllCourses is needed here or if UI updates optimistically
    // await fetchAllCourses(); 
  };

  const handleCourseCompleted = async (completedCourseId) => {
    await fetchMyEnrolledCourses();
    await fetchMyCompletedCourses();
    // Consider if fetchAllCourses is needed here
    // await fetchAllCourses();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="employee-dashboard">
      <nav className="dashboard-nav">
        <Link to="/profile">My Profile</Link>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </nav>
      <h1>Employee Dashboard</h1>
      <p className="welcome-message">Welcome, {user?.name}!</p>

      <section className="dashboard-section-card">
        <h2>My Enrolled Courses</h2>
        {loadingMyCourses ? <p className="loading-message">Loading your courses...</p> :
          myEnrolledCourses.length > 0 ?
            <CourseList
              courses={myEnrolledCourses}
              showEnrollButton={false}
              showCompleteButton={true}
              onCompleted={handleCourseCompleted}
              completedCourseIds={myCompletedCourseIds}
              enrolledCourseIds={myEnrolledCourseIds} // Corrected from myEnrolledCourses.map(c => c._id)
            /> :
            <p className="empty-state-message">You are not enrolled in any courses yet.</p>
        }
      </section>

      <section className="dashboard-section-card">
        <h2>My Completed Courses</h2>
        {loadingMyCompleted ? <p className="loading-message">Loading completed courses...</p> :
          myCompletedCourses.length > 0 ?
            <CourseList
              courses={myCompletedCourses}
              showEnrollButton={false}
              showCompleteButton={false}
              completedCourseIds={myCompletedCourseIds}
              enrolledCourseIds={myEnrolledCourseIds} // Added for consistency if CourseList uses it
            /> :
            <p className="empty-state-message">You have not completed any courses yet.</p>
        }
      </section>

      <section className="dashboard-section-card">
        <h2>Available Courses to Enroll</h2>
        <div className="course-filters">
          <h4>Filter Courses</h4>
          <div>
            <label>By Skills: </label>
            <div className="filter-buttons-group">
              {predefinedSkills.map(skill => (
                <button
                  key={`filter-skill-${skill}`}
                  onClick={() => handleFilterSkillChange(skill)}
                  className={`filter-button ${selectedFilterSkills.includes(skill) ? 'active' : ''}`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="filterDifficulty">By Difficulty: </label>
              <select
                id="filterDifficulty"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="filter-select"
              >
                {difficultyLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="filterSearch">Search Title/Description: </label>
              <input
                type="text"
                id="filterSearch"
                placeholder="Enter keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
              />
            </div>
          </div>
          <button onClick={clearFilters} className="clear-filters-button">Clear Filters</button>
        </div>

        {loadingAllCourses ? <p className="loading-message">Loading courses...</p> :
          <CourseList
            courses={allCourses}
            showEnrollButton={true}
            onEnrolled={handleCourseEnrolled}
            enrolledCourseIds={myEnrolledCourseIds}
            showCompleteButton={false} // Typically false for available courses
            completedCourseIds={myCompletedCourseIds}
          />
        }
      </section>

      <section className="dashboard-section-card">
        <h2>My Assigned Projects</h2>
        {loadingProjects ? <p className="loading-message">Loading projects...</p> :
          myProjects.length === 0 ? <p className="empty-state-message">No projects assigned yet.</p> :
            <ul className="project-list">
              {myProjects.map(p => (
                <li key={p._id} className="project-item">
                  <h3>{p.title || p.name}</h3> {/* Handle potential 'name' field from older data */}
                  <p className="project-description">{p.description}</p>
                  <div className="project-details">
                    {p.requiredSkills && p.requiredSkills.length > 0 &&
                      <span className="project-skill"><strong>Skills:</strong> {p.requiredSkills.join(", ")}</span>
                    }
                    <span className="project-deadline"><strong>Deadline:</strong> {p.deadline ? new Date(p.deadline).toLocaleDateString() : (p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "N/A")}</span>
                    {p.status && <span className="project-status"><strong>Status:</strong> {p.status}</span>}
                  </div>
                </li>
              ))}
            </ul>
        }
      </section>
    </div>
  );
}

export default EmployeeDashboard;
