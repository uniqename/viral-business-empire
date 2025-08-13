const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

ffmpeg.setFfmpegPath(ffmpegStatic);

class VideoGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '../../output');
    this.templatesDir = path.join(__dirname, '../templates');
    this.assetsDir = path.join(__dirname, '../assets');
  }

  async generateScript(topic, duration = '8-10 minutes', style = 'educational') {
    try {
      const response = await axios.post('http://localhost:3000/api/ai/generate-content', {
        platform: 'youtube',
        type: 'script',
        prompt: `Create a ${duration} YouTube script about "${topic}" in ${style} style.

Requirements:
- Hook viewers in first 15 seconds
- Include engagement prompts (like, subscribe, comment)
- Add timestamp markers for editing
- Include visual cues and B-roll suggestions
- End with strong call-to-action
- Optimize for audience retention

Structure:
1. Hook (0-15s)
2. Introduction (15-30s)
3. Main content (body)
4. Conclusion & CTA (last 30s)`,
        parameters: {
          maxTokens: 2000,
          temperature: 0.8
        }
      });

      return {
        success: true,
        script: response.data.content,
        topic,
        duration,
        style
      };
    } catch (error) {
      console.error('Script generation error:', error);
      return { success: false, error: error.message };
    }
  }

  async generateVoiceover(script, voiceId = 'default', speed = 1.0) {
    try {
      // Call ElevenLabs API through shared services
      const response = await axios.post('http://localhost:3000/api/ai/generate-voice', {
        text: script,
        voiceId,
        stability: 0.5,
        similarityBoost: 0.7
      });

      if (response.data.success) {
        const audioFileName = `voiceover_${uuidv4()}.mp3`;
        const audioPath = path.join(this.outputDir, 'audio', audioFileName);
        
        // Save audio file
        const audioBuffer = Buffer.from(response.data.audioData, 'base64');
        await fs.writeFile(audioPath, audioBuffer);

        return {
          success: true,
          audioPath,
          fileName: audioFileName,
          duration: this.estimateAudioDuration(script, speed)
        };
      }
    } catch (error) {
      console.error('Voiceover generation error:', error);
      return { success: false, error: error.message };
    }
  }

  async generateThumbnail(title, style = 'modern', colors = ['#FF6B6B', '#4ECDC4']) {
    try {
      const canvas = createCanvas(1280, 720);
      const ctx = canvas.getContext('2d');

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 1280, 720);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1280, 720);

      // Add overlay pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * 1280,
          Math.random() * 720,
          Math.random() * 20 + 5,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }

      // Title text
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Text with stroke
      const lines = this.wrapText(ctx, title, 1200);
      const lineHeight = 80;
      const startY = 360 - (lines.length - 1) * lineHeight / 2;

      lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        ctx.strokeText(line, 640, y);
        ctx.fillText(line, 640, y);
      });

      // Add "NEW" badge
      ctx.fillStyle = '#FF4757';
      ctx.fillRect(50, 50, 120, 60);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('NEW', 110, 85);

      // Save thumbnail
      const thumbnailFileName = `thumbnail_${uuidv4()}.png`;
      const thumbnailPath = path.join(this.outputDir, 'thumbnails', thumbnailFileName);
      
      const buffer = canvas.toBuffer('image/png');
      await fs.writeFile(thumbnailPath, buffer);

      return {
        success: true,
        thumbnailPath,
        fileName: thumbnailFileName
      };
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      return { success: false, error: error.message };
    }
  }

  async createVideo(options) {
    const {
      script,
      audioPath,
      images = [],
      duration = 600, // 10 minutes default
      title,
      description
    } = options;

    try {
      const videoFileName = `video_${uuidv4()}.mp4`;
      const videoPath = path.join(this.outputDir, 'videos', videoFileName);

      // Generate visual slides from script
      const slides = await this.generateSlides(script, images);
      
      // Create video with FFmpeg
      await this.combineMediaToVideo({
        slides,
        audioPath,
        outputPath: videoPath,
        duration
      });

      // Generate thumbnail
      const thumbnail = await this.generateThumbnail(title);

      return {
        success: true,
        videoPath,
        thumbnailPath: thumbnail.thumbnailPath,
        fileName: videoFileName,
        metadata: {
          title,
          description,
          duration,
          slides: slides.length
        }
      };
    } catch (error) {
      console.error('Video creation error:', error);
      return { success: false, error: error.message };
    }
  }

  async generateSlides(script, stockImages = []) {
    const slides = [];
    const scriptSections = script.split('\n\n');

    for (let i = 0; i < scriptSections.length; i++) {
      const section = scriptSections[i];
      if (section.trim().length === 0) continue;

      const canvas = createCanvas(1920, 1080);
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, 1920, 1080);

      // Text overlay
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const lines = this.wrapText(ctx, section, 1600);
      const lineHeight = 60;
      const startY = 540 - (lines.length - 1) * lineHeight / 2;

      lines.forEach((line, index) => {
        ctx.fillText(line, 960, startY + index * lineHeight);
      });

      // Save slide
      const slideFileName = `slide_${i}_${uuidv4()}.png`;
      const slidePath = path.join(this.outputDir, 'slides', slideFileName);
      
      await fs.mkdir(path.dirname(slidePath), { recursive: true });
      const buffer = canvas.toBuffer('image/png');
      await fs.writeFile(slidePath, buffer);

      slides.push({
        path: slidePath,
        duration: 5, // 5 seconds per slide
        text: section
      });
    }

    return slides;
  }

  async combineMediaToVideo({ slides, audioPath, outputPath, duration }) {
    return new Promise((resolve, reject) => {
      const slidePaths = slides.map(slide => slide.path);
      
      let command = ffmpeg();

      // Add slides as input
      slidePaths.forEach(slidePath => {
        command = command.input(slidePath);
      });

      // Add audio
      if (audioPath) {
        command = command.input(audioPath);
      }

      // Create video filter
      const filterComplex = this.buildFilterComplex(slides, duration);

      command
        .complexFilter(filterComplex)
        .outputOptions([
          '-map', '[final]',
          audioPath ? '-map', `${slidePaths.length}:a` : '',
          '-c:v', 'libx264',
          '-c:a', 'aac',
          '-r', '30',
          '-pix_fmt', 'yuv420p'
        ].filter(Boolean))
        .output(outputPath)
        .on('end', () => {
          console.log('Video creation completed');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .run();
    });
  }

  buildFilterComplex(slides, totalDuration) {
    const slideCount = slides.length;
    const slideDuration = totalDuration / slideCount;

    let filter = '';
    
    // Scale and fade each slide
    for (let i = 0; i < slideCount; i++) {
      filter += `[${i}:v]scale=1920:1080,fade=t=in:st=0:d=0.5,fade=t=out:st=${slideDuration-0.5}:d=0.5[slide${i}];`;
    }

    // Concatenate all slides
    filter += slides.map((_, i) => `[slide${i}]`).join('') + `concat=n=${slideCount}:v=1:a=0[final]`;

    return filter;
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  estimateAudioDuration(text, speed = 1.0) {
    // Rough estimate: 150 words per minute
    const wordsPerMinute = 150 * speed;
    const wordCount = text.split(' ').length;
    return (wordCount / wordsPerMinute) * 60; // seconds
  }
}

module.exports = VideoGenerator;