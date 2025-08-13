const express = require('express');
const router = express.Router();

// Mock analytics data (replace with actual analytics service)
const analyticsData = new Map();

// Track event across all platforms
router.post('/track', (req, res) => {
  try {
    const { 
      platform, 
      userId, 
      event, 
      properties = {}, 
      timestamp = new Date().toISOString() 
    } = req.body;

    const eventId = `${platform}_${Date.now()}_${Math.random()}`;
    const eventData = {
      id: eventId,
      platform,
      userId,
      event,
      properties,
      timestamp
    };

    // Store event
    if (!analyticsData.has(platform)) {
      analyticsData.set(platform, []);
    }
    analyticsData.get(platform).push(eventData);

    res.json({
      success: true,
      eventId,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get analytics dashboard data
router.get('/dashboard/:platform', (req, res) => {
  try {
    const { platform } = req.params;
    const { timeframe = '7d' } = req.query;

    const events = analyticsData.get(platform) || [];
    
    // Filter by timeframe
    const cutoffDate = new Date();
    if (timeframe === '24h') cutoffDate.setHours(cutoffDate.getHours() - 24);
    else if (timeframe === '7d') cutoffDate.setDate(cutoffDate.getDate() - 7);
    else if (timeframe === '30d') cutoffDate.setDate(cutoffDate.getDate() - 30);

    const filteredEvents = events.filter(event => 
      new Date(event.timestamp) >= cutoffDate
    );

    // Generate analytics
    const analytics = generateAnalytics(filteredEvents, platform);

    res.json({
      success: true,
      platform,
      timeframe,
      analytics
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get revenue analytics
router.get('/revenue/:platform', (req, res) => {
  try {
    const { platform } = req.params;
    const events = analyticsData.get(platform) || [];

    const revenueEvents = events.filter(event => 
      event.event === 'purchase' || event.event === 'subscription'
    );

    const revenue = {
      total: revenueEvents.reduce((sum, event) => sum + (event.properties.amount || 0), 0),
      transactions: revenueEvents.length,
      avgOrderValue: revenueEvents.length > 0 ? 
        revenueEvents.reduce((sum, event) => sum + (event.properties.amount || 0), 0) / revenueEvents.length : 0,
      recentTransactions: revenueEvents.slice(-10)
    };

    res.json({
      success: true,
      platform,
      revenue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user engagement metrics
router.get('/engagement/:platform', (req, res) => {
  try {
    const { platform } = req.params;
    const events = analyticsData.get(platform) || [];

    const userEvents = events.reduce((acc, event) => {
      if (!acc[event.userId]) {
        acc[event.userId] = [];
      }
      acc[event.userId].push(event);
      return acc;
    }, {});

    const engagement = {
      totalUsers: Object.keys(userEvents).length,
      activeUsers: Object.keys(userEvents).filter(userId => 
        userEvents[userId].some(event => 
          new Date(event.timestamp) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
        )
      ).length,
      avgSessionLength: calculateAvgSessionLength(userEvents),
      topEvents: getTopEvents(events)
    };

    res.json({
      success: true,
      platform,
      engagement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Platform-specific analytics
router.get('/platform-specific/:platform', (req, res) => {
  try {
    const { platform } = req.params;
    const events = analyticsData.get(platform) || [];

    let specificAnalytics = {};

    switch (platform) {
      case 'mobile-app':
        specificAnalytics = {
          appLaunches: events.filter(e => e.event === 'app_launch').length,
          screenViews: events.filter(e => e.event === 'screen_view').length,
          crashes: events.filter(e => e.event === 'app_crash').length,
          adClicks: events.filter(e => e.event === 'ad_click').length
        };
        break;

      case 'youtube-automation':
        specificAnalytics = {
          videosGenerated: events.filter(e => e.event === 'video_generated').length,
          uploadsCompleted: events.filter(e => e.event === 'video_uploaded').length,
          views: events.reduce((sum, e) => sum + (e.properties.views || 0), 0),
          subscribers: events.filter(e => e.event === 'subscriber_gained').length
        };
        break;

      case 'print-on-demand':
        specificAnalytics = {
          designsGenerated: events.filter(e => e.event === 'design_created').length,
          productsListed: events.filter(e => e.event === 'product_listed').length,
          ordersProcessed: events.filter(e => e.event === 'order_processed').length,
          bestSellingProducts: getBestSellingProducts(events)
        };
        break;

      case 'online-course':
        specificAnalytics = {
          coursesCreated: events.filter(e => e.event === 'course_created').length,
          enrollments: events.filter(e => e.event === 'course_enrolled').length,
          completionRate: calculateCompletionRate(events),
          certificatesIssued: events.filter(e => e.event === 'certificate_issued').length
        };
        break;
    }

    res.json({
      success: true,
      platform,
      specificAnalytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper functions
function generateAnalytics(events, platform) {
  const uniqueUsers = new Set(events.map(e => e.userId)).size;
  const eventCounts = events.reduce((acc, event) => {
    acc[event.event] = (acc[event.event] || 0) + 1;
    return acc;
  }, {});

  return {
    totalEvents: events.length,
    uniqueUsers,
    topEvents: Object.entries(eventCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5),
    timeSeriesData: generateTimeSeriesData(events)
  };
}

function generateTimeSeriesData(events) {
  const dailyData = events.reduce((acc, event) => {
    const date = new Date(event.timestamp).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(dailyData)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, count]) => ({ date, count }));
}

function calculateAvgSessionLength(userEvents) {
  // Simplified calculation - in reality, you'd track session start/end events
  const sessions = Object.values(userEvents).map(events => events.length);
  return sessions.length > 0 ? sessions.reduce((a, b) => a + b, 0) / sessions.length : 0;
}

function getTopEvents(events) {
  const eventCounts = events.reduce((acc, event) => {
    acc[event.event] = (acc[event.event] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(eventCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
}

function getBestSellingProducts(events) {
  const productSales = events
    .filter(e => e.event === 'product_purchased')
    .reduce((acc, event) => {
      const product = event.properties.productId;
      acc[product] = (acc[product] || 0) + 1;
      return acc;
    }, {});

  return Object.entries(productSales)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
}

function calculateCompletionRate(events) {
  const enrollments = events.filter(e => e.event === 'course_enrolled').length;
  const completions = events.filter(e => e.event === 'course_completed').length;
  return enrollments > 0 ? (completions / enrollments) * 100 : 0;
}

module.exports = router;