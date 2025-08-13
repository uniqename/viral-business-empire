const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const revenueRoutes = require('./routes/revenue');
const automationRoutes = require('./routes/automation');
const AlertsService = require('./services/AlertsService');
const RevenueService = require('./services/RevenueService');
const HealthMonitor = require('./services/HealthMonitor');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.DASHBOARD_PORT || 5000;

// Initialize services
const alertsService = new AlertsService(io);
const revenueService = new RevenueService(io);
const healthMonitor = new HealthMonitor(io);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/automation', automationRoutes);

// Main dashboard page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Revenue management page
app.get('/revenue', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/revenue.html'));
});

// Automation control page
app.get('/automation', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/automation.html'));
});

// Health monitoring page
app.get('/health', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/health.html'));
});

// API health check
app.get('/api/health', async (req, res) => {
  const healthStatus = await healthMonitor.getSystemHealth();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    dashboard: 'active',
    platforms: healthStatus
  });
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('Dashboard client connected:', socket.id);

  // Send initial data
  socket.emit('initial-data', {
    revenue: revenueService.getCurrentStats(),
    health: healthMonitor.getCurrentStatus(),
    alerts: alertsService.getActiveAlerts()
  });

  socket.on('request-platform-data', async (platform) => {
    try {
      const data = await getPlatformData(platform);
      socket.emit('platform-data', { platform, data });
    } catch (error) {
      socket.emit('error', { message: `Failed to get ${platform} data` });
    }
  });

  socket.on('trigger-payout', async (data) => {
    try {
      const result = await revenueService.triggerPayout(data);
      socket.emit('payout-result', result);
    } catch (error) {
      socket.emit('payout-error', { error: error.message });
    }
  });

  socket.on('pause-automation', async (platform) => {
    try {
      await pausePlatformAutomation(platform);
      socket.emit('automation-paused', { platform });
      alertsService.addAlert(`${platform} automation paused`, 'warning');
    } catch (error) {
      socket.emit('error', { message: `Failed to pause ${platform}` });
    }
  });

  socket.on('resume-automation', async (platform) => {
    try {
      await resumePlatformAutomation(platform);
      socket.emit('automation-resumed', { platform });
      alertsService.addAlert(`${platform} automation resumed`, 'success');
    } catch (error) {
      socket.emit('error', { message: `Failed to resume ${platform}` });
    }
  });

  socket.on('disconnect', () => {
    console.log('Dashboard client disconnected:', socket.id);
  });
});

// Start monitoring services
healthMonitor.startMonitoring();
revenueService.startRevenueTracking();
alertsService.startAlertSystem();

// Helper functions
async function getPlatformData(platform) {
  const platformUrls = {
    'mobile-app': 'http://localhost:3000',
    'youtube': 'http://localhost:3001', 
    'print-on-demand': 'http://localhost:3002',
    'online-course': 'http://localhost:3003',
    'automation': 'http://localhost:4000'
  };

  const axios = require('axios');
  const response = await axios.get(`${platformUrls[platform]}/health`);
  return response.data;
}

async function pausePlatformAutomation(platform) {
  const axios = require('axios');
  await axios.post(`http://localhost:4000/pause/${platform}`);
}

async function resumePlatformAutomation(platform) {
  const axios = require('axios');
  await axios.post(`http://localhost:4000/resume/${platform}`);
}

// Error handling
app.use((error, req, res, next) => {
  console.error('Dashboard error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl
  });
});

server.listen(PORT, () => {
  console.log(`🎛️ Business Dashboard running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`💰 Revenue: http://localhost:${PORT}/revenue`);
  console.log(`🤖 Automation: http://localhost:${PORT}/automation`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});

module.exports = { app, server, io };