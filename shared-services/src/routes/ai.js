const express = require('express');
const OpenAI = require('openai');
const axios = require('axios');
const router = express.Router();

// Initialize AI services
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Content generation for all platforms
router.post('/generate-content', async (req, res) => {
  try {
    const { platform, type, prompt, parameters } = req.body;
    
    let systemPrompt = '';
    
    switch (platform) {
      case 'mobile-app':
        systemPrompt = 'You are an expert mobile app content creator. Generate engaging, user-friendly content for mobile applications.';
        break;
      case 'youtube':
        systemPrompt = 'You are a viral YouTube content creator. Generate scripts that are engaging, informative, and optimized for audience retention.';
        break;
      case 'print-on-demand':
        systemPrompt = 'You are a creative designer. Generate product descriptions, design concepts, and marketing copy for print-on-demand products.';
        break;
      case 'online-course':
        systemPrompt = 'You are an expert educator and course creator. Generate structured, educational content that helps students learn effectively.';
        break;
      default:
        systemPrompt = 'You are a helpful AI assistant for content creation.';
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: parameters?.maxTokens || 1000,
      temperature: parameters?.temperature || 0.7
    });

    res.json({
      success: true,
      platform,
      type,
      content: response.choices[0].message.content,
      usage: response.usage
    });

  } catch (error) {
    console.error('AI Content Generation Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate content'
    });
  }
});

// Image generation using DALL-E
router.post('/generate-image', async (req, res) => {
  try {
    const { prompt, size = '1024x1024', quality = 'standard' } = req.body;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size,
      quality
    });

    res.json({
      success: true,
      imageUrl: response.data[0].url,
      prompt
    });

  } catch (error) {
    console.error('Image Generation Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate image'
    });
  }
});

// Voice generation using ElevenLabs (mock implementation)
router.post('/generate-voice', async (req, res) => {
  try {
    const { text, voiceId, stability = 0.5, similarityBoost = 0.5 } = req.body;

    // This would integrate with ElevenLabs API
    const elevenLabsResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability,
          similarity_boost: similarityBoost
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        responseType: 'arraybuffer'
      }
    );

    // Return audio data (in production, save to cloud storage first)
    res.json({
      success: true,
      audioData: Buffer.from(elevenLabsResponse.data).toString('base64'),
      text,
      voiceId
    });

  } catch (error) {
    console.error('Voice Generation Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate voice'
    });
  }
});

// AI-powered design suggestions
router.post('/suggest-designs', async (req, res) => {
  try {
    const { category, style, colors, keywords } = req.body;

    const designPrompt = `Create design suggestions for ${category} products in ${style} style using colors ${colors.join(', ')}. Keywords: ${keywords.join(', ')}. Provide specific design concepts, layouts, and visual elements.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert graphic designer specializing in print-on-demand products. Provide detailed, actionable design suggestions.' 
        },
        { role: 'user', content: designPrompt }
      ],
      max_tokens: 800,
      temperature: 0.8
    });

    res.json({
      success: true,
      category,
      suggestions: response.choices[0].message.content,
      parameters: { style, colors, keywords }
    });

  } catch (error) {
    console.error('Design Suggestion Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate design suggestions'
    });
  }
});

module.exports = router;