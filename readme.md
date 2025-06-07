# CompanyGrow 🚀

A comprehensive employee development and project management platform designed to streamline corporate training, skill development, and project allocation.

## ✨ Features

### 🎓 Learning Management System
- **Course Enrollment**: Employees can browse and enroll in courses based on skills and difficulty levels
- **Progress Tracking**: Track course completion and learning progress
- **Skill-based Filtering**: Filter courses by skills, difficulty, and search terms
- **Token Rewards**: Earn tokens upon course completion and enrollment

### 👥 User Management
- **Role-based Access Control**: Admin, Manager, and Employee roles with different permissions
- **Profile Management**: Users can manage their profiles, skills, and work experience
- **Employee Directory**: Search and filter employees by role and skills

### 📋 Project Management
- **Project Creation**: Managers and admins can create projects with required skills
- **Team Assignment**: Assign employees to projects based on their skills
- **Project Tracking**: Monitor project status and deadlines

### 🎯 Admin Dashboard
- **Course Management**: Create, edit, and delete courses
- **User Administration**: Manage user accounts and roles
- **Analytics Overview**: View system statistics and performance metrics

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with modern design

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/companygrow.git
cd companygrow
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Environment Setup**
Create a `.env` file in the server directory:
```env
MONGODB_URI=mongodb://localhost:27017/companygrow
JWT_SECRET=your_jwt_secret_key
PORT=5001
```

5. **Start the application**

**Terminal 1 - Start the server:**
```bash
cd server
npm start
```

**Terminal 2 - Start the client:**
```bash
cd client
npm start
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5001`

## 📁 Project Structure

```
companygrow/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   └── App.js         # Main app component
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── middleware/        # Express middleware
│   ├── server.js          # Main server file
│   └── package.json       # Server dependencies
└── README.md
```

## 🔐 Authentication & Authorization

The application uses JWT-based authentication with three user roles:

- **Admin**: Full system access, user management, course management
- **Manager**: Course management, project management, user oversight
- **Employee**: Course enrollment, profile management, project participation

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course (Admin/Manager)
- `PUT /api/courses/:id` - Update course (Admin/Manager)
- `DELETE /api/courses/:id` - Delete course (Admin/Manager)
- `POST /api/courses/:id/enroll` - Enroll in course
- `POST /api/courses/:id/complete` - Mark course as complete

### Users
- `GET /api/users` - Get all users (Admin/Manager)
- `GET /api/users/me/enrolled-courses` - Get user's enrolled courses
- `GET /api/users/me/completed-courses` - Get user's completed courses
- `PUT /api/users/:id` - Update user (Admin/Manager)
- `DELETE /api/users/:id` - Delete user (Admin/Manager)

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project (Admin/Manager)
- `PUT /api/projects/:id` - Update project (Admin/Manager)
- `DELETE /api/projects/:id` - Delete project (Admin/Manager)

### Profile
- `GET /api/profile/me` - Get current user profile
- `PUT /api/profile/me` - Update current user profile

## 🎨 Key Features Breakdown

### Dashboard Views
- **Employee Dashboard**: Course browsing, enrollment, progress tracking
- **Manager Dashboard**: Team overview, project management
- **Admin Dashboard**: System administration, user management

### Course Management
- Create courses with titles, descriptions, difficulty levels, and tags
- Skill-based course recommendations
- Progress tracking and completion certificates

### Project Management
- Create projects with required skills and deadlines
- Assign team members based on skills
- Track project status and progress

## 🔧 Development

### Running in Development Mode
```bash
# Start backend (from server directory)
npm run dev

# Start frontend (from client directory)
npm start
```

### Building for Production
```bash
# Build client
cd client
npm run build

# The build folder will contain the production-ready files
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🚧 Future Enhancements

- [ ] Real-time notifications
- [ ] Course material uploads
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] Integration with external learning platforms
- [ ] Video conferencing integration
- [ ] Automated skill assessment