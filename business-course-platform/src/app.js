const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const businessRoutes = require('./routes/business');
const BusinessCourseGenerator = require('./services/BusinessCourseGenerator');

const app = express();
const PORT = process.env.PORT || 3006;

// Initialize business course generator
const courseGenerator = new BusinessCourseGenerator();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/business', businessRoutes);

// Serve static assets
app.use('/courses', express.static('output/courses'));
app.use('/materials', express.static('output/materials'));
app.use('/certificates', express.static('output/certificates'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Business Course Platform',
    timestamp: new Date().toISOString(),
    services: {
      'course-generation': 'active',
      'material-creation': 'active',
      'assessment-builder': 'active',
      'certification-system': 'active'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Business Education & Entrepreneurship Platform',
    version: '1.0.0',
    features: [
      'AI business course generation',
      'Comprehensive curriculum development',
      'Interactive learning materials',
      'Assessment & quiz creation',
      'Certificate generation',
      'Business plan templates',
      'Case study development'
    ],
    courseCategories: [
      'Entrepreneurship Fundamentals',
      'Digital Marketing Mastery',
      'Financial Management',
      'Leadership & Management',
      'Sales & Customer Relations',
      'Business Strategy',
      'E-commerce & Online Business',
      'Investment & Wealth Building'
    ]
  });
});

// Analytics endpoint
app.get('/api/analytics', async (req, res) => {
  try {
    const analytics = await courseGenerator.getAnalytics();
    res.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🎓 Business Course Platform running on port ${PORT}`);
});