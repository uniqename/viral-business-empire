const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { createCanvas } = require('canvas');
const ViralContentEngine = require('../../../shared-services/src/services/ViralContentEngine');

class BusinessCourseGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '../../output');
    this.viralEngine = new ViralContentEngine();
    // Viral business course concepts that people actually want
    this.viralCourseConcepts = {
      'make-money-online': {
        titles: [
          'How I Made $10K+ Per Month Working 4 Hours a Day (Step-by-Step)',
          'The Side Hustle That Replaced My 9-5 Salary in 6 Months',
          'Zero to $100K: The Online Business Blueprint They Don\'t Want You to Know',
          'I Quit My Job and Made $50K in 90 Days - Here\'s My Exact Method',
          'The Lazy Person\'s Guide to Making Money Online (Actually Works!)'
        ],
        hooks: ['financial freedom', 'passive income', 'location independence', 'escape 9-5'],
        pain_points: ['broke', 'stuck in job', 'no skills', 'no time', 'no money to start']
      },
      'social-media-mastery': {
        titles: [
          'How to Go VIRAL on Social Media (I Gained 100K Followers Using This)',
          'The Instagram Algorithm Hack That Got Me 1M+ Views',
          'From 0 to 100K Followers: The Social Media Strategy That Actually Works',
          'How I Make $5K+ Per Month as a Content Creator (Full Strategy)',
          'The TikTok Method That\'s Making People Internet Famous Overnight'
        ],
        hooks: ['viral content', 'algorithm mastery', 'influencer lifestyle', 'social media fame'],
        pain_points: ['no followers', 'low engagement', 'can\'t go viral', 'shadow banned']
      },
      'business-automation': {
        titles: [
          'How I Automated My Business to Run on Autopilot (Making $20K/Month)',
          'The Business Systems That Let Me Travel While Making Money',
          'From Overwhelmed to Automated: How I Scaled Without Burning Out',
          'The AI Tools That 10X\'d My Business (Complete Setup Guide)',
          'How to Build a Business That Runs Without You (Step-by-Step)'
        ],
        hooks: ['automation', 'passive systems', 'time freedom', 'scalable business'],
        pain_points: ['working too much', 'can\'t scale', 'burned out', 'no time off']
      }
    };

    this.businessTopics = {
      'entrepreneurship': {
        subtopics: ['startup-basics', 'business-planning', 'funding', 'scaling', 'exit-strategies'],
        difficulty: ['beginner', 'intermediate', 'advanced'],
        audience: ['aspiring-entrepreneurs', 'early-stage-founders', 'experienced-business-owners']
      },
      'digital-marketing': {
        subtopics: ['social-media', 'content-marketing', 'seo', 'paid-advertising', 'email-marketing'],
        difficulty: ['beginner', 'intermediate', 'advanced'],
        audience: ['marketers', 'business-owners', 'freelancers']
      },
      'financial-management': {
        subtopics: ['budgeting', 'cash-flow', 'investment', 'taxation', 'financial-planning'],
        difficulty: ['beginner', 'intermediate', 'advanced'],
        audience: ['business-owners', 'financial-professionals', 'individuals']
      },
      'leadership': {
        subtopics: ['team-building', 'communication', 'decision-making', 'conflict-resolution', 'motivation'],
        difficulty: ['intermediate', 'advanced'],
        audience: ['managers', 'executives', 'team-leaders']
      },
      'e-commerce': {
        subtopics: ['online-store-setup', 'product-sourcing', 'customer-acquisition', 'conversion-optimization', 'fulfillment'],
        difficulty: ['beginner', 'intermediate', 'advanced'],
        audience: ['aspiring-sellers', 'online-retailers', 'dropshippers']
      },
      'productivity': {
        subtopics: ['time-management', 'automation', 'systems', 'delegation', 'work-life-balance'],
        difficulty: ['beginner', 'intermediate'],
        audience: ['professionals', 'entrepreneurs', 'freelancers']
      }
    };

    this.analytics = {
      coursesGenerated: 0,
      studentsEnrolled: 0,
      completionRate: 0,
      revenue: 0,
      topCourses: []
    };
  }

  async generateBusinessCourse(options) {
    const {
      topic = 'entrepreneurship',
      subtopic = 'startup-basics',
      difficulty = 'intermediate',
      audience = 'aspiring-entrepreneurs',
      duration = '6-8 hours'
    } = options;

    try {
      console.log(`💼 Generating ${topic} course: ${subtopic}...`);

      // Step 1: Generate course outline
      const courseOutline = await this.generateCourseOutline(topic, subtopic, difficulty, audience, duration);
      
      // Step 2: Create detailed curriculum
      const curriculum = await this.generateCurriculum(courseOutline);
      
      // Step 3: Generate course materials
      const materials = await this.generateCourseMaterials(curriculum);
      
      // Step 4: Create assessments
      const assessments = await this.generateAssessments(curriculum);
      
      // Step 5: Generate course videos
      const videos = await this.generateCourseVideos(curriculum);
      
      // Step 6: Create certificates
      const certificate = await this.generateCertificateTemplate(courseOutline);
      
      // Step 7: Package everything
      const coursePackage = await this.packageCourse(courseOutline, curriculum, materials, assessments, videos, certificate);

      // Update analytics
      this.analytics.coursesGenerated++;

      return {
        success: true,
        course: coursePackage,
        outline: courseOutline,
        curriculum,
        materials,
        assessments,
        videos,
        certificate,
        metadata: {
          topic,
          subtopic,
          difficulty,
          audience,
          estimatedDuration: duration,
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Business course generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateCourseOutline(topic, subtopic, difficulty, audience, duration) {
    try {
      const response = await axios.post('http://localhost:3000/api/ai/generate-content', {
        platform: 'business-course',
        type: 'course-outline',
        prompt: `Create a comprehensive business course outline for "${subtopic}" within the ${topic} domain.

Target Audience: ${audience}
Difficulty Level: ${difficulty}
Course Duration: ${duration}

Requirements:
1. Course Title and Compelling Description
2. Learning Objectives (5-7 specific, measurable outcomes)
3. Prerequisites and Required Knowledge
4. Course Structure (6-10 modules)
5. Each Module Should Include:
   - Module title and overview
   - 3-4 lessons per module
   - Practical exercises and assignments
   - Real-world case studies
   - Key takeaways

6. Assessment Strategy
   - Quizzes, assignments, projects
   - Grading criteria
   - Certification requirements

7. Resources and Tools
   - Recommended readings
   - Software/tools needed
   - Templates and worksheets

8. Implementation Timeline
   - Self-paced vs structured learning
   - Milestone checkpoints

Make it practical, actionable, and results-oriented. Include real-world applications and current industry best practices.`,
        parameters: {
          maxTokens: 2000,
          temperature: 0.7
        }
      });

      return {
        title: this.generateCourseTitle(topic, subtopic, difficulty),
        topic,
        subtopic,
        difficulty,
        audience,
        duration,
        outline: response.data.content,
        modules: this.extractModules(response.data.content),
        objectives: this.extractLearningObjectives(response.data.content),
        pricing: this.calculatePricing(difficulty, duration),
        estimatedStudents: this.estimateEnrollment(topic, difficulty),
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Course outline generation error:', error);
      return {
        title: `${subtopic.replace('-', ' ')} Mastery Course`,
        topic,
        subtopic,
        difficulty,
        audience,
        outline: 'Comprehensive course covering essential concepts and practical applications',
        modules: ['Introduction', 'Fundamentals', 'Advanced Concepts', 'Implementation', 'Mastery'],
        objectives: ['Understand core concepts', 'Apply practical skills', 'Implement strategies'],
        pricing: { basic: 99, premium: 199 },
        estimatedStudents: 500
      };
    }
  }

  async generateCurriculum(courseOutline) {
    const curriculum = {
      modules: [],
      totalLessons: 0,
      estimatedHours: 0
    };

    try {
      for (let i = 0; i < courseOutline.modules.length; i++) {
        const module = courseOutline.modules[i];
        
        const response = await axios.post('http://localhost:3000/api/ai/generate-content', {
          platform: 'business-course',
          type: 'module-content',
          prompt: `Create detailed content for Module ${i + 1}: "${module}" in a ${courseOutline.topic} course about ${courseOutline.subtopic}.

Target Audience: ${courseOutline.audience}
Difficulty: ${courseOutline.difficulty}

For this module, provide:

1. Module Overview (2-3 paragraphs)
2. 4-5 Detailed Lessons:
   - Lesson title and objectives
   - Key concepts and theories
   - Practical examples and case studies
   - Step-by-step instructions
   - Common mistakes to avoid
   - Action items and exercises

3. Hands-on Activities:
   - Practical assignments
   - Real-world projects
   - Interactive exercises
   - Group discussions topics

4. Resources:
   - Additional readings
   - Tools and templates
   - Industry examples
   - Recommended next steps

5. Assessment:
   - Knowledge check questions
   - Practical assignments
   - Success metrics

Make it actionable, engaging, and immediately applicable to real business situations.`,
          parameters: {
            maxTokens: 1800,
            temperature: 0.8
          }
        });

        const moduleContent = {
          id: i + 1,
          title: module,
          overview: this.extractModuleOverview(response.data.content),
          lessons: this.extractLessons(response.data.content),
          activities: this.extractActivities(response.data.content),
          resources: this.extractResources(response.data.content),
          assessments: this.extractAssessments(response.data.content),
          estimatedHours: 1 + Math.floor(Math.random() * 2), // 1-3 hours per module
          content: response.data.content
        };

        curriculum.modules.push(moduleContent);
        curriculum.totalLessons += moduleContent.lessons.length;
        curriculum.estimatedHours += moduleContent.estimatedHours;
      }

      return curriculum;

    } catch (error) {
      console.error('Curriculum generation error:', error);
      return {
        modules: courseOutline.modules.map((title, i) => ({
          id: i + 1,
          title,
          overview: `Comprehensive coverage of ${title.toLowerCase()}`,
          lessons: [`${title} Fundamentals`, `${title} Applications`, `${title} Best Practices`],
          activities: ['Case Study Analysis', 'Practical Exercise', 'Implementation Plan'],
          estimatedHours: 2
        })),
        totalLessons: courseOutline.modules.length * 3,
        estimatedHours: courseOutline.modules.length * 2
      };
    }
  }

  async generateCourseMaterials(curriculum) {
    const materials = {
      worksheets: [],
      templates: [],
      guides: [],
      checklists: []
    };

    try {
      for (const module of curriculum.modules) {
        // Generate worksheet for each module
        const worksheet = await this.generateWorksheet(module);
        materials.worksheets.push(worksheet);

        // Generate templates
        const template = await this.generateTemplate(module);
        materials.templates.push(template);

        // Generate guides
        const guide = await this.generateGuide(module);
        materials.guides.push(guide);

        // Generate checklist
        const checklist = await this.generateChecklist(module);
        materials.checklists.push(checklist);
      }

      return materials;

    } catch (error) {
      console.error('Materials generation error:', error);
      return materials;
    }
  }

  async generateWorksheet(module) {
    try {
      const response = await axios.post('http://localhost:3000/api/ai/generate-content', {
        platform: 'business-course',
        type: 'worksheet',
        prompt: `Create a practical worksheet for "${module.title}" business module.

Include:
1. Clear instructions and objectives
2. 5-7 practical exercises or questions
3. Real-world scenarios to analyze
4. Action planning sections
5. Self-reflection questions
6. Implementation steps
7. Success measurement criteria

Make it professional, actionable, and suitable for business professionals. Format as a structured worksheet that students can print and complete.`,
        parameters: {
          maxTokens: 1000,
          temperature: 0.7
        }
      });

      const worksheetId = `worksheet_${module.id}_${uuidv4()}`;
      const worksheetPath = path.join(this.outputDir, 'materials', `${worksheetId}.md`);
      
      await fs.mkdir(path.dirname(worksheetPath), { recursive: true });
      await fs.writeFile(worksheetPath, response.data.content);

      return {
        id: worksheetId,
        moduleId: module.id,
        title: `${module.title} Worksheet`,
        path: worksheetPath,
        content: response.data.content,
        type: 'worksheet'
      };

    } catch (error) {
      console.error('Worksheet generation error:', error);
      return {
        id: `worksheet_${module.id}_basic`,
        moduleId: module.id,
        title: `${module.title} Worksheet`,
        content: `# ${module.title} Worksheet\n\n## Instructions\nComplete the following exercises to reinforce your learning.\n\n## Exercise 1\n[Describe practical application]\n\n## Exercise 2\n[Analyze case study]\n\n## Action Items\n- [ ] Item 1\n- [ ] Item 2\n- [ ] Item 3`,
        type: 'worksheet'
      };
    }
  }

  async generateTemplate(module) {
    try {
      const response = await axios.post('http://localhost:3000/api/ai/generate-content', {
        platform: 'business-course',
        type: 'template',
        prompt: `Create a business template related to "${module.title}".

Generate a professional, ready-to-use template that includes:
1. Clear structure and formatting
2. Placeholder sections with instructions
3. Example content where helpful
4. Professional business formatting
5. Action-oriented sections
6. Customization notes

Templates could be:
- Business plan sections
- Marketing strategy frameworks
- Financial planning tools
- Project management layouts
- Process documentation
- Analysis frameworks

Make it immediately usable and professional.`,
        parameters: {
          maxTokens: 1200,
          temperature: 0.6
        }
      });

      const templateId = `template_${module.id}_${uuidv4()}`;
      const templatePath = path.join(this.outputDir, 'materials', `${templateId}.md`);
      
      await fs.writeFile(templatePath, response.data.content);

      return {
        id: templateId,
        moduleId: module.id,
        title: `${module.title} Template`,
        path: templatePath,
        content: response.data.content,
        type: 'template'
      };

    } catch (error) {
      return {
        id: `template_${module.id}_basic`,
        title: `${module.title} Template`,
        content: `# ${module.title} Template\n\n## Overview\n[Template description]\n\n## Section 1\n[Content area]\n\n## Section 2\n[Content area]\n\n## Notes\n[Implementation guidance]`,
        type: 'template'
      };
    }
  }

  async generateGuide(module) {
    try {
      const response = await axios.post('http://localhost:3000/api/ai/generate-content', {
        platform: 'business-course',
        type: 'guide',
        prompt: `Create a comprehensive implementation guide for "${module.title}".

Structure the guide with:
1. Executive Summary
2. Step-by-step implementation process
3. Timeline and milestones
4. Required resources and tools
5. Common challenges and solutions
6. Success metrics and KPIs
7. Best practices and tips
8. Troubleshooting section
9. Next steps and progression

Make it actionable, detailed, and suitable for immediate implementation in real business situations.`,
        parameters: {
          maxTokens: 1500,
          temperature: 0.7
        }
      });

      const guideId = `guide_${module.id}_${uuidv4()}`;
      const guidePath = path.join(this.outputDir, 'materials', `${guideId}.md`);
      
      await fs.writeFile(guidePath, response.data.content);

      return {
        id: guideId,
        moduleId: module.id,
        title: `${module.title} Implementation Guide`,
        path: guidePath,
        content: response.data.content,
        type: 'guide'
      };

    } catch (error) {
      return {
        id: `guide_${module.id}_basic`,
        title: `${module.title} Guide`,
        content: `# ${module.title} Implementation Guide\n\n## Getting Started\n[Initial steps]\n\n## Process\n[Step-by-step instructions]\n\n## Tips\n[Best practices]`,
        type: 'guide'
      };
    }
  }

  async generateChecklist(module) {
    try {
      const response = await axios.post('http://localhost:3000/api/ai/generate-content', {
        platform: 'business-course',
        type: 'checklist',
        prompt: `Create a comprehensive checklist for "${module.title}" implementation.

Include:
1. Pre-implementation preparation (5-7 items)
2. Core implementation steps (8-12 items)
3. Quality assurance checks (3-5 items)
4. Post-implementation review (3-5 items)
5. Continuous improvement items (3-4 items)

Format as checkbox list with brief descriptions. Make each item specific, actionable, and measurable.`,
        parameters: {
          maxTokens: 800,
          temperature: 0.6
        }
      });

      const checklistId = `checklist_${module.id}_${uuidv4()}`;
      const checklistPath = path.join(this.outputDir, 'materials', `${checklistId}.md`);
      
      await fs.writeFile(checklistPath, response.data.content);

      return {
        id: checklistId,
        moduleId: module.id,
        title: `${module.title} Checklist`,
        path: checklistPath,
        content: response.data.content,
        type: 'checklist'
      };

    } catch (error) {
      return {
        id: `checklist_${module.id}_basic`,
        title: `${module.title} Checklist`,
        content: `# ${module.title} Checklist\n\n## Preparation\n- [ ] Review requirements\n- [ ] Gather resources\n\n## Implementation\n- [ ] Step 1\n- [ ] Step 2\n- [ ] Step 3\n\n## Review\n- [ ] Check results\n- [ ] Document learnings`,
        type: 'checklist'
      };
    }
  }

  async generateAssessments(curriculum) {
    const assessments = {
      quizzes: [],
      assignments: [],
      finalProject: null
    };

    try {
      // Generate quiz for each module
      for (const module of curriculum.modules) {
        const quiz = await this.generateQuiz(module);
        assessments.quizzes.push(quiz);

        const assignment = await this.generateAssignment(module);
        assessments.assignments.push(assignment);
      }

      // Generate final project
      assessments.finalProject = await this.generateFinalProject(curriculum);

      return assessments;

    } catch (error) {
      console.error('Assessments generation error:', error);
      return assessments;
    }
  }

  async generateQuiz(module) {
    try {
      const response = await axios.post('http://localhost:3000/api/ai/generate-content', {
        platform: 'business-course',
        type: 'quiz',
        prompt: `Create a 10-question assessment quiz for "${module.title}" business module.

Question Types:
- Multiple choice (6 questions)
- True/false (2 questions)  
- Short answer (2 questions)

Requirements:
- Test understanding of key concepts
- Include practical application scenarios
- Provide correct answers and explanations
- Make questions challenging but fair
- Focus on real-world business situations

Format as JSON with:
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
          maxTokens: 1200,
          temperature: 0.6
        }
      });

      return {
        moduleId: module.id,
        title: `${module.title} Assessment`,
        quiz: JSON.parse(response.data.content),
        passingScore: 70,
        timeLimit: 30, // minutes
        attempts: 3
      };

    } catch (error) {
      return {
        moduleId: module.id,
        title: `${module.title} Assessment`,
        quiz: {
          questions: [
            {
              type: "multiple_choice",
              question: `What is a key principle in ${module.title.toLowerCase()}?`,
              options: ["Planning", "Execution", "Analysis", "All of the above"],
              correct: 3,
              explanation: "All elements are important for success"
            }
          ]
        },
        passingScore: 70
      };
    }
  }

  async generateAssignment(module) {
    try {
      const response = await axios.post('http://localhost:3000/api/ai/generate-content', {
        platform: 'business-course',
        type: 'assignment',
        prompt: `Create a practical assignment for "${module.title}" business module.

Assignment should include:
1. Clear objective and learning outcomes
2. Detailed instructions and requirements
3. Real-world business scenario or case study
4. Specific deliverables (documents, presentations, analysis)
5. Evaluation criteria and rubric
6. Time estimate and deadline suggestions
7. Resources and tools needed
8. Success examples and common pitfalls

Make it challenging, relevant, and applicable to actual business situations.`,
        parameters: {
          maxTokens: 1000,
          temperature: 0.7
        }
      });

      return {
        moduleId: module.id,
        title: `${module.title} Practical Assignment`,
        instructions: response.data.content,
        deliverables: this.extractDeliverables(response.data.content),
        estimatedTime: '2-4 hours',
        points: 100
      };

    } catch (error) {
      return {
        moduleId: module.id,
        title: `${module.title} Assignment`,
        instructions: `Complete a practical exercise applying ${module.title} concepts to a real business scenario.`,
        deliverables: ['Written analysis', 'Action plan', 'Implementation timeline'],
        estimatedTime: '2-3 hours'
      };
    }
  }

  async generateFinalProject(curriculum) {
    try {
      const response = await axios.post('http://localhost:3000/api/ai/generate-content', {
        platform: 'business-course',
        type: 'final-project',
        prompt: `Create a comprehensive final project that integrates all modules from this business course.

Course covers: ${curriculum.modules.map(m => m.title).join(', ')}

Final Project Requirements:
1. Project Title and Objective
2. Comprehensive business scenario or case study
3. Integration of all course modules
4. Multiple deliverables (strategy, analysis, implementation plan)
5. Presentation component
6. Peer review element
7. Detailed evaluation rubric
8. Timeline (2-3 weeks)
9. Success metrics and outcomes
10. Real-world application potential

Make it challenging, comprehensive, and career-relevant. Should demonstrate mastery of all course concepts.`,
        parameters: {
          maxTokens: 1500,
          temperature: 0.7
        }
      });

      return {
        title: 'Comprehensive Business Strategy Project',
        description: response.data.content,
        duration: '2-3 weeks',
        deliverables: [
          'Executive Summary',
          'Market Analysis',
          'Strategic Plan', 
          'Implementation Timeline',
          'Financial Projections',
          'Final Presentation'
        ],
        totalPoints: 500,
        peerReview: true
      };

    } catch (error) {
      return {
        title: 'Final Business Project',
        description: 'Comprehensive project integrating all course concepts',
        duration: '2-3 weeks',
        deliverables: ['Business Plan', 'Presentation', 'Analysis Report'],
        totalPoints: 500
      };
    }
  }

  async generateCourseVideos(curriculum) {
    const videos = [];

    try {
      for (const module of curriculum.modules) {
        for (const lesson of module.lessons.slice(0, 2)) { // Generate 2 videos per module
          const video = await this.generateLessonVideo(module, lesson);
          videos.push(video);
        }
      }

      return videos;

    } catch (error) {
      console.error('Video generation error:', error);
      return [];
    }
  }

  async generateLessonVideo(module, lesson) {
    try {
      // Generate script for the lesson
      const script = await this.generateVideoScript(module, lesson);
      
      // Generate voiceover
      const voiceover = await this.generateVoiceover(script);
      
      // Create visual slides
      const slides = await this.generateVideoSlides(module, lesson);
      
      // Compile video (mock for now)
      const videoId = `video_${module.id}_${uuidv4()}`;
      const videoPath = path.join(this.outputDir, 'videos', `${videoId}.mp4`);

      return {
        id: videoId,
        moduleId: module.id,
        lesson,
        title: `${module.title}: ${lesson}`,
        path: videoPath,
        script,
        slides: slides.length,
        duration: this.estimateVideoDuration(script),
        status: 'generated'
      };

    } catch (error) {
      return {
        moduleId: module.id,
        lesson,
        title: `${module.title}: ${lesson}`,
        status: 'error',
        error: error.message
      };
    }
  }

  async generateVideoScript(module, lesson) {
    try {
      const response = await axios.post('http://localhost:3000/api/ai/generate-content', {
        platform: 'business-course',
        type: 'video-script',
        prompt: `Create an engaging video script for business lesson: "${lesson}" in module "${module.title}".

Script Requirements:
- Professional yet conversational tone
- 10-15 minute duration
- Clear learning objectives stated upfront
- Logical flow with smooth transitions
- Real-world examples and case studies
- Actionable takeaways
- Engagement prompts for students
- Call-to-action for next steps

Structure:
1. Hook and Introduction (1-2 minutes)
2. Learning Objectives (30 seconds)
3. Main Content with Examples (8-11 minutes)
4. Key Takeaways (1-2 minutes)
5. Next Steps and Conclusion (30 seconds)

Include [SLIDE] markers for visual transitions and [PAUSE] for emphasis.`,
        parameters: {
          maxTokens: 1500,
          temperature: 0.8
        }
      });

      return response.data.content;

    } catch (error) {
      return `Welcome to ${lesson}. In this lesson, we'll explore key concepts of ${module.title} and learn practical applications for your business success.`;
    }
  }

  async generateVideoSlides(module, lesson) {
    const slides = [];
    
    try {
      // Create title slide
      slides.push(await this.createTitleSlide(module.title, lesson));
      
      // Create content slides
      for (let i = 0; i < 5; i++) {
        slides.push(await this.createContentSlide(module.title, lesson, i + 1));
      }
      
      // Create summary slide
      slides.push(await this.createSummarySlide(module.title, lesson));

      return slides;

    } catch (error) {
      console.error('Slide generation error:', error);
      return [];
    }
  }

  async createTitleSlide(moduleTitle, lesson) {
    const canvas = createCanvas(1920, 1080);
    const ctx = canvas.getContext('2d');

    // Professional background
    const gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(1, '#34495e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1920, 1080);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    
    const title = lesson.toUpperCase();
    ctx.fillText(title, 960, 400);

    // Module info
    ctx.font = '32px Arial';
    ctx.fillStyle = '#3498db';
    ctx.fillText(`Module: ${moduleTitle}`, 960, 500);

    // Business course branding
    ctx.font = '24px Arial';
    ctx.fillStyle = '#95a5a6';
    ctx.fillText('Business Mastery Course Series', 960, 700);

    const slideFileName = `title_slide_${uuidv4()}.png`;
    const slidePath = path.join(this.outputDir, 'slides', slideFileName);
    
    await fs.mkdir(path.dirname(slidePath), { recursive: true });
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(slidePath, buffer);

    return {
      type: 'title',
      path: slidePath,
      fileName: slideFileName
    };
  }

  async createContentSlide(moduleTitle, lesson, slideNumber) {
    const canvas = createCanvas(1920, 1080);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1920, 1080);

    // Header
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, 1920, 150);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(lesson, 100, 85);

    // Content area
    ctx.fillStyle = '#2c3e50';
    ctx.font = '32px Arial';
    ctx.fillText(`Key Concept ${slideNumber}`, 100, 250);
    
    ctx.font = '24px Arial';
    ctx.fillText('• Important business principle', 150, 350);
    ctx.fillText('• Practical application example', 150, 400);
    ctx.fillText('• Implementation strategy', 150, 450);
    ctx.fillText('• Success metrics', 150, 500);

    const slideFileName = `content_slide_${slideNumber}_${uuidv4()}.png`;
    const slidePath = path.join(this.outputDir, 'slides', slideFileName);
    
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(slidePath, buffer);

    return {
      type: 'content',
      slideNumber,
      path: slidePath,
      fileName: slideFileName
    };
  }

  async createSummarySlide(moduleTitle, lesson) {
    const canvas = createCanvas(1920, 1080);
    const ctx = canvas.getContext('2d');

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
    gradient.addColorStop(0, '#27ae60');
    gradient.addColorStop(1, '#2ecc71');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1920, 1080);

    // Summary title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('KEY TAKEAWAYS', 960, 300);

    // Takeaway points
    ctx.font = '32px Arial';
    ctx.fillText('✓ Master core concepts', 960, 450);
    ctx.fillText('✓ Apply practical strategies', 960, 520);
    ctx.fillText('✓ Implement in your business', 960, 590);

    // Next steps
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#f1c40f';
    ctx.fillText('Next: Complete the module assignment', 960, 750);

    const slideFileName = `summary_slide_${uuidv4()}.png`;
    const slidePath = path.join(this.outputDir, 'slides', slideFileName);
    
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(slidePath, buffer);

    return {
      type: 'summary',
      path: slidePath,
      fileName: slideFileName
    };
  }

  async generateVoiceover(script) {
    try {
      const response = await axios.post('http://localhost:3000/api/ai/generate-voice', {
        text: script,
        voiceId: 'business-professional',
        stability: 0.6,
        similarityBoost: 0.8
      });

      if (response.data.success) {
        const audioFileName = `business_voiceover_${uuidv4()}.mp3`;
        const audioPath = path.join(this.outputDir, 'audio', audioFileName);
        
        await fs.mkdir(path.dirname(audioPath), { recursive: true });
        const audioBuffer = Buffer.from(response.data.audioData, 'base64');
        await fs.writeFile(audioPath, audioBuffer);

        return {
          path: audioPath,
          fileName: audioFileName,
          duration: this.estimateAudioDuration(script),
          success: true
        };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async generateCertificateTemplate(courseOutline) {
    const canvas = createCanvas(1200, 800);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1200, 800);

    // Border
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, 1120, 720);

    // Inner border
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 80, 1040, 640);

    // Title
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF COMPLETION', 600, 200);

    // Course name
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#3498db';
    ctx.fillText(courseOutline.title, 600, 280);

    // Completion text
    ctx.font = '24px Arial';
    ctx.fillStyle = '#2c3e50';
    ctx.fillText('This certifies that', 600, 350);

    // Student name placeholder
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#e74c3c';
    ctx.fillText('[STUDENT NAME]', 600, 400);

    // Completion details
    ctx.font = '20px Arial';
    ctx.fillStyle = '#2c3e50';
    ctx.fillText('has successfully completed all requirements', 600, 450);
    ctx.fillText(`Difficulty Level: ${courseOutline.difficulty}`, 600, 500);

    // Date and signature area
    ctx.font = 'italic 18px Arial';
    ctx.fillStyle = '#7f8c8d';
    ctx.fillText('Date: [COMPLETION DATE]', 300, 600);
    ctx.fillText('Instructor: Business Expert', 900, 600);

    const certFileName = `certificate_template_${uuidv4()}.png`;
    const certPath = path.join(this.outputDir, 'certificates', certFileName);
    
    await fs.mkdir(path.dirname(certPath), { recursive: true });
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(certPath, buffer);

    return {
      templatePath: certPath,
      fileName: certFileName,
      courseTitle: courseOutline.title
    };
  }

  async packageCourse(courseOutline, curriculum, materials, assessments, videos, certificate) {
    const courseId = uuidv4();
    const packageDir = path.join(this.outputDir, 'courses', courseId);
    await fs.mkdir(packageDir, { recursive: true });

    const coursePackage = {
      id: courseId,
      packagePath: packageDir,
      manifest: {
        course: courseOutline,
        curriculum,
        materials,
        assessments,
        videos: videos.length,
        certificate,
        packagedAt: new Date().toISOString()
      }
    };

    // Save course manifest
    await fs.writeFile(
      path.join(packageDir, 'course-manifest.json'),
      JSON.stringify(coursePackage.manifest, null, 2)
    );

    // Generate course README
    const readme = this.generateCourseReadme(courseOutline, curriculum);
    await fs.writeFile(path.join(packageDir, 'README.md'), readme);

    return coursePackage;
  }

  generateCourseReadme(courseOutline, curriculum) {
    return `# ${courseOutline.title}

## Course Overview
${courseOutline.outline.substring(0, 300)}...

## Course Details
- **Topic**: ${courseOutline.topic}
- **Subtopic**: ${courseOutline.subtopic}
- **Difficulty**: ${courseOutline.difficulty}
- **Target Audience**: ${courseOutline.audience}
- **Duration**: ${courseOutline.duration}
- **Modules**: ${curriculum.modules.length}
- **Total Lessons**: ${curriculum.totalLessons}

## Pricing
- Basic Access: $${courseOutline.pricing.basic}
- Premium Package: $${courseOutline.pricing.premium}

## Learning Objectives
${courseOutline.objectives.map(obj => `- ${obj}`).join('\n')}

## Course Structure
${curriculum.modules.map((module, i) => `### Module ${i + 1}: ${module.title}\n${module.overview}\n`).join('\n')}

## What's Included
- ${curriculum.totalLessons} comprehensive lessons
- Practical worksheets and templates
- Implementation guides and checklists
- Video lectures and presentations
- Quizzes and assignments
- Final capstone project
- Certificate of completion

## Generated by
AI Business Course Platform - Enam Consulting LLC
Generated: ${courseOutline.generatedAt}`;
  }

  // Helper methods
  generateCourseTitle(topic, subtopic, difficulty) {
    const level = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    const subject = subtopic.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    return `${level} ${subject} Mastery: Complete ${topic.charAt(0).toUpperCase() + topic.slice(1)} Course`;
  }

  extractModules(outlineText) {
    // Extract module titles from the outline
    const moduleMatches = outlineText.match(/Module \d+[:\-]\s*([^\n\r]+)/gi);
    if (moduleMatches) {
      return moduleMatches.map(match => 
        match.replace(/Module \d+[:\-]\s*/i, '').trim()
      );
    }
    
    return ['Foundation Concepts', 'Core Principles', 'Advanced Strategies', 'Implementation', 'Mastery & Optimization'];
  }

  extractLearningObjectives(outlineText) {
    // Extract learning objectives from the outline
    const objectiveSection = outlineText.match(/(?:learning objectives?|outcomes?)[:\-](.*?)(?=\n\n|\n[A-Z]|$)/is);
    if (objectiveSection) {
      const objectives = objectiveSection[1].match(/[-•]\s*([^\n\r]+)/g);
      if (objectives) {
        return objectives.map(obj => obj.replace(/[-•]\s*/, '').trim());
      }
    }
    
    return [
      'Master fundamental concepts and principles',
      'Apply practical strategies in real-world scenarios',
      'Develop implementation plans for immediate use',
      'Measure success and optimize performance'
    ];
  }

  extractModuleOverview(content) {
    const lines = content.split('\n');
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      if (lines[i].trim().length > 50) {
        return lines[i].trim();
      }
    }
    return 'Comprehensive module covering essential concepts and practical applications.';
  }

  extractLessons(content) {
    const lessonMatches = content.match(/(?:lesson \d+|^\d+\.)\s*[:\-]?\s*([^\n\r]+)/gim);
    if (lessonMatches) {
      return lessonMatches.map(match => 
        match.replace(/(?:lesson \d+|^\d+\.)\s*[:\-]?\s*/i, '').trim()
      ).slice(0, 5);
    }
    return ['Core Concepts', 'Practical Applications', 'Case Studies', 'Implementation', 'Best Practices'];
  }

  extractActivities(content) {
    const activities = [];
    const activityKeywords = ['exercise', 'activity', 'assignment', 'project', 'case study'];
    
    const lines = content.split('\n');
    lines.forEach(line => {
      activityKeywords.forEach(keyword => {
        if (line.toLowerCase().includes(keyword) && line.length > 10 && line.length < 100) {
          activities.push(line.trim());
        }
      });
    });

    return activities.slice(0, 3);
  }

  extractResources(content) {
    const resources = [];
    if (content.toLowerCase().includes('resource')) {
      resources.push('Additional reading materials', 'Industry tools and templates', 'Case study examples');
    }
    return resources;
  }

  extractAssessments(content) {
    return ['Knowledge check quiz', 'Practical assignment', 'Peer review activity'];
  }

  extractDeliverables(content) {
    const deliverables = [];
    const deliverableKeywords = ['report', 'plan', 'analysis', 'presentation', 'strategy', 'document'];
    
    deliverableKeywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        deliverables.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    });

    return deliverables.length > 0 ? deliverables : ['Analysis Report', 'Implementation Plan', 'Strategy Document'];
  }

  calculatePricing(difficulty, duration) {
    const basePrices = {
      'beginner': { basic: 79, premium: 149 },
      'intermediate': { basic: 99, premium: 199 },
      'advanced': { basic: 129, premium: 249 }
    };

    const durationMultiplier = duration.includes('8') ? 1.2 : 1.0;
    const prices = basePrices[difficulty] || basePrices['intermediate'];

    return {
      basic: Math.round(prices.basic * durationMultiplier),
      premium: Math.round(prices.premium * durationMultiplier)
    };
  }

  estimateEnrollment(topic, difficulty) {
    const baseEnrollments = {
      'entrepreneurship': 800,
      'digital-marketing': 1200,
      'financial-management': 600,
      'leadership': 500,
      'e-commerce': 1000,
      'productivity': 900
    };

    const difficultyMultiplier = {
      'beginner': 1.5,
      'intermediate': 1.0,
      'advanced': 0.7
    };

    const base = baseEnrollments[topic] || 700;
    const multiplier = difficultyMultiplier[difficulty] || 1.0;

    return Math.round(base * multiplier);
  }

  estimateVideoDuration(script) {
    const words = script.split(' ').length;
    const wordsPerMinute = 140; // Professional speaking pace
    return Math.ceil((words / wordsPerMinute) * 60); // seconds
  }

  estimateAudioDuration(text) {
    const words = text.split(' ').length;
    return (words / 150) * 60; // seconds
  }

  async getAnalytics() {
    return {
      ...this.analytics,
      topics: Object.keys(this.businessTopics),
      lastUpdate: new Date().toISOString()
    };
  }
}

module.exports = BusinessCourseGenerator;