const express = require('express');
const cors = require('cors');
require('dotenv').config();

const fitnessRoutes = require('./routes/fitness');
const FitnessContentGenerator = require('./services/FitnessContentGenerator');

const app = express();
const PORT = process.env.PORT || 3005;

// Initialize fitness content generator
const fitnessGenerator = new FitnessContentGenerator();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/fitness', fitnessRoutes);

// Serve static assets
app.use('/videos', express.static('output/videos'));
app.use('/thumbnails', express.static('output/thumbnails'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Fitness YouTube Platform',
    timestamp: new Date().toISOString(),
    services: {
      'workout-generation': 'active',
      'video-creation': 'active',
      'nutrition-content': 'active',
      'youtube-upload': 'active'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '💪 Fitness YouTube Automation Platform',
    version: '1.0.0',
    features: [
      'AI workout plan generation',
      'Fitness video creation',
      'Nutrition content automation',
      'Exercise form tutorials',
      'Motivational content',
      'YouTube scheduling'
    ],
    niches: [
      'Weight Loss',
      'Muscle Building',
      'Home Workouts',
      'Yoga & Flexibility',
      'HIIT Training',
      'Nutrition Education',
      'Beginner Fitness'
    ]
  });
});

// Analytics endpoint
app.get('/api/analytics', async (req, res) => {
  try {
    const analytics = await fitnessGenerator.getAnalytics();
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
  console.log(`💪 Fitness YouTube Platform running on port ${PORT}`);
});