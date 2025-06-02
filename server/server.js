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
    }] // Array of strings for skills
});
const User = mongoose.model('User', userSchema);

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    // For a more advanced system, you might add:
    // instructor: { type: String },
    // duration: { type: String },
    // modules: [{ title: String, content: String }]
});
const Course = mongoose.model('Course', courseSchema);

// Get current user's profile
app.get('/api/profile/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update current user's profile
app.put('/api/profile/me', authMiddleware, async (req, res) => {
    const { name, skills } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (skills) updates.skills = skills;
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});


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
    // ... rest of your course creation logic
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ msg: 'Please enter title and description for the course' });
        }
        const newCourse = new Course({
            title,
            description
            // createdBy: req.user.id // Optionally track who created the course
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
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

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

// ... (Your /api/admin/users routes, /api/courses routes)
// ... (app.listen)
