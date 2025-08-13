const express = require('express');
const BusinessCourseGenerator = require('../services/BusinessCourseGenerator');
const router = express.Router();

const courseGenerator = new BusinessCourseGenerator();

// Generate complete business course
router.post('/generate-course', async (req, res) => {
  try {
    const { topic, level, duration, format } = req.body;
    
    const result = await courseGenerator.generateBusinessCourse({
      topic: topic || 'digital-marketing',
      level: level || 'intermediate',
      duration: duration || '6-weeks',
      format: format || 'comprehensive'
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate course curriculum only
router.post('/curriculum', async (req, res) => {
  try {
    const { topic, level, duration } = req.body;
    
    const curriculum = await courseGenerator.generateCurriculum(
      topic || 'entrepreneurship',
      level || 'beginner',
      duration || '4-weeks'
    );

    res.json({
      success: true,
      curriculum
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate course materials
router.post('/materials', async (req, res) => {
  try {
    const { courseId, materialTypes } = req.body;
    
    const materials = await courseGenerator.generateCourseMaterials(
      courseId,
      materialTypes || ['worksheets', 'templates', 'guides']
    );

    res.json({
      success: true,
      courseId,
      materials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate assessments
router.post('/assessments', async (req, res) => {
  try {
    const { courseId, assessmentTypes } = req.body;
    
    const assessments = await courseGenerator.generateAssessments(
      courseId,
      assessmentTypes || ['quiz', 'assignment']
    );

    res.json({
      success: true,
      courseId,
      assessments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get course topics
router.get('/topics', (req, res) => {
  const topics = {
    'entrepreneurship': {
      description: 'Starting and growing a business',
      subtopics: ['Business Planning', 'Market Research', 'Funding', 'Legal Structure'],
      targetAudience: 'Aspiring entrepreneurs'
    },
    'digital-marketing': {
      description: 'Online marketing strategies and tactics',
      subtopics: ['SEO', 'Social Media', 'Content Marketing', 'Email Marketing'],
      targetAudience: 'Business owners and marketers'
    },
    'financial-management': {
      description: 'Business finance and accounting',
      subtopics: ['Cash Flow', 'Budgeting', 'Investment', 'Financial Planning'],
      targetAudience: 'Business owners and finance professionals'
    },
    'leadership': {
      description: 'Leadership and management skills',
      subtopics: ['Team Building', 'Communication', 'Decision Making', 'Conflict Resolution'],
      targetAudience: 'Managers and team leaders'
    },
    'sales': {
      description: 'Sales techniques and customer relations',
      subtopics: ['Sales Process', 'Customer Psychology', 'Negotiation', 'CRM'],
      targetAudience: 'Sales professionals and business owners'
    },
    'e-commerce': {
      description: 'Online business and e-commerce',
      subtopics: ['Store Setup', 'Product Management', 'Payment Processing', 'Analytics'],
      targetAudience: 'E-commerce entrepreneurs'
    }
  };

  res.json({
    success: true,
    topics
  });
});

// Generate business plan template
router.post('/business-plan', async (req, res) => {
  try {
    const { businessType, industry } = req.body;
    
    const businessPlan = await courseGenerator.generateBusinessPlan(
      businessType || 'startup',
      industry || 'technology'
    );

    res.json({
      success: true,
      businessPlan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate case study
router.post('/case-study', async (req, res) => {
  try {
    const { industry, scenario, objectives } = req.body;
    
    const caseStudy = await courseGenerator.generateCaseStudy(
      industry || 'retail',
      scenario || 'market-expansion',
      objectives || ['growth', 'profitability']
    );

    res.json({
      success: true,
      caseStudy
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
    const analytics = await courseGenerator.getAnalytics();
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