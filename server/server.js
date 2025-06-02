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

const JWT_SECRET = 'abc'; // IMPORTANT: Use an environment variable for this in production!

const mongoURI = 'mongodb+srv://arishit:abc@companygroww.4trxhfw.mongodb.net/'; // Change if needed


mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));


// server/server.js
// ... (mongoose import)

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    skills: [{ type: String }],
    role: {
        type: String,
        enum: ['employee', 'manager', 'admin'],
        default: 'employee'
    },
    enrolledCourses: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course' 
    }],
    completedCourses: [{ // Add this field
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }]
});
const User = mongoose.model('User', userSchema);

// ... (rest of your schemas and code)


const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String }], // Optional tags for categorization
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced','All Levels'],
        default: 'All Levels'
    },
    // For a more advanced system, you might add:
    // instructor: { type: String },
    // duration: { type: String },
    // modules: [{ title: String, content: String }]
});
const Course = mongoose.model('Course', courseSchema);

// NEW: Project Schema
const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    requiredSkills: [{ type: String }], // Skills needed for the project
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
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Optional: track who created it
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

const Project = mongoose.model('Project', projectSchema);

app.post('/api/courses/:courseId/enroll', authMiddleware, async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const userId = req.user.id; // Get user ID from authenticated token

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        // Check if user exists (though authMiddleware implies they do)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if already enrolled
        if (user.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ msg: 'User already enrolled in this course' });
        }

        user.enrolledCourses.push(courseId);
        await user.save();

        res.json({ msg: 'Successfully enrolled in course', enrolledCourses: user.enrolledCourses });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// NEW: Endpoint to get courses a user is enrolled in
app.get('/api/users/me/enrolled-courses', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('enrolledCourses'); 
        // .populate('enrolledCourses') will replace the ObjectIds with the actual course documents

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user.enrolledCourses);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Secure Admin routes (example for getting all users)
// Make sure your GET /api/users is also protected if it's admin-only
app.get('/api/users', authMiddleware, async (req, res) => {
    // Add role check if necessary
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ msg: 'Access denied: Admin or Manager role required.' });
    }
    try {
        const users = await User.find().select('-password'); // Exclude passwords
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Similarly, POST /api/courses should be protected for admins/managers
app.post('/api/courses', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ msg: 'Access denied: Admin or Manager role required for creating courses.' });
    }
    try {
        const { title, description, tags, difficulty } = req.body; // Add tags and difficulty
        if (!title || !description) {
            return res.status(400).json({ msg: 'Please enter title and description for the course' });
        }
        const newCourse = new Course({
            title,
            description,
            tags: tags || [], // Default to empty array if not provided
            difficulty: difficulty || 'All Levels' // Default if not provided
        });
        const savedCourse = await newCourse.save();
        res.status(201).json(savedCourse);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


app.post('/api/courses', async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ msg: 'Please enter title and description for the course' });
        }
        const newCourse = new Course({
            title,
            description
        });
        const savedCourse = await newCourse.save();
        res.status(201).json(savedCourse);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// API Endpoint: Get all employees
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// server/server.js
// ...

// API Endpoint: Get all courses (with filtering)
app.get('/api/courses', async (req, res) => { // No authMiddleware here if courses are public to browse before login, 
                                           // or add it if login is required to browse.
                                           // For now, let's assume public browsing.
    try {
        const { skills, difficulty, search } = req.query; // Get filter params from query string
        let query = {};

        if (skills) {
            // Skills might be a comma-separated string from query params
            const skillsArray = skills.split(',').map(skill => skill.trim());
            if (skillsArray.length > 0) {
                query.tags = { $in: skillsArray }; // Match courses that have AT LEAST ONE of the skills
            }
        }

        if (difficulty && difficulty !== 'All' && difficulty !== 'All Levels') { // Allow 'All' to bypass difficulty filter
            query.difficulty = difficulty;
        }

        if (search) {
            // Simple text search in title and description
            query.$or = [
                { title: { $regex: search, $options: 'i' } }, // Case-insensitive search
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

// ... (rest of your code)

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// server/server.js
// ... (User and Course models)

// --- Authentication API Endpoints ---


// User Signup (Register)
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password, skills, role } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user instance
        user = new User({
            name,
            email,
            password,
            skills: skills || [],
            role: role || 'employee' // Default to employee if not specified
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Create JWT payload
        const payload = {
            user: {
                id: user.id, // mongoose uses 'id' as a virtual getter for '_id'
                role: user.role
            }
        };

        // Sign token
        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: 3600 }, // Expires in 1 hour (3600 seconds)
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

// User Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Create JWT payload
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        // Sign token
        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: 3600 }, // Expires in 1 hour
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

// server/server.js
// ... (authMiddleware, User model, Course model)
// ... (other API endpoints)

// NEW: Endpoint for a user to mark an enrolled course as completed
app.post('/api/courses/:courseId/complete', authMiddleware, async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if user is enrolled in the course
        if (!user.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ msg: 'User is not enrolled in this course. Cannot mark as complete.' });
        }

        // Check if already completed
        if (user.completedCourses.includes(courseId)) {
            return res.status(400).json({ msg: 'Course already marked as completed.' });
        }

        user.completedCourses.push(courseId);
        await user.save();

        // Optionally: Trigger badge earning logic here in the future
        // For now, just confirm completion.

        res.json({ msg: 'Course marked as completed successfully!', completedCourses: user.completedCourses });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') { // Handle invalid courseId format
            return res.status(400).json({ msg: 'Invalid course ID format.' });
        }
        res.status(500).send('Server Error');
    }
});

// NEW: Endpoint to get user's completed courses
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


// --- Project API Endpoints ---

// POST /api/projects - Create a new project (Admin/Manager only)
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
            // createdBy: req.user.id // If you add createdBy to schema
        });

        const savedProject = await newProject.save();
        res.status(201).json(savedProject);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/projects - Get all projects (Admin/Manager can see all, employees might see a filtered list later)
app.get('/api/projects', authMiddleware, async (req, res) => {
    // For now, let's allow all authenticated users to see projects.
    // You might want to restrict this further or filter based on role later.
    try {
        const projects = await Project.find().populate('assignedEmployees', 'name email'); // Populate employee details
        res.json(projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/projects/:projectId - Get a single project by ID
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

// PUT /api/projects/:projectId - Update a project (e.g., assign employees, change status) (Admin/Manager only)
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
        if (assignedEmployees) projectFields.assignedEmployees = assignedEmployees; // Expecting an array of User IDs
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

// DELETE /api/projects/:projectId - Delete a project (Admin/Manager only)
app.delete('/api/projects/:projectId', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ msg: 'Access denied: Admin or Manager role required.' });
    }
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        await project.deleteOne(); // or project.remove() for older Mongoose versions

        res.json({ msg: 'Project removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Project not found' });
        }
        res.status(500).send('Server Error');
    }
});


// Endpoint for employees to see their assigned projects
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

