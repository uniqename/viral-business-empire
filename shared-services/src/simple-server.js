const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Shared Services API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🔧 Shared Services API',
    version: '1.0.0',
    services: [
      'AI Content Generation',
      'Payment Processing',
      'Analytics Tracking',
      'Media Processing',
      'Authentication'
    ]
  });
});

// Mock AI endpoint
app.post('/api/ai/generate-content', (req, res) => {
  const { platform, type, prompt } = req.body;
  
  // Mock response
  res.json({
    success: true,
    content: `Generated ${type} content for ${platform}: ${prompt}`,
    timestamp: new Date().toISOString()
  });
});

// Mock analytics endpoint
app.post('/api/analytics/track', (req, res) => {
  const { platform, event, properties } = req.body;
  
  res.json({
    success: true,
    message: `Tracked ${event} for ${platform}`,
    timestamp: new Date().toISOString()
  });
});

// Mock revenue endpoint
app.get('/api/revenue', (req, res) => {
  res.json({
    success: true,
    revenue: Math.floor(Math.random() * 5000) + 1000,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🔧 Shared Services API running on port ${PORT}`);
});