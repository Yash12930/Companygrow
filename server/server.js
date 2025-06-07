// server/server.js
const express = require('express');
const mongoose = require('mongoose'); // Using Mongoose for MongoDB
const app = express();
const port = process.env.PORT || 5001; // Use port 5001 for backend
const bcrypt = require('bcryptjs'); // Add this
const jwt = require('jsonwebtoken'); // Add this
const authMiddleware = require('./middleware/authMiddleware'); // Import the middleware

// Middleware to parse JSON bodies
app.use(express.json());

const JWT_SECRET = 'abc'; 
const mongoURI = 'mongodb+srv://arishit:abc@companygroww.4trxhfw.mongodb.net/'; // Change if needed


mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));


// Schemas
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    skills: [{ type: String, default: 'All Levels'}],
    role: {
        type: String,
        enum: ['employee', 'manager', 'admin'],
        default: 'employee'
    },
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    completedCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    tokens: {type : Number,default:0}
});
const User = mongoose.model('User', userSchema);

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    skills: [{ type: String }],
    tags: [{ type: String }], // Optional tags for categorization
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
        default: 'All Levels'
    },
});
const Course = mongoose.model('Course', courseSchema);

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    requiredSkills: [{ type: String }],
    assignedEmployees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
        default: 'Not Started'
    },
    deadline: { type: Date },
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);


// --- Profile API Endpoints ---
// Get current user's profile
app.get('/api/profile/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update current user's profile
app.put('/api/profile/me', authMiddleware, async (req, res) => {
    const { name, skills } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (skills) updates.skills = skills; // Assuming skills is an array
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- Course Enrollment and Completion API Endpoints ---
app.post('/api/courses/:courseId/enroll', authMiddleware, async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const userId = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (user.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ msg: 'User already enrolled in this course' });
        }

        user.enrolledCourses.push(courseId);
        user.tokens += 10;
        await user.save();
        res.json({ msg: 'Successfully enrolled in course', enrolledCourses: user.enrolledCourses });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.get('/api/users/me/enrolled-courses', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('enrolledCourses');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user.enrolledCourses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/api/courses/:courseId/complete', authMiddleware, async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (!user.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ msg: 'User is not enrolled in this course. Cannot mark as complete.' });
        }

        if (user.completedCourses.includes(courseId)) {
            return res.status(400).json({ msg: 'Course already marked as completed.' });
        }

        user.completedCourses.push(courseId);
        await user.save();
        res.json({ msg: 'Course marked as completed successfully!', completedCourses: user.completedCourses });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid course ID format.' });
        }
        res.status(500).send('Server Error');
    }
});

app.get('/api/users/me/completed-courses', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('completedCourses');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user.completedCourses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- User Management API Endpoints (Admin/Manager) ---
app.get('/api/users', authMiddleware, async (req, res) => { // RESOLVED: Kept the version with role check
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ msg: 'Access denied: Admin or Manager role required.' });
    }
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- Course Management API Endpoints ---
// POST /api/courses - Create a new course (Admin/Manager only)
app.post('/api/courses', authMiddleware, async (req, res) => { // RESOLVED: Kept the more complete version with role check and more fields
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ msg: 'Access denied: Admin or Manager role required for creating courses.' });
    }
    try {
        const { title, description, tags, difficulty } = req.body;
        if (!title || !description) {
            return res.status(400).json({ msg: 'Please enter title and description for the course' });
        }
        const newCourse = new Course({
            title,
            description,
            tags: tags || [],
            difficulty: difficulty || 'All Levels'
        });
        const savedCourse = await newCourse.save();
        res.status(201).json(savedCourse);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/courses - Get all courses (with filtering)
app.get('/api/courses', async (req, res) => { // RESOLVED: Kept the version with filtering. Decided to keep it public for now.
                                           // Add authMiddleware if login is required to browse.
    try {
        const { skills, difficulty, search } = req.query;
        let query = {};

        if (skills) {
            const skillsArray = skills.split(',').map(skill => skill.trim()).filter(skill => skill);
            if (skillsArray.length > 0) {
                query.tags = { $in: skillsArray };
            }
        }

        if (difficulty && difficulty !== 'All' && difficulty !== 'All Levels') {
            query.difficulty = difficulty;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const courses = await Course.find(query);
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- Authentication API Endpoints ---
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password, skills, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        user = new User({
            name,
            email,
            password,
            skills: skills || [],
            role: role || 'employee'
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };
        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token, userId: user.id, role: user.role, name: user.name });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };
        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                res.json({ token, userId: user.id, role: user.role, name: user.name });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// --- Project API Endpoints ---
app.post('/api/projects', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ msg: 'Access denied: Admin or Manager role required.' });
    }
    try {
        const { title, description, requiredSkills, deadline } = req.body;
        if (!title || !description) {
            return res.status(400).json({ msg: 'Please provide title and description for the project.' });
        }
        const newProject = new Project({
            title,
            description,
            requiredSkills: requiredSkills || [],
            deadline,
        });
        const savedProject = await newProject.save();
        res.status(201).json(savedProject);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.get('/api/projects', authMiddleware, async (req, res) => {
    try {
        const projects = await Project.find().populate('assignedEmployees', 'name email');
        res.json(projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.get('/api/projects/:projectId', authMiddleware, async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId).populate('assignedEmployees', 'name email');
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        res.json(project);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Project not found' });
        }
        res.status(500).send('Server Error');
    }
});

app.put('/api/projects/:projectId', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ msg: 'Access denied: Admin or Manager role required.' });
    }
    try {
        const { title, description, requiredSkills, assignedEmployees, status, deadline } = req.body;
        const projectFields = {};
        if (title) projectFields.title = title;
        if (description) projectFields.description = description;
        if (requiredSkills) projectFields.requiredSkills = requiredSkills;
        if (assignedEmployees) projectFields.assignedEmployees = assignedEmployees;
        if (status) projectFields.status = status;
        if (deadline) projectFields.deadline = deadline;

        let project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        project = await Project.findByIdAndUpdate(
            req.params.projectId,
            { $set: projectFields },
            { new: true }
        ).populate('assignedEmployees', 'name email');
        res.json(project);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Project not found' });
        }
        res.status(500).send('Server Error');
    }
});

app.delete('/api/projects/:projectId', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ msg: 'Access denied: Admin or Manager role required.' });
    }
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        await project.deleteOne();
        res.json({ msg: 'Project removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Project not found' });
        }
        res.status(500).send('Server Error');
    }
});

app.get('/api/users/me/projects', authMiddleware, async (req, res) => {
    try {
        const projects = await Project.find({ assignedEmployees: req.user.id })
            .populate('assignedEmployees', 'name email');
        res.json(projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// Edit a course (Admin/Manager only)
app.put('/api/courses/:courseId', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ msg: 'Access denied: Admin or Manager role required.' });
    }
    try {
        const { title, description, tags, difficulty } = req.body;
        const updates = {};
        if (title) updates.title = title;
        if (description) updates.description = description;
        if (tags) updates.tags = tags;
        if (difficulty) updates.difficulty = difficulty;

        let course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        course = await Course.findByIdAndUpdate(req.params.courseId, { $set: updates }, { new: true, runValidators: true });
        res.json(course);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Course not found' });
        }
        res.status(500).send('Server Error');
    }
});

// Delete a course (Admin/Manager only)
app.delete('/api/courses/:courseId', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ msg: 'Access denied: Admin or Manager role required.' });
    }
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }
        await course.deleteOne();
        res.json({ msg: 'Course deleted successfully' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Course not found' });
        }
        res.status(500).send('Server Error');
    }
});
// Edit a user (Admin/Manager only)
app.put('/api/users/:userId', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ msg: 'Access denied: Admin or Manager role required.' });
    }
    try {
        const { name, skills, role } = req.body;
        const updates = {};
        if (name) updates.name = name;
        if (skills) updates.skills = skills;
        if (role) {
            // Optional: restrict roles allowed to be assigned here if needed
            updates.role = role;
        }

        let user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user = await User.findByIdAndUpdate(req.params.userId, { $set: updates }, { new: true, runValidators: true }).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
});

// Delete a user (Admin/Manager only)
app.delete('/api/users/:userId', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ msg: 'Access denied: Admin or Manager role required.' });
    }
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        await user.deleteOne();
        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
});







// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

