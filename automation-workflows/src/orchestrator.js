const cron = require('node-cron');
const express = require('express');
const winston = require('winston');
require('dotenv').config();

// Import workflow modules
const YouTubeWorkflow = require('./workflows/youtube-workflow');
const PrintOnDemandWorkflow = require('./workflows/print-on-demand-workflow');
const CourseWorkflow = require('./workflows/course-workflow');
const MobileAppWorkflow = require('./workflows/mobile-app-workflow');
const FitnessYouTubeWorkflow = require('./workflows/fitness-youtube-workflow');
const GameAppWorkflow = require('./workflows/game-app-workflow');
const BusinessCourseWorkflow = require('./workflows/business-course-workflow');
const AnalyticsWorkflow = require('./workflows/analytics-workflow');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class AutomationOrchestrator {
  constructor() {
    this.workflows = {
      youtube: new YouTubeWorkflow(logger),
      printOnDemand: new PrintOnDemandWorkflow(logger),
      course: new CourseWorkflow(logger),
      mobileApp: new MobileAppWorkflow(logger),
      fitnessYoutube: new FitnessYouTubeWorkflow(logger),
      gameApp: new GameAppWorkflow(logger),
      businessCourse: new BusinessCourseWorkflow(logger),
      analytics: new AnalyticsWorkflow(logger)
    };
    
    this.app = express();
    this.setupRoutes();
    this.scheduleWorkflows();
  }

  setupRoutes() {
    this.app.use(express.json());

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'Automation Orchestrator',
        timestamp: new Date().toISOString(),
        activeWorkflows: Object.keys(this.workflows)
      });
    });

    // Manual workflow triggers
    this.app.post('/trigger/:workflow', async (req, res) => {
      try {
        const { workflow } = req.params;
        const { parameters = {} } = req.body;

        if (!this.workflows[workflow]) {
          return res.status(404).json({
            success: false,
            error: `Workflow '${workflow}' not found`
          });
        }

        logger.info(`Manually triggering workflow: ${workflow}`);
        const result = await this.workflows[workflow].execute(parameters);

        res.json({
          success: true,
          workflow,
          result,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error(`Manual workflow trigger error: ${error.message}`);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Workflow status
    this.app.get('/status', (req, res) => {
      const status = {};
      Object.keys(this.workflows).forEach(workflow => {
        status[workflow] = this.workflows[workflow].getStatus();
      });

      res.json({
        success: true,
        status,
        timestamp: new Date().toISOString()
      });
    });
  }

  scheduleWorkflows() {
    logger.info('Setting up workflow schedules...');

    // YouTube Content Generation - Every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      logger.info('Running scheduled YouTube workflow');
      try {
        await this.workflows.youtube.execute();
      } catch (error) {
        logger.error(`YouTube workflow error: ${error.message}`);
      }
    });

    // Print-on-Demand Design Generation - Daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      logger.info('Running scheduled Print-on-Demand workflow');
      try {
        await this.workflows.printOnDemand.execute();
      } catch (error) {
        logger.error(`Print-on-Demand workflow error: ${error.message}`);
      }
    });

    // Course Content Creation - Weekly on Sunday at 3 AM
    cron.schedule('0 3 * * 0', async () => {
      logger.info('Running scheduled Course workflow');
      try {
        await this.workflows.course.execute();
      } catch (error) {
        logger.error(`Course workflow error: ${error.message}`);
      }
    });

    // Mobile App Analytics and Updates - Daily at 1 AM
    cron.schedule('0 1 * * *', async () => {
      logger.info('Running scheduled Mobile App workflow');
      try {
        await this.workflows.mobileApp.execute();
      } catch (error) {
        logger.error(`Mobile App workflow error: ${error.message}`);
      }
    });

    // Fitness YouTube Content - Every 8 hours
    cron.schedule('0 */8 * * *', async () => {
      logger.info('Running scheduled Fitness YouTube workflow');
      try {
        await this.workflows.fitnessYoutube.execute();
      } catch (error) {
        logger.error(`Fitness YouTube workflow error: ${error.message}`);
      }
    });

    // Game App Generation - Every 2 days at 4 AM
    cron.schedule('0 4 */2 * *', async () => {
      logger.info('Running scheduled Game App workflow');
      try {
        await this.workflows.gameApp.execute();
      } catch (error) {
        logger.error(`Game App workflow error: ${error.message}`);
      }
    });

    // Business Course Creation - Weekly on Wednesday at 5 AM
    cron.schedule('0 5 * * 3', async () => {
      logger.info('Running scheduled Business Course workflow');
      try {
        await this.workflows.businessCourse.execute();
      } catch (error) {
        logger.error(`Business Course workflow error: ${error.message}`);
      }
    });

    // Analytics Aggregation - Every hour
    cron.schedule('0 * * * *', async () => {
      logger.info('Running scheduled Analytics workflow');
      try {
        await this.workflows.analytics.execute();
      } catch (error) {
        logger.error(`Analytics workflow error: ${error.message}`);
      }
    });

    // Comprehensive Revenue Report - Daily at 11 PM
    cron.schedule('0 23 * * *', async () => {
      logger.info('Generating daily revenue report');
      try {
        await this.generateDailyReport();
      } catch (error) {
        logger.error(`Daily report error: ${error.message}`);
      }
    });
  }

  async generateDailyReport() {
    logger.info('Generating comprehensive daily business report');

    const report = {
      date: new Date().toISOString().split('T')[0],
      platforms: {}
    };

    // Collect data from all platforms
    for (const [platform, workflow] of Object.entries(this.workflows)) {
      try {
        const platformData = await workflow.getDailyMetrics();
        report.platforms[platform] = platformData;
      } catch (error) {
        logger.error(`Error collecting ${platform} metrics: ${error.message}`);
        report.platforms[platform] = { error: error.message };
      }
    }

    // Calculate totals
    report.summary = {
      totalRevenue: Object.values(report.platforms)
        .reduce((sum, p) => sum + (p.revenue || 0), 0),
      totalUsers: Object.values(report.platforms)
        .reduce((sum, p) => sum + (p.activeUsers || 0), 0),
      contentGenerated: Object.values(report.platforms)
        .reduce((sum, p) => sum + (p.contentCreated || 0), 0)
    };

    logger.info('Daily report generated:', JSON.stringify(report.summary, null, 2));

    // Save report (you could also email it)
    const fs = require('fs').promises;
    await fs.writeFile(
      `logs/daily-report-${report.date}.json`, 
      JSON.stringify(report, null, 2)
    );

    return report;
  }

  start(port = 4000) {
    this.app.listen(port, () => {
      logger.info(`🤖 Automation Orchestrator running on port ${port}`);
      logger.info('Scheduled workflows active:');
      logger.info('- YouTube: Every 6 hours');
      logger.info('- Print-on-Demand: Daily at 2 AM');
      logger.info('- Courses: Weekly on Sunday at 3 AM');
      logger.info('- Mobile App: Daily at 1 AM');
      logger.info('- Fitness YouTube: Every 8 hours');
      logger.info('- Game App: Every 2 days at 4 AM');
      logger.info('- Business Course: Weekly on Wednesday at 5 AM');
      logger.info('- Analytics: Every hour');
      logger.info('- Daily Report: Daily at 11 PM');
    });
  }
}

// Start the orchestrator if this file is run directly
if (require.main === module) {
  const orchestrator = new AutomationOrchestrator();
  orchestrator.start();
}

module.exports = AutomationOrchestrator;