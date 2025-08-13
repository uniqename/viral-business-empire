const axios = require('axios');

class BusinessCourseWorkflow {
  constructor(logger) {
    this.logger = logger;
    this.apiBase = process.env.BUSINESS_COURSE_URL || 'http://localhost:3007';
    this.status = 'ready';
    this.lastRun = null;
    this.metrics = {
      coursesGenerated: 0,
      materialsCreated: 0,
      assessmentsCreated: 0,
      certificatesIssued: 0,
      revenue: 0
    };
  }

  async execute(parameters = {}) {
    this.status = 'running';
    this.lastRun = new Date().toISOString();
    
    try {
      this.logger.info('Starting Business Course automation workflow');

      // Step 1: Generate diverse business course topics
      const courseTopics = await this.generateCourseTopics(parameters);

      // Step 2: Create comprehensive courses
      const courseResults = await this.createBusinessCourses(courseTopics);

      // Step 3: Generate supporting materials
      const materialResults = await this.generateCourseMaterials(courseResults);

      // Step 4: Create assessments
      const assessmentResults = await this.createAssessments(courseResults);

      // Step 5: Update metrics
      await this.trackMetrics(courseResults, materialResults, assessmentResults);

      this.status = 'completed';
      this.logger.info(`Business Course workflow completed. Created ${courseResults.length} courses`);

      return {
        success: true,
        coursesCreated: courseResults.length,
        materialsGenerated: materialResults.length,
        assessmentsCreated: assessmentResults.length,
        metrics: this.metrics
      };

    } catch (error) {
      this.status = 'error';
      this.logger.error(`Business Course workflow error: ${error.message}`);
      throw error;
    }
  }

  async generateCourseTopics(parameters = {}) {
    const businessTopics = [
      { topic: 'entrepreneurship', level: 'beginner', duration: '4-weeks', format: 'comprehensive' },
      { topic: 'digital-marketing', level: 'intermediate', duration: '6-weeks', format: 'practical' },
      { topic: 'financial-management', level: 'advanced', duration: '8-weeks', format: 'detailed' },
      { topic: 'leadership', level: 'intermediate', duration: '5-weeks', format: 'interactive' },
      { topic: 'e-commerce', level: 'beginner', duration: '6-weeks', format: 'hands-on' }
    ];

    const courseTopics = [];

    for (const topic of businessTopics) {
      try {
        this.logger.info(`Generating course curriculum for ${topic.topic}`);

        const response = await axios.post(`${this.apiBase}/api/business/curriculum`, topic);

        if (response.data.success) {
          courseTopics.push({
            ...topic,
            curriculum: response.data.curriculum,
            generatedAt: new Date().toISOString()
          });
          
          this.logger.info(`Generated curriculum: ${response.data.curriculum.title}`);
        }
      } catch (error) {
        this.logger.error(`Curriculum generation error for ${topic.topic}: ${error.message}`);
      }
    }

    return courseTopics;
  }

  async createBusinessCourses(courseTopics) {
    const courseResults = [];

    for (const topicData of courseTopics) {
      try {
        this.logger.info(`Creating business course: ${topicData.curriculum.title}`);

        const response = await axios.post(`${this.apiBase}/api/business/generate-course`, topicData);

        if (response.data.success) {
          courseResults.push({
            ...response.data,
            topicData,
            createdAt: new Date().toISOString()
          });
          
          this.metrics.coursesGenerated++;
        }
      } catch (error) {
        this.logger.error(`Course creation error for "${topicData.curriculum.title}": ${error.message}`);
      }
    }

    return courseResults;
  }

  async generateCourseMaterials(courseResults) {
    const materialResults = [];
    const materialTypes = ['worksheets', 'templates', 'guides', 'checklists'];

    for (const course of courseResults) {
      try {
        this.logger.info(`Generating materials for ${course.course.title}`);

        const response = await axios.post(`${this.apiBase}/api/business/materials`, {
          courseId: course.course.id,
          materialTypes
        });

        if (response.data.success) {
          materialResults.push({
            ...response.data.materials,
            course: course.course,
            generatedAt: new Date().toISOString()
          });
          
          this.metrics.materialsCreated += response.data.materials.length;
        }
      } catch (error) {
        this.logger.error(`Materials generation error for "${course.course.title}": ${error.message}`);
      }
    }

    return materialResults;
  }

  async createAssessments(courseResults) {
    const assessmentResults = [];
    const assessmentTypes = ['quiz', 'assignment', 'final-project'];

    for (const course of courseResults) {
      try {
        this.logger.info(`Creating assessments for ${course.course.title}`);

        const response = await axios.post(`${this.apiBase}/api/business/assessments`, {
          courseId: course.course.id,
          assessmentTypes
        });

        if (response.data.success) {
          assessmentResults.push({
            ...response.data.assessments,
            course: course.course,
            createdAt: new Date().toISOString()
          });
          
          this.metrics.assessmentsCreated += response.data.assessments.length;
        }
      } catch (error) {
        this.logger.error(`Assessment creation error for "${course.course.title}": ${error.message}`);
      }
    }

    return assessmentResults;
  }

  async trackMetrics(courseResults, materialResults, assessmentResults) {
    try {
      await axios.post('http://localhost:3000/api/analytics/track', {
        platform: 'business-course',
        userId: 'system',
        event: 'course_workflow_completed',
        properties: {
          coursesGenerated: courseResults.length,
          materialsCreated: materialResults.length,
          assessmentsCreated: assessmentResults.length,
          topics: courseResults.map(c => c.topicData.topic),
          levels: courseResults.map(c => c.topicData.level),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      this.logger.error(`Business course analytics tracking error: ${error.message}`);
    }
  }

  async getDailyMetrics() {
    return {
      platform: 'business-course',
      coursesGenerated: this.metrics.coursesGenerated,
      materialsCreated: this.metrics.materialsCreated,
      assessmentsCreated: this.metrics.assessmentsCreated,
      certificatesIssued: this.metrics.certificatesIssued,
      revenue: this.metrics.revenue,
      contentCreated: this.metrics.coursesGenerated,
      activeUsers: 1,
      lastRun: this.lastRun
    };
  }

  getStatus() {
    return {
      status: this.status,
      lastRun: this.lastRun,
      metrics: this.metrics,
      platform: 'business-course'
    };
  }
}

module.exports = BusinessCourseWorkflow;