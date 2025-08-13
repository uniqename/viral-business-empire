const express = require('express');
const cors = require('cors');
require('dotenv').config();

const videoRoutes = require('./routes/video');
const channelRoutes = require('./routes/channel');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/video', videoRoutes);
app.use('/api/channel', channelRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    platform: 'YouTube Automation',
    timestamp: new Date().toISOString(),
    services: {
      'script-generation': 'active',
      'video-creation': 'active',
      'thumbnail-generation': 'active',
      'youtube-upload': 'active',
      'scheduler': 'active'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎥 YouTube Automation Platform',
    version: '1.0.0',
    features: [
      'AI script generation',
      'Automated video creation',
      'Thumbnail generation',
      'YouTube upload automation',
      'Content scheduling',
      'Analytics tracking'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🎥 YouTube Automation Platform running on port ${PORT}`);
});