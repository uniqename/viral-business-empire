const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://consulting.homelinkgh.com", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3007;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: 'Too many login attempts, please try again later'
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Platform URLs (update these to your production URLs)
const PLATFORM_URLS = {
  'mobile-app': 'http://localhost:3001',
  'youtube-automation': 'http://localhost:3002', 
  'print-on-demand': 'http://localhost:3003',
  'online-course': 'http://localhost:3004',
  'game-app': 'http://localhost:3005',
  'fitness-youtube': 'http://localhost:3006',
  'business-course': 'http://localhost:3007'
};

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.authenticated) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Login endpoint
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Replace with your actual credentials (hash the password in production)
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'enam_admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SecurePassword123!';
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      req.session.authenticated = true;
      req.session.user = { username, role: 'admin' };
      
      res.json({
        success: true,
        message: 'Login successful',
        user: { username, role: 'admin' }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login error'
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Dashboard data endpoint
app.get('/api/dashboard/overview', requireAuth, async (req, res) => {
  try {
    const platformData = {};
    const healthChecks = {};
    
    // Check health of all platforms
    for (const [platform, url] of Object.entries(PLATFORM_URLS)) {
      try {
        const healthResponse = await axios.get(`${url}/health`, { timeout: 5000 });
        healthChecks[platform] = {
          status: 'healthy',
          ...healthResponse.data
        };
      } catch (error) {
        healthChecks[platform] = {
          status: 'unhealthy',
          error: error.message
        };
      }
    }
    
    // Get analytics from each platform
    for (const [platform, url] of Object.entries(PLATFORM_URLS)) {
      try {
        const analyticsResponse = await axios.get(`${url}/api/analytics`, { timeout: 5000 });
        platformData[platform] = analyticsResponse.data;
      } catch (error) {
        platformData[platform] = {
          success: false,
          error: error.message
        };
      }
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      health: healthChecks,
      analytics: platformData,
      summary: {
        totalPlatforms: Object.keys(PLATFORM_URLS).length,
        healthyPlatforms: Object.values(healthChecks).filter(h => h.status === 'healthy').length,
        totalRevenue: calculateTotalRevenue(platformData),
        activeAutomations: countActiveAutomations(platformData)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Revenue management endpoints
app.get('/api/revenue/summary', requireAuth, async (req, res) => {
  try {
    const revenueData = {};
    
    for (const [platform, url] of Object.entries(PLATFORM_URLS)) {
      try {
        const response = await axios.get(`${url}/api/revenue`, { timeout: 5000 });
        revenueData[platform] = response.data;
      } catch (error) {
        revenueData[platform] = { revenue: 0, error: error.message };
      }
    }

    const totalRevenue = Object.values(revenueData)
      .reduce((sum, data) => sum + (data.revenue || 0), 0);

    res.json({
      success: true,
      totalRevenue,
      platformRevenue: revenueData,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Automation control endpoints
app.post('/api/automation/:platform/:action', requireAuth, async (req, res) => {
  try {
    const { platform, action } = req.params;
    const url = PLATFORM_URLS[platform];
    
    if (!url) {
      return res.status(404).json({
        success: false,
        error: 'Platform not found'
      });
    }

    const response = await axios.post(`${url}/api/automation/${action}`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Emergency stop all automation
app.post('/api/emergency/stop-all', requireAuth, async (req, res) => {
  try {
    const results = {};
    
    for (const [platform, url] of Object.entries(PLATFORM_URLS)) {
      try {
        const response = await axios.post(`${url}/api/automation/stop`, { emergency: true });
        results[platform] = response.data;
      } catch (error) {
        results[platform] = { success: false, error: error.message };
      }
    }

    res.json({
      success: true,
      message: 'Emergency stop initiated for all platforms',
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Serve the dashboard UI
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Login page
app.get('/login', (req, res) => {
  if (req.session.authenticated) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Root redirect
app.get('/', (req, res) => {
  if (req.session.authenticated) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('Dashboard client connected');
  
  // Send periodic updates
  const updateInterval = setInterval(async () => {
    try {
      const healthChecks = {};
      
      for (const [platform, url] of Object.entries(PLATFORM_URLS)) {
        try {
          const response = await axios.get(`${url}/health`, { timeout: 3000 });
          healthChecks[platform] = { status: 'healthy', ...response.data };
        } catch (error) {
          healthChecks[platform] = { status: 'unhealthy', error: error.message };
        }
      }
      
      socket.emit('health-update', healthChecks);
    } catch (error) {
      socket.emit('error', { message: 'Failed to fetch health updates' });
    }
  }, 30000); // Update every 30 seconds

  socket.on('disconnect', () => {
    clearInterval(updateInterval);
    console.log('Dashboard client disconnected');
  });
});

// Helper functions
function calculateTotalRevenue(platformData) {
  return Object.values(platformData).reduce((total, data) => {
    if (data.analytics && data.analytics.revenue) {
      return total + data.analytics.revenue;
    }
    return total;
  }, 0);
}

function countActiveAutomations(platformData) {
  return Object.values(platformData).reduce((count, data) => {
    if (data.analytics && data.analytics.activeAutomations) {
      return count + data.analytics.activeAutomations;
    }
    return count;
  }, 0);
}

server.listen(PORT, () => {
  console.log(`🚀 Secure Business Dashboard running on port ${PORT}`);
  console.log(`💻 Access at: https://consulting.homelinkgh.com/business-dashboard`);
});