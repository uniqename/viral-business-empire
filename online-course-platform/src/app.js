const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/course');
const lessonRoutes = require('./routes/lesson');
const studentRoutes = require('./routes/student');
const instructorRoutes = require('./routes/instructor');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/instructors', instructorRoutes);

// Serve static files
app.use('/videos', express.static('output/videos'));
app.use('/certificates', express.static('output/certificates'));
app.use('/slides', express.static('output/slides'));

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('Student connected:', socket.id);

  socket.on('join-course', (courseId) => {
    socket.join(courseId);
    console.log(`Student joined course: ${courseId}`);
  });

  socket.on('progress-update', (data) => {
    socket.to(data.courseId).emit('student-progress', data);
  });

  socket.on('disconnect', () => {
    console.log('Student disconnected:', socket.id);
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    platform: 'Online Course Platform',
    timestamp: new Date().toISOString(),
    services: {
      'course-generation': 'active',
      'video-creation': 'active',
      'quiz-generation': 'active',
      'certificate-generation': 'active',
      'student-management': 'active',
      'real-time-communication': 'active'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Online Course Platform',
    version: '1.0.0',
    features: [
      'AI course generation',
      'Video lesson creation',
      'Interactive quizzes',
      'Progress tracking',
      'Certificate generation',
      'Real-time chat',
      'Student analytics'
    ],
    integrations: [
      'Stripe payments',
      'Email notifications',
      'Video streaming',
      'AI content generation'
    ]
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online-course-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

server.listen(PORT, () => {
  console.log(`🎓 Online Course Platform running on port ${PORT}`);
});