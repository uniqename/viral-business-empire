const express = require('express');
const VideoGenerator = require('../services/VideoGenerator');
const router = express.Router();

const videoGenerator = new VideoGenerator();

// Generate video script
router.post('/generate-script', async (req, res) => {
  try {
    const { topic, duration, style, niche } = req.body;

    const result = await videoGenerator.generateScript(topic, duration, style);

    if (result.success) {
      res.json({
        success: true,
        script: result.script,
        metadata: {
          topic,
          duration,
          style,
          niche,
          wordCount: result.script.split(' ').length,
          estimatedVideoLength: Math.ceil(result.script.split(' ').length / 150) // words per minute
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate thumbnail
router.post('/generate-thumbnail', async (req, res) => {
  try {
    const { title, style, colors, template } = req.body;

    const result = await videoGenerator.generateThumbnail(title, style, colors);

    if (result.success) {
      res.json({
        success: true,
        thumbnailPath: result.thumbnailPath,
        fileName: result.fileName
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create complete video
router.post('/create-video', async (req, res) => {
  try {
    const {
      topic,
      title,
      description,
      duration = 600,
      style = 'educational',
      voiceId = 'default'
    } = req.body;

    // Step 1: Generate script
    const scriptResult = await videoGenerator.generateScript(topic, `${Math.floor(duration/60)} minutes`, style);
    if (!scriptResult.success) {
      throw new Error(`Script generation failed: ${scriptResult.error}`);
    }

    // Step 2: Generate voiceover
    const voiceResult = await videoGenerator.generateVoiceover(scriptResult.script, voiceId);
    if (!voiceResult.success) {
      throw new Error(`Voiceover generation failed: ${voiceResult.error}`);
    }

    // Step 3: Create video
    const videoResult = await videoGenerator.createVideo({
      script: scriptResult.script,
      audioPath: voiceResult.audioPath,
      title,
      description,
      duration
    });

    if (videoResult.success) {
      res.json({
        success: true,
        message: 'Video created successfully',
        video: {
          path: videoResult.videoPath,
          thumbnail: videoResult.thumbnailPath,
          fileName: videoResult.fileName,
          metadata: videoResult.metadata
        },
        script: scriptResult.script,
        processingTime: Date.now() - req.startTime || 0
      });
    } else {
      throw new Error(`Video creation failed: ${videoResult.error}`);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      step: 'video-creation'
    });
  }
});

// Batch video generation
router.post('/batch-generate', async (req, res) => {
  try {
    const { topics, settings } = req.body;
    const results = [];

    for (const topic of topics) {
      try {
        const result = await videoGenerator.createVideo({
          ...settings,
          topic: topic.topic,
          title: topic.title,
          description: topic.description
        });

        results.push({
          topic: topic.topic,
          success: result.success,
          video: result.success ? result : null,
          error: result.success ? null : result.error
        });
      } catch (error) {
        results.push({
          topic: topic.topic,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Processed ${topics.length} videos`,
      results,
      summary: {
        total: topics.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get video ideas based on trending topics
router.post('/generate-ideas', async (req, res) => {
  try {
    const { niche, count = 10, trending = true } = req.body;

    const prompt = `Generate ${count} viral YouTube video ideas for the ${niche} niche.

Requirements:
- High click-through rate potential
- Trending topics and keywords
- Audience engagement hooks
- SEO-optimized titles
- Brief description for each idea

Format each idea as:
Title: [Catchy Title]
Description: [Brief description]
Target: [Target audience]
Hook: [Opening hook]
Keywords: [SEO keywords]

Focus on content that performs well on YouTube and drives views.`;

    const response = await axios.post('http://localhost:3000/api/ai/generate-content', {
      platform: 'youtube',
      type: 'video-ideas',
      prompt,
      parameters: {
        maxTokens: 1500,
        temperature: 0.9
      }
    });

    res.json({
      success: true,
      ideas: response.data.content,
      niche,
      count,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;