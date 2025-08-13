const express = require('express');
const cors = require('cors');

// Create mock services for all 7 platforms
const platforms = [
  { port: 3001, name: 'Mobile App Platform', icon: '📱' },
  { port: 3002, name: 'YouTube Automation', icon: '🎥' },  
  { port: 3003, name: 'Print-on-Demand', icon: '👕' },
  { port: 3004, name: 'Online Course', icon: '🎓' },
  { port: 3005, name: 'Game App Platform', icon: '🎮' },
  { port: 3006, name: 'Fitness YouTube', icon: '💪' },
  { port: 3007, name: 'Business Course', icon: '💼' }
];

platforms.forEach(platform => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Health endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      platform: platform.name,
      timestamp: new Date().toISOString(),
      services: {
        'content-generation': 'active',
        'automation': 'active',
        'monetization': 'active'
      }
    });
  });

  // Root endpoint  
  app.get('/', (req, res) => {
    res.json({
      message: `${platform.icon} ${platform.name}`,
      version: '1.0.0',
      status: 'running'
    });
  });

  // Analytics endpoint
  app.get('/api/analytics', (req, res) => {
    res.json({
      success: true,
      analytics: {
        revenue: Math.floor(Math.random() * 3000) + 500,
        activeAutomations: Math.floor(Math.random() * 5) + 1,
        itemsGenerated: Math.floor(Math.random() * 50) + 10,
        totalViews: Math.floor(Math.random() * 50000) + 5000,
        users: Math.floor(Math.random() * 1000) + 100
      },
      timestamp: new Date().toISOString()
    });
  });

  // Revenue endpoint
  app.get('/api/revenue', (req, res) => {
    res.json({
      success: true,
      revenue: Math.floor(Math.random() * 3000) + 500,
      timestamp: new Date().toISOString()
    });
  });

  // Start the server
  app.listen(platform.port, () => {
    console.log(`${platform.icon} ${platform.name} running on port ${platform.port}`);
  });
});

console.log('🚀 All 7 Mock Platforms Started!');
console.log('📊 Access Dashboard: http://localhost:3008/login');
console.log('🔐 Login: enam_admin / SecurePassword123!');