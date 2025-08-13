const express = require('express');
const GameGenerator = require('../services/GameGenerator');
const router = express.Router();

const gameGenerator = new GameGenerator();

// Generate new game
router.post('/generate', async (req, res) => {
  try {
    const { genre, complexity, theme, targetAge, monetization } = req.body;
    
    const result = await gameGenerator.createGame({
      genre: genre || 'casual',
      complexity: complexity || 'simple',
      theme: theme || 'adventure',
      targetAge: targetAge || '13+',
      monetization: monetization || 'ads'
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get game concept ideas
router.get('/concepts/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const concepts = await gameGenerator.generateGameConcepts(genre, 5);
    
    res.json({
      success: true,
      genre,
      concepts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate game assets
router.post('/assets', async (req, res) => {
  try {
    const { gameId, assetTypes } = req.body;
    const assets = await gameGenerator.generateGameAssets(gameId, assetTypes);
    
    res.json({
      success: true,
      gameId,
      assets
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
    const analytics = await gameGenerator.getAnalytics();
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

// Build game for platform
router.post('/build/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { platform, buildType } = req.body;
    
    const buildResult = await gameGenerator.buildGame(gameId, platform, buildType);
    
    res.json({
      success: true,
      gameId,
      platform,
      build: buildResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;