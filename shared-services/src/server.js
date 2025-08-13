const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const paymentRoutes = require('./routes/payments');
const analyticsRoutes = require('./routes/analytics');
const mediaRoutes = require('./routes/media');
const ecommerceRoutes = require('./routes/ecommerce');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      auth: 'active',
      ai: 'active', 
      payments: 'active',
      analytics: 'active',
      media: 'active',
      ecommerce: 'active'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/ecommerce', ecommerceRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Scalable Business Platforms - Shared Services API',
    version: '1.0.0',
    documentation: '/api/docs',
    platforms: [
      'mobile-app-platform',
      'youtube-automation-platform', 
      'print-on-demand-platform',
      'online-course-platform'
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Shared Services API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});