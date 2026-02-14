const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // In production, replace with frontend URL
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// CORS
app.use(cors());

// Helmet for security headers
const helmet = require('helmet');
app.use(helmet());

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Socket.io Middleware
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Mount routers
const auth = require('./routes/auth');
const grievance = require('./routes/grievance');
const internships = require('./routes/internships');
const applications = require('./routes/applications');
const courses = require('./routes/courses');
const analytics = require('./routes/analytics');
const admin = require('./routes/admin');

app.use('/api/v1/auth', auth);
app.use('/api/v1/grievances', grievance);
app.use('/api/v1/internships', internships);
app.use('/api/v1/applications', applications);
app.use('/api/v1/courses', courses);
app.use('/api/v1/analytics', analytics);
app.use('/api/v1/admin', admin);

// Socket.io connection
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    // Join room based on role or user ID for targeted notifications
    socket.on('join', (userData) => {
        // userData can be just role string, or object { role, id }
        if (typeof userData === 'string') {
            socket.join(userData);
            console.log(`Socket ${socket.id} joined room ${userData}`);
        } else if (typeof userData === 'object') {
            if (userData.role) socket.join(userData.role);
            if (userData.id) socket.join(userData.id);
            console.log(`Socket ${socket.id} joined rooms for ${userData.role} and ${userData.id}`);
        }
    });
});

// Error Handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
