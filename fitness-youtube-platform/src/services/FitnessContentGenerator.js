const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const { createCanvas, loadImage } = require('canvas');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const ViralContentEngine = require('../../../shared-services/src/services/ViralContentEngine');

ffmpeg.setFfmpegPath(ffmpegStatic);

class FitnessContentGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '../../output');
    this.templatesDir = path.join(__dirname, '../templates');
    this.viralEngine = new ViralContentEngine();
    this.contentTypes = [
      'workout-routines',
      'exercise-tutorials', 
      'nutrition-tips',
      'motivation-content',
      'equipment-reviews',
      'fitness-challenges'
    ];
    
    this.fitnessNiches = {
      'weight-loss': {
        keywords: ['fat burning', 'cardio', 'HIIT', 'calorie deficit', 'metabolism'],
        exercises: ['burpees', 'mountain climbers', 'jumping jacks', 'high knees', 'squat jumps'],
        difficulty: ['beginner', 'intermediate', 'advanced']
      },
      'muscle-building': {
        keywords: ['strength training', 'hypertrophy', 'progressive overload', 'compound movements'],
        exercises: ['push-ups', 'squats', 'deadlifts', 'pull-ups', 'bench press'],
        difficulty: ['beginner', 'intermediate', 'advanced', 'expert']
      },
      'home-workouts': {
        keywords: ['no equipment', 'bodyweight', 'home fitness', 'quarantine workout'],
        exercises: ['push-ups', 'squats', 'lunges', 'planks', 'wall sits'],
        difficulty: ['beginner', 'intermediate']
      },
      'yoga-flexibility': {
        keywords: ['flexibility', 'mobility', 'stretching', 'mindfulness', 'relaxation'],
        exercises: ['downward dog', 'warrior pose', 'child pose', 'cat-cow', 'pigeon pose'],
        difficulty: ['beginner', 'intermediate', 'advanced']
      },
      'hiit-training': {
        keywords: ['high intensity', 'interval training', 'quick workout', 'time efficient'],
        exercises: ['burpees', 'squat jumps', 'mountain climbers', 'plank jacks', 'jumping lunges'],
        difficulty: ['intermediate', 'advanced', 'expert']
      }
    };

    this.analytics = {
      videosGenerated: 0,
      totalViews: 0,
      subscribers: 0,
      revenue: 0,
      topPerformers: []
    };
  }

  async generateFitnessVideo(options) {
    const {
      niche = 'weight-loss',
      duration = '10-15 minutes',
      difficulty = 'intermediate',
      focus = 'full-body'
    } = options;

    try {
      console.log(`🏋️ Generating ${niche} fitness video...`);

      // Step 1: Generate workout plan
      const workoutPlan = await this.generateWorkoutPlan(niche, difficulty, focus, duration);
      
      // Step 2: Create script
      const script = await this.generateVideoScript(workoutPlan, niche);
      
      // Step 3: Generate voiceover
      const voiceover = await this.generateVoiceover(script);
      
      // Step 4: Create visual content
      const visuals = await this.createWorkoutVisuals(workoutPlan);
      
      // Step 5: Generate thumbnail
      const thumbnail = await this.generateFitnessThumbnail(workoutPlan);
      
      // Step 6: Compile video
      const video = await this.compileVideo(script, voiceover, visuals, workoutPlan);

      // Update analytics
      this.analytics.videosGenerated++;

      return {
        success: true,
        video,
        thumbnail,
        workoutPlan,
        script,
        metadata: {
          niche,
          difficulty,
          focus,
          duration: this.estimateVideoDuration(script),
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Fitness video generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateWorkoutPlan(niche, difficulty, focus, duration) {
    try {
      const nicheData = this.fitnessNiches[niche] || this.fitnessNiches['weight-loss'];
      
      const response = await axios.post('http://localhost:3000/api/ai/generate-content', {
        platform: 'fitness-youtube',
        type: 'workout-plan',
        prompt: `Create a comprehensive ${duration} ${niche} workout plan for ${difficulty} level focusing on ${focus}.

Requirements:
- Target audience: People looking for ${niche} results
- Equipment: Minimal to no equipment (home-friendly)
- Difficulty: ${difficulty} level
- Focus: ${focus}
- Duration: ${duration}

Include:

1. Workout Overview
   - Goals and benefits
   - Target muscle groups
   - Calorie burn estimate

2. Warm-up (2-3 minutes)
   - Dynamic stretching exercises
   - Joint mobility movements

3. Main Workout (${duration.split(' ')[0]} minutes)
   - 6-8 exercises with proper form cues
   - Sets, reps, or time intervals
   - Rest periods between exercises
   - Modifications for different fitness levels

4. Cool-down (2-3 minutes)
   - Static stretching
   - Breathing exercises

5. Form Tips & Safety
   - Common mistakes to avoid
   - Proper breathing techniques
   - When to rest or modify

6. Progression Tips
   - How to make it harder/easier
   - Weekly progression plan

Make it engaging, safe, and results-oriented. Include motivational cues and encouragement.`,
        parameters: {
          maxTokens: 1500,
          temperature: 0.7
        }
      });

      const workoutText = response.data.content;

      return {
        title: await this.generateWorkoutTitle(niche, difficulty, focus),
        niche,
        difficulty,
        focus,
        duration,
        plan: workoutText,
        exercises: this.extractExercises(workoutText),
        estimatedCalories: this.estimateCalorieBurn(niche, difficulty, duration),
        targetMuscles: this.getTargetMuscles(focus),
        equipment: 'Bodyweight/Minimal Equipment',
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Workout plan generation error:', error);
      return {
        title: `${focus} ${niche} Workout`,
        niche,
        difficulty,
        focus,
        plan: 'Basic workout structure with warm-up, main exercises, and cool-down',
        exercises: ['Push-ups', 'Squats', 'Planks', 'Lunges'],
        estimatedCalories: 200,
        targetMuscles: [focus],
        equipment: 'Bodyweight'
      };
    }
  }

  async generateVideoScript(workoutPlan, niche) {
    try {
      const response = await axios.post('http://localhost:3000/api/ai/generate-content', {
        platform: 'fitness-youtube',
        type: 'video-script',
        prompt: `Create an engaging YouTube video script for: "${workoutPlan.title}"

Workout Details:
${workoutPlan.plan}

Script Requirements:
- Hook viewers in the first 15 seconds
- Energetic and motivational tone
- Clear exercise instructions with form cues
- Encourage viewers throughout
- Include like/subscribe prompts naturally
- End with strong call-to-action

Structure:
1. Hook & Introduction (0-30s)
   - Grab attention with benefits
   - Introduce yourself as fitness coach
   - Preview what's coming

2. Warm-up Section (30s-3m)
   - Explain importance of warming up
   - Guide through each movement
   - Motivational encouragement

3. Main Workout (3m-${workoutPlan.duration})
   - Clear exercise instructions
   - Form cues and safety tips
   - Count down timers/reps
   - Modification options
   - Keep energy high

4. Cool-down (Last 3 minutes)
   - Importance of stretching
   - Breathing exercises
   - Congratulate viewers

5. Outro (Final 30s)
   - Recap benefits achieved
   - Ask for likes and subscriptions
   - Preview next video
   - Motivational closing

Make it conversational, encouraging, and professionally instructional. Include specific timestamps for editing.`,
        parameters: {
          maxTokens: 1800,
          temperature: 0.8
        }
      });

      return {
        fullScript: response.data.content,
        sections: this.parseScriptSections(response.data.content),
        estimatedDuration: this.estimateVideoDuration(response.data.content),
        wordCount: response.data.content.split(' ').length
      };

    } catch (error) {
      console.error('Script generation error:', error);
      return {
        fullScript: `Welcome to your ${workoutPlan.title} workout! Let's get started with this amazing routine that will help you achieve your fitness goals.`,
        sections: ['Introduction', 'Warm-up', 'Main Workout', 'Cool-down', 'Outro'],
        estimatedDuration: 600,
        wordCount: 100
      };
    }
  }

  async generateVoiceover(script) {
    try {
      const response = await axios.post('http://localhost:3000/api/ai/generate-voice', {
        text: script.fullScript,
        voiceId: 'fitness-coach', // Energetic, motivational voice
        stability: 0.7,
        similarityBoost: 0.8,
        style: 'enthusiastic'
      });

      if (response.data.success) {
        const audioFileName = `fitness_voiceover_${uuidv4()}.mp3`;
        const audioPath = path.join(this.outputDir, 'audio', audioFileName);
        
        await fs.mkdir(path.dirname(audioPath), { recursive: true });
        const audioBuffer = Buffer.from(response.data.audioData, 'base64');
        await fs.writeFile(audioPath, audioBuffer);

        return {
          path: audioPath,
          fileName: audioFileName,
          duration: this.estimateAudioDuration(script.fullScript, 1.1), // Slightly faster pace
          success: true
        };
      }
    } catch (error) {
      console.error('Voiceover generation error:', error);
      return {
        path: null,
        success: false,
        error: error.message
      };
    }
  }

  async createWorkoutVisuals(workoutPlan) {
    const visuals = [];

    try {
      // Create intro slide
      visuals.push(await this.createIntroSlide(workoutPlan));
      
      // Create exercise demonstration slides
      for (const exercise of workoutPlan.exercises.slice(0, 8)) {
        visuals.push(await this.createExerciseSlide(exercise, workoutPlan.niche));
      }
      
      // Create motivational slides
      visuals.push(await this.createMotivationalSlide(workoutPlan));
      
      // Create outro slide
      visuals.push(await this.createOutroSlide(workoutPlan));

      return visuals;

    } catch (error) {
      console.error('Visual creation error:', error);
      return [];
    }
  }

  async createIntroSlide(workoutPlan) {
    const canvas = createCanvas(1920, 1080);
    const ctx = canvas.getContext('2d');

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(1, '#4ecdc4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1920, 1080);

    // Add fitness-themed pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 1920;
      const y = Math.random() * 1080;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 20 + 5, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    
    const title = workoutPlan.title.toUpperCase();
    ctx.strokeText(title, 960, 400);
    ctx.fillText(title, 960, 400);

    // Subtitle
    ctx.font = '36px Arial';
    ctx.fillText(`${workoutPlan.difficulty.toUpperCase()} • ${workoutPlan.duration}`, 960, 500);
    
    // Calorie info
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#ffed4e';
    ctx.fillText(`🔥 BURN ${workoutPlan.estimatedCalories} CALORIES`, 960, 600);

    const slideFileName = `intro_${uuidv4()}.png`;
    const slidePath = path.join(this.outputDir, 'slides', slideFileName);
    
    await fs.mkdir(path.dirname(slidePath), { recursive: true });
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(slidePath, buffer);

    return {
      type: 'intro',
      path: slidePath,
      duration: 5,
      fileName: slideFileName
    };
  }

  async createExerciseSlide(exercise, niche) {
    const canvas = createCanvas(1920, 1080);
    const ctx = canvas.getContext('2d');

    // Background
    const colors = this.getNicheColors(niche);
    const gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(1, colors.secondary);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1920, 1080);

    // Exercise name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    
    const exerciseName = exercise.toUpperCase();
    ctx.strokeText(exerciseName, 960, 300);
    ctx.fillText(exerciseName, 960, 300);

    // Form cues
    ctx.font = '32px Arial';
    const formCues = this.getFormCues(exercise);
    let y = 400;
    formCues.forEach(cue => {
      ctx.fillText(`• ${cue}`, 960, y);
      y += 50;
    });

    // Timer/Rep indicator
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#ffed4e';
    ctx.fillText('💪 YOU GOT THIS!', 960, 800);

    const slideFileName = `exercise_${exercise.replace(/\s+/g, '_').toLowerCase()}_${uuidv4()}.png`;
    const slidePath = path.join(this.outputDir, 'slides', slideFileName);
    
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(slidePath, buffer);

    return {
      type: 'exercise',
      exercise,
      path: slidePath,
      duration: 8,
      fileName: slideFileName
    };
  }

  async createMotivationalSlide(workoutPlan) {
    const canvas = createCanvas(1920, 1080);
    const ctx = canvas.getContext('2d');

    // Energetic background
    const gradient = ctx.createRadialGradient(960, 540, 0, 960, 540, 800);
    gradient.addColorStop(0, '#ff9500');
    gradient.addColorStop(1, '#ff5722');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1920, 1080);

    // Motivational message
    const messages = [
      'PUSH THROUGH THE BURN!',
      'YOU\'RE STRONGER THAN YOU THINK!',
      'EVERY REP COUNTS!',
      'DON\'T QUIT WHEN IT HURTS!',
      'FEEL THE POWER WITHIN!'
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    
    ctx.strokeText(message, 960, 540);
    ctx.fillText(message, 960, 540);

    const slideFileName = `motivation_${uuidv4()}.png`;
    const slidePath = path.join(this.outputDir, 'slides', slideFileName);
    
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(slidePath, buffer);

    return {
      type: 'motivation',
      path: slidePath,
      duration: 3,
      fileName: slideFileName
    };
  }

  async createOutroSlide(workoutPlan) {
    const canvas = createCanvas(1920, 1080);
    const ctx = canvas.getContext('2d');

    // Celebration background
    const gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
    gradient.addColorStop(0, '#4caf50');
    gradient.addColorStop(1, '#8bc34a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1920, 1080);

    // Celebration elements
    ctx.fillStyle = '#ffeb3b';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 1920;
      const y = Math.random() * 1080;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let j = 0; j < 5; j++) {
        const angle = (j * 4 * Math.PI) / 5;
        const sx = x + Math.cos(angle) * 15;
        const sy = y + Math.sin(angle) * 15;
        ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fill();
    }

    // Completion message
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    
    ctx.strokeText('WORKOUT COMPLETE!', 960, 400);
    ctx.fillText('WORKOUT COMPLETE!', 960, 400);

    ctx.font = '36px Arial';
    ctx.fillText(`🎉 Amazing job completing this ${workoutPlan.difficulty} workout!`, 960, 500);
    
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#ffeb3b';
    ctx.fillText('👍 LIKE • 🔔 SUBSCRIBE • 💬 COMMENT', 960, 650);

    const slideFileName = `outro_${uuidv4()}.png`;
    const slidePath = path.join(this.outputDir, 'slides', slideFileName);
    
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(slidePath, buffer);

    return {
      type: 'outro',
      path: slidePath,
      duration: 8,
      fileName: slideFileName
    };
  }

  async generateFitnessThumbnail(workoutPlan) {
    const canvas = createCanvas(1280, 720);
    const ctx = canvas.getContext('2d');

    // Eye-catching background
    const colors = this.getNicheColors(workoutPlan.niche);
    const gradient = ctx.createLinearGradient(0, 0, 1280, 720);
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(1, colors.secondary);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1280, 720);

    // Add dynamic elements
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 1280;
      const y = Math.random() * 720;
      const size = Math.random() * 40 + 20;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Title text
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    
    const title = workoutPlan.title.toUpperCase();
    const words = title.split(' ');
    const line1 = words.slice(0, Math.ceil(words.length/2)).join(' ');
    const line2 = words.slice(Math.ceil(words.length/2)).join(' ');
    
    ctx.strokeText(line1, 640, 250);
    ctx.fillText(line1, 640, 250);
    
    if (line2) {
      ctx.strokeText(line2, 640, 320);
      ctx.fillText(line2, 640, 320);
    }

    // Duration badge
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(50, 50, 200, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(workoutPlan.duration, 150, 100);

    // Difficulty badge  
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(1030, 50, 200, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(workoutPlan.difficulty.toUpperCase(), 1130, 100);

    // Calorie burn
    ctx.fillStyle = '#ffeb3b';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(`🔥 ${workoutPlan.estimatedCalories} CALS`, 640, 550);
    ctx.fillText(`🔥 ${workoutPlan.estimatedCalories} CALS`, 640, 550);

    const thumbnailFileName = `thumbnail_${uuidv4()}.png`;
    const thumbnailPath = path.join(this.outputDir, 'thumbnails', thumbnailFileName);
    
    await fs.mkdir(path.dirname(thumbnailPath), { recursive: true });
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(thumbnailPath, buffer);

    return {
      path: thumbnailPath,
      fileName: thumbnailFileName,
      workoutTitle: workoutPlan.title
    };
  }

  async compileVideo(script, voiceover, visuals, workoutPlan) {
    return new Promise((resolve, reject) => {
      const videoFileName = `fitness_video_${uuidv4()}.mp4`;
      const videoPath = path.join(this.outputDir, 'videos', videoFileName);

      let command = ffmpeg();

      // Add visual slides
      visuals.forEach(visual => {
        command = command.input(visual.path);
      });

      // Add audio if available
      if (voiceover.path) {
        command = command.input(voiceover.path);
      }

      // Build filter complex for slide transitions
      const filterComplex = this.buildVideoFilter(visuals);

      command
        .complexFilter(filterComplex)
        .outputOptions([
          '-map', '[final]',
          voiceover.path ? '-map' : null,
          voiceover.path ? `${visuals.length}:a` : null,
          '-c:v', 'libx264',
          '-c:a', 'aac',
          '-r', '30',
          '-pix_fmt', 'yuv420p'
        ].filter(Boolean))
        .output(videoPath)
        .on('end', () => {
          resolve({
            path: videoPath,
            fileName: videoFileName,
            duration: this.calculateTotalDuration(visuals),
            workoutTitle: workoutPlan.title
          });
        })
        .on('error', (err) => {
          console.error('Video compilation error:', err);
          reject(err);
        })
        .run();
    });
  }

  // Helper methods
  async generateWorkoutTitle(niche, difficulty, focus) {
    const viralTitles = {
      'weight-loss': [
        'This FAT BURNING workout is going VIRAL (INSANE Results!)',
        'I did this WEIGHT LOSS routine for 30 days - You won\'t believe what happened!',
        'The BELLY FAT destroyer that fitness trainers DON\'T want you to know',
        'This 10-minute workout MELTED my fat (No gym needed!)',
        'Why everyone is OBSESSED with this fat burning routine',
        'The SECRET workout that burns fat 24/7 (Even while sleeping!)'
      ],
      'muscle-building': [
        'This MUSCLE BUILDING hack is breaking the internet (NO GYM!)',
        'I tried this HOME muscle routine - The results SHOCKED me!',
        'The MUSCLE GROWTH method that changed everything',
        'This STRENGTH workout is taking over TikTok (Here\'s why)',
        'Build INSANE muscle with this 15-minute routine',
        'The muscle building SECRET that trainers charge $200 for'
      ],
      'home-workouts': [
        'This HOME workout is more effective than the gym (Proven!)',
        'NO EQUIPMENT? No problem! This routine is ADDICTIVE',
        'I did BODYWEIGHT exercises for 60 days - INCREDIBLE transformation!',
        'This LIVING ROOM workout is going viral for a reason',
        'The HOME fitness routine that beats expensive gym memberships',
        'Why everyone quit the gym for this HOME workout'
      ],
      'yoga-flexibility': [
        'This YOGA routine fixed my back pain in 7 days (AMAZING!)',
        'The FLEXIBILITY hack that\'s trending everywhere',
        'I did YOGA for 30 days - My body COMPLETELY changed',
        'This 10-minute STRETCH routine is life-changing',
        'The YOGA secret that improves everything (Sleep, mood, energy)',
        'Why millions are doing THIS yoga routine every morning'
      ],
      'hiit-training': [
        'This HIIT workout burns 500 calories in 15 minutes (INSANE!)',
        'The HIGH INTENSITY routine that\'s taking over fitness',
        'I tried the VIRAL HIIT challenge - Here\'s what happened',
        'This 12-minute HIIT destroys belly fat (Science-backed!)',
        'The INTERVAL training secret that changes your body FAST',
        'Why everyone is obsessed with this HIIT routine'
      ]
    };

    const nicheTitle = viralTitles[niche] || viralTitles['weight-loss'];
    const baseTitle = nicheTitle[Math.floor(Math.random() * nicheTitle.length)];
    
    // Add difficulty and focus modifiers for SEO
    const modifiers = {
      'beginner': 'Perfect for beginners',
      'intermediate': 'Next level results',
      'advanced': 'Advanced technique',
      'expert': 'Pro-level intensity'
    };
    
    const focusModifiers = {
      'full-body': 'Total body transformation',
      'upper-body': 'Upper body focused', 
      'lower-body': 'Lower body sculpting',
      'core': 'Core strengthening',
      'cardio': 'Cardio intensive'
    };

    return `${baseTitle} | ${modifiers[difficulty] || ''} ${focusModifiers[focus] || ''}`.trim();
  }

  extractExercises(workoutText) {
    // Extract exercise names from workout plan
    const exercisePatterns = [
      /\d+\.\s+([^\n\r]+)/g,
      /-\s+([^\n\r]+)/g,
      /•\s+([^\n\r]+)/g
    ];

    const exercises = [];
    
    exercisePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(workoutText)) !== null) {
        const exercise = match[1].trim().split('(')[0].trim();
        if (exercise.length > 3 && exercise.length < 30) {
          exercises.push(exercise);
        }
      }
    });

    return exercises.slice(0, 8); // Limit to 8 exercises
  }

  estimateCalorieBurn(niche, difficulty, duration) {
    const baseCals = {
      'weight-loss': 12,
      'muscle-building': 8,
      'home-workouts': 10,
      'yoga-flexibility': 4,
      'hiit-training': 15
    };

    const difficultyMultiplier = {
      'beginner': 0.8,
      'intermediate': 1.0,
      'advanced': 1.2,
      'expert': 1.4
    };

    const baseCalories = baseCals[niche] || 10;
    const multiplier = difficultyMultiplier[difficulty] || 1.0;
    const minutes = parseInt(duration.split('-')[0]) || 15;

    return Math.round(baseCalories * multiplier * minutes);
  }

  getTargetMuscles(focus) {
    const muscleGroups = {
      'full-body': ['Arms', 'Legs', 'Core', 'Back', 'Chest'],
      'upper-body': ['Arms', 'Chest', 'Back', 'Shoulders'],
      'lower-body': ['Legs', 'Glutes', 'Calves'],
      'core': ['Abs', 'Obliques', 'Lower Back'],
      'arms': ['Biceps', 'Triceps', 'Shoulders'],
      'legs': ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves']
    };

    return muscleGroups[focus] || muscleGroups['full-body'];
  }

  parseScriptSections(scriptText) {
    const sections = [];
    const sectionHeaders = [
      'hook', 'introduction', 'warm-up', 'main workout', 
      'cool-down', 'outro', 'call-to-action'
    ];

    sectionHeaders.forEach(header => {
      if (scriptText.toLowerCase().includes(header)) {
        sections.push(header);
      }
    });

    return sections.length > 0 ? sections : ['Introduction', 'Main Content', 'Outro'];
  }

  estimateVideoDuration(script) {
    const words = script.split(' ').length;
    const wordsPerMinute = 160; // Slightly faster for fitness content
    return Math.ceil((words / wordsPerMinute) * 60); // seconds
  }

  estimateAudioDuration(text, speed = 1.0) {
    const words = text.split(' ').length;
    const wordsPerMinute = 150 * speed;
    return (words / wordsPerMinute) * 60; // seconds
  }

  getNicheColors(niche) {
    const colorSchemes = {
      'weight-loss': { primary: '#ff6b6b', secondary: '#ff8e53' },
      'muscle-building': { primary: '#4ecdc4', secondary: '#45b7d1' },
      'home-workouts': { primary: '#96ceb4', secondary: '#ffeaa7' },
      'yoga-flexibility': { primary: '#a29bfe', secondary: '#fd79a8' },
      'hiit-training': { primary: '#fd79a8', secondary: '#ff7675' }
    };

    return colorSchemes[niche] || colorSchemes['weight-loss'];
  }

  getFormCues(exercise) {
    const formCues = {
      'push-ups': ['Keep core tight', 'Full range of motion', 'Control the descent'],
      'squats': ['Feet shoulder-width apart', 'Knees track over toes', 'Sit back into hips'],
      'planks': ['Straight line head to heels', 'Engage core muscles', 'Breathe steadily'],
      'lunges': ['Step out far enough', 'Keep front knee over ankle', 'Lower straight down'],
      'burpees': ['Land softly', 'Full chest to floor', 'Jump up explosively']
    };

    const exerciseKey = exercise.toLowerCase();
    for (const [key, cues] of Object.entries(formCues)) {
      if (exerciseKey.includes(key)) {
        return cues;
      }
    }

    return ['Focus on form', 'Breathe steadily', 'Control the movement'];
  }

  buildVideoFilter(visuals) {
    let filter = '';
    
    // Scale and fade each visual
    visuals.forEach((visual, i) => {
      filter += `[${i}:v]scale=1920:1080,fade=t=in:st=0:d=0.5,fade=t=out:st=${visual.duration-0.5}:d=0.5[v${i}];`;
    });

    // Concatenate all visuals
    filter += visuals.map((_, i) => `[v${i}]`).join('') + `concat=n=${visuals.length}:v=1:a=0[final]`;

    return filter;
  }

  calculateTotalDuration(visuals) {
    return visuals.reduce((total, visual) => total + visual.duration, 0);
  }

  async getAnalytics() {
    return {
      ...this.analytics,
      contentTypes: this.contentTypes,
      niches: Object.keys(this.fitnessNiches),
      lastUpdate: new Date().toISOString()
    };
  }
}

module.exports = FitnessContentGenerator;