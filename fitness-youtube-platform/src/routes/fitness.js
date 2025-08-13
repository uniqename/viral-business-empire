const express = require('express');
const FitnessContentGenerator = require('../services/FitnessContentGenerator');
const router = express.Router();

const fitnessGenerator = new FitnessContentGenerator();

// Generate fitness video
router.post('/generate-video', async (req, res) => {
  try {
    const { niche, duration, difficulty, focus } = req.body;
    
    const result = await fitnessGenerator.generateFitnessVideo({
      niche: niche || 'weight-loss',
      duration: duration || '10-15 minutes',
      difficulty: difficulty || 'intermediate',
      focus: focus || 'full-body'
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate workout plan only
router.post('/workout-plan', async (req, res) => {
  try {
    const { niche, difficulty, focus, duration } = req.body;
    
    const workoutPlan = await fitnessGenerator.generateWorkoutPlan(
      niche || 'weight-loss',
      difficulty || 'intermediate', 
      focus || 'full-body',
      duration || '15 minutes'
    );

    res.json({
      success: true,
      workoutPlan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get fitness niches
router.get('/niches', (req, res) => {
  const niches = {
    'weight-loss': {
      description: 'Fat burning and cardio workouts',
      keywords: ['fat burning', 'cardio', 'HIIT', 'calorie deficit'],
      targetAudience: 'People looking to lose weight'
    },
    'muscle-building': {
      description: 'Strength training and hypertrophy',
      keywords: ['strength training', 'hypertrophy', 'progressive overload'],
      targetAudience: 'People looking to build muscle'
    },
    'home-workouts': {
      description: 'No equipment bodyweight exercises',
      keywords: ['no equipment', 'bodyweight', 'home fitness'],
      targetAudience: 'People working out from home'
    },
    'yoga-flexibility': {
      description: 'Flexibility and mindfulness practices',
      keywords: ['flexibility', 'mobility', 'stretching', 'mindfulness'],
      targetAudience: 'People interested in flexibility and wellness'
    },
    'hiit-training': {
      description: 'High intensity interval training',
      keywords: ['high intensity', 'interval training', 'quick workout'],
      targetAudience: 'People wanting time-efficient workouts'
    }
  };

  res.json({
    success: true,
    niches
  });
});

// Generate thumbnail
router.post('/thumbnail', async (req, res) => {
  try {
    const { workoutPlan } = req.body;
    
    if (!workoutPlan) {
      return res.status(400).json({
        success: false,
        error: 'Workout plan is required'
      });
    }

    const thumbnail = await fitnessGenerator.generateFitnessThumbnail(workoutPlan);
    
    res.json({
      success: true,
      thumbnail
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get content ideas
router.get('/content-ideas/:niche', async (req, res) => {
  try {
    const { niche } = req.params;
    const { count = 10 } = req.query;
    
    const ideas = await fitnessGenerator.generateContentIdeas(niche, parseInt(count));
    
    res.json({
      success: true,
      niche,
      ideas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get analytics
router.get('/analytics', async (req, res) => {
  try {
    const analytics = await fitnessGenerator.getAnalytics();
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;