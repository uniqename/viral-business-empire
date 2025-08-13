const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const MarkdownIt = require('markdown-it');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const { createCanvas, loadImage } = require('canvas');

ffmpeg.setFfmpegPath(ffmpegStatic);

class CourseGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '../../output');
    this.templatesDir = path.join(__dirname, '../templates');
    this.md = new MarkdownIt();
  }

  async generateCourseOutline(topic, level = 'beginner', duration = '4-6 hours') {
    try {
      const response = await axios.post('http://localhost:3000/api/ai/generate-content', {
        platform: 'online-course',
        type: 'course-outline',
        prompt: `Create a comprehensive course outline for "${topic}" at ${level} level, approximately ${duration} in total duration.

Requirements:
- Learning objectives for the entire course
- 8-12 modules/chapters
- 3-5 lessons per module
- Practical exercises and assignments
- Assessment methods
- Required resources and prerequisites
- Course progression structure

Format as:
# Course Title: [Title]
## Learning Objectives
## Prerequisites
## Course Structure
### Module 1: [Title]
#### Lessons:
- Lesson 1.1: [Title] (Duration)
- Lesson 1.2: [Title] (Duration)
#### Exercise: [Description]
### Module 2: [Title]
...

Include estimated time for each lesson and practical components.`,
        parameters: {
          maxTokens: 2000,
          temperature: 0.7
        }
      });

      return {
        success: true,
        outline: response.data.content,
        topic,
        level,
        duration,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Course outline generation error:', error);
      return { success: false, error: error.message };
    }
  }

  async generateLessonContent(lessonTitle, moduleContext, courseLevel = 'beginner') {
    try {
      const response = await axios.post('http://localhost:3000/api/ai/generate-content', {
        platform: 'online-course',
        type: 'lesson-content',
        prompt: `Create detailed lesson content for "${lessonTitle}" at ${courseLevel} level.

Context: This lesson is part of a module about "${moduleContext}".

Include:
1. Lesson introduction and objectives
2. Main content with clear explanations
3. Practical examples and code snippets (if applicable)
4. Visual descriptions for slides/diagrams
5. Hands-on exercises
6. Key takeaways summary
7. Additional resources for further learning

Format in markdown with clear headings and structure. Make it engaging and educational.`,
        parameters: {
          maxTokens: 1500,
          temperature: 0.8
        }
      });

      return {
        success: true,
        content: response.data.content,
        lessonTitle,
        moduleContext,
        wordCount: response.data.content.split(' ').length,
        estimatedReadingTime: Math.ceil(response.data.content.split(' ').length / 200) // 200 words per minute
      };
    } catch (error) {
      console.error('Lesson content generation error:', error);
      return { success: false, error: error.message };
    }
  }

  async createLessonVideo(lessonContent, voiceId = 'default', includeSlides = true) {
    try {
      // Generate script for video
      const scriptResponse = await axios.post('http://localhost:3000/api/ai/generate-content', {
        platform: 'online-course',
        type: 'video-script',
        prompt: `Convert this lesson content into an engaging video script:

${lessonContent}

Requirements:
- Natural, conversational tone
- Clear explanations suitable for video
- Indicate when to show slides or visuals
- Include pauses and emphasis
- 8-12 minutes duration
- Engaging introduction and conclusion`,
        parameters: {
          maxTokens: 1000,
          temperature: 0.7
        }
      });

      if (!scriptResponse.data.success) {
        throw new Error('Failed to generate video script');
      }

      const script = scriptResponse.data.content;

      // Generate voiceover
      const voiceResponse = await axios.post('http://localhost:3000/api/ai/generate-voice', {
        text: script,
        voiceId,
        stability: 0.6,
        similarityBoost: 0.8
      });

      if (!voiceResponse.data.success) {
        throw new Error('Failed to generate voiceover');
      }

      // Save audio
      const audioFileName = `lesson_audio_${uuidv4()}.mp3`;
      const audioPath = path.join(this.outputDir, 'audio', audioFileName);
      await fs.mkdir(path.dirname(audioPath), { recursive: true });
      
      const audioBuffer = Buffer.from(voiceResponse.data.audioData, 'base64');
      await fs.writeFile(audioPath, audioBuffer);

      // Generate slides if requested
      let slides = [];
      if (includeSlides) {
        slides = await this.generateLessonSlides(lessonContent);
      }

      // Create video
      const videoResult = await this.combineAudioAndSlides(audioPath, slides);

      return {
        success: true,
        video: videoResult,
        script,
        slides: slides.length,
        audioPath,
        duration: this.estimateAudioDuration(script)
      };
    } catch (error) {
      console.error('Lesson video creation error:', error);
      return { success: false, error: error.message };
    }
  }

  async generateLessonSlides(content) {
    const slides = [];
    const sections = content.split('\n## '); // Split by main headings

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (section.trim().length === 0) continue;

      const canvas = createCanvas(1920, 1080);
      const ctx = canvas.getContext('2d');

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1920, 1080);

      // Title
      const title = section.split('\n')[0].replace(/^#+ /, '');
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 64px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      const titleLines = this.wrapText(ctx, title, 1600);
      titleLines.forEach((line, index) => {
        ctx.fillText(line, 960, 200 + index * 80);
      });

      // Content points
      const contentLines = section.split('\n').slice(1).filter(line => line.trim());
      ctx.font = '36px Arial';
      ctx.textAlign = 'left';
      
      let y = 400;
      for (const line of contentLines.slice(0, 6)) { // Max 6 points per slide
        if (line.trim() && y < 1000) {
          const cleanLine = line.replace(/^[•\-\*] /, '• ');
          const wrappedLines = this.wrapText(ctx, cleanLine, 1600);
          
          wrappedLines.forEach(wrappedLine => {
            ctx.fillText(wrappedLine, 160, y);
            y += 50;
          });
          y += 20;
        }
      }

      // Save slide
      const slideFileName = `slide_${i + 1}_${uuidv4()}.png`;
      const slidePath = path.join(this.outputDir, 'slides', slideFileName);
      
      await fs.mkdir(path.dirname(slidePath), { recursive: true });
      const buffer = canvas.toBuffer('image/png');
      await fs.writeFile(slidePath, buffer);

      slides.push({
        path: slidePath,
        fileName: slideFileName,
        title,
        duration: 8 // 8 seconds per slide
      });
    }

    return slides;
  }

  async combineAudioAndSlides(audioPath, slides) {
    return new Promise((resolve, reject) => {
      const videoFileName = `lesson_video_${uuidv4()}.mp4`;
      const videoPath = path.join(this.outputDir, 'videos', videoFileName);

      if (slides.length === 0) {
        // Audio-only video with simple background
        ffmpeg()
          .input(audioPath)
          .inputOptions('-loop 1')
          .input(path.join(this.templatesDir, 'audio_background.jpg')) // You'd need a default background
          .outputOptions([
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-shortest',
            '-pix_fmt', 'yuv420p'
          ])
          .output(videoPath)
          .on('end', () => resolve({ path: videoPath, fileName: videoFileName }))
          .on('error', reject)
          .run();
      } else {
        // Combine slides with audio
        const slidePaths = slides.map(slide => slide.path);
        const totalSlideDuration = slides.reduce((sum, slide) => sum + slide.duration, 0);

        let command = ffmpeg();
        slidePaths.forEach(slidePath => {
          command = command.input(slidePath);
        });
        command = command.input(audioPath);

        // Create filter complex for slide transitions
        const filterComplex = this.buildSlideFilterComplex(slides);

        command
          .complexFilter(filterComplex)
          .outputOptions([
            '-map', '[final]',
            '-map', `${slidePaths.length}:a`,
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-pix_fmt', 'yuv420p'
          ])
          .output(videoPath)
          .on('end', () => resolve({ path: videoPath, fileName: videoFileName }))
          .on('error', reject)
          .run();
      }
    });
  }

  buildSlideFilterComplex(slides) {
    let filter = '';
    
    // Scale each slide
    for (let i = 0; i < slides.length; i++) {
      filter += `[${i}:v]scale=1920:1080,setpts=PTS-STARTPTS+${i * slides[i].duration}/TB[slide${i}];`;
    }

    // Concatenate all slides
    filter += slides.map((_, i) => `[slide${i}]`).join('') + `concat=n=${slides.length}:v=1:a=0[final]`;

    return filter;
  }

  async generateQuiz(lessonContent, questionCount = 5) {
    try {
      const response = await axios.post('http://localhost:3000/api/ai/generate-content', {
        platform: 'online-course',
        type: 'quiz',
        prompt: `Create a ${questionCount}-question quiz based on this lesson content:

${lessonContent}

Requirements:
- Mix of multiple choice and true/false questions
- Test key concepts and understanding
- Include correct answers and explanations
- Appropriate difficulty for the content level

Format as JSON:
{
  "questions": [
    {
      "type": "multiple_choice",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "Why this is correct"
    }
  ]
}`,
        parameters: {
          maxTokens: 1000,
          temperature: 0.6
        }
      });

      return {
        success: true,
        quiz: JSON.parse(response.data.content),
        questionCount,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Quiz generation error:', error);
      return { success: false, error: error.message };
    }
  }

  async generateCertificate(studentName, courseName, completionDate, instructorName) {
    try {
      const canvas = createCanvas(1200, 800);
      const ctx = canvas.getContext('2d');

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 1200, 800);
      gradient.addColorStop(0, '#f7f7f7');
      gradient.addColorStop(1, '#e8e8e8');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 800);

      // Border
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 8;
      ctx.strokeRect(40, 40, 1120, 720);

      // Title
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Certificate of Completion', 600, 150);

      // Course name
      ctx.font = 'bold 36px Arial';
      ctx.fillText(courseName, 600, 250);

      // Student name
      ctx.font = 'italic 28px Arial';
      ctx.fillText('This is to certify that', 600, 320);
      
      ctx.font = 'bold 42px Arial';
      ctx.fillStyle = '#4a5568';
      ctx.fillText(studentName, 600, 380);

      // Completion text
      ctx.font = '24px Arial';
      ctx.fillStyle = '#333333';
      ctx.fillText('has successfully completed the course on', 600, 440);
      ctx.fillText(completionDate, 600, 500);

      // Instructor signature
      ctx.font = 'italic 20px Arial';
      ctx.fillText(`Instructor: ${instructorName}`, 600, 580);

      // Save certificate
      const certFileName = `certificate_${uuidv4()}.png`;
      const certPath = path.join(this.outputDir, 'certificates', certFileName);
      
      await fs.mkdir(path.dirname(certPath), { recursive: true });
      const buffer = canvas.toBuffer('image/png');
      await fs.writeFile(certPath, buffer);

      return {
        success: true,
        certificatePath: certPath,
        fileName: certFileName
      };
    } catch (error) {
      console.error('Certificate generation error:', error);
      return { success: false, error: error.message };
    }
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

  estimateAudioDuration(text, wordsPerMinute = 150) {
    const wordCount = text.split(' ').length;
    return (wordCount / wordsPerMinute) * 60; // seconds
  }
}

module.exports = CourseGenerator;