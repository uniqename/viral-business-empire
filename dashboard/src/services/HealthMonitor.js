const axios = require('axios');

class HealthMonitor {
  constructor(io) {
    this.io = io;
    this.platforms = {
      'shared-services': { 
        url: 'http://localhost:3000/health',
        status: 'unknown',
        lastCheck: null,
        uptime: 0,
        errors: []
      },
      'mobile-app': { 
        url: 'http://localhost:3000/health',
        status: 'unknown',
        lastCheck: null,
        uptime: 0,
        errors: []
      },
      'youtube-automation': { 
        url: 'http://localhost:3001/health',
        status: 'unknown',
        lastCheck: null,
        uptime: 0,
        errors: []
      },
      'print-on-demand': { 
        url: 'http://localhost:3002/health',
        status: 'unknown',
        lastCheck: null,
        uptime: 0,
        errors: []
      },
      'online-course': { 
        url: 'http://localhost:3003/health',
        status: 'unknown',
        lastCheck: null,
        uptime: 0,
        errors: []
      },
      'automation-orchestrator': { 
        url: 'http://localhost:4000/health',
        status: 'unknown',
        lastCheck: null,
        uptime: 0,
        errors: []
      }
    };
    
    this.systemMetrics = {
      overallHealth: 'unknown',
      healthyPlatforms: 0,
      totalPlatforms: Object.keys(this.platforms).length,
      uptime: Date.now(),
      lastIncident: null,
      incidents: []
    };

    this.alertThresholds = {
      responseTime: 5000, // 5 seconds
      errorRate: 0.1, // 10%
      downtime: 60000 // 1 minute
    };

    this.isMonitoring = false;
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🔍 Starting health monitoring...');

    // Check health every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, 30 * 1000);

    // Detailed system check every 5 minutes
    this.systemCheckInterval = setInterval(() => {
      this.performSystemCheck();
    }, 5 * 60 * 1000);

    // Initial health check
    this.performHealthChecks();
  }

  async performHealthChecks() {
    console.log('🔍 Performing health checks...');
    
    const checkPromises = Object.entries(this.platforms).map(async ([platform, config]) => {
      return await this.checkPlatformHealth(platform, config);
    });

    await Promise.all(checkPromises);
    this.updateSystemHealth();
    this.emitHealthUpdate();
  }

  async checkPlatformHealth(platform, config) {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(config.url, {
        timeout: this.alertThresholds.responseTime,
        validateStatus: (status) => status < 500
      });

      const responseTime = Date.now() - startTime;
      const isHealthy = response.status === 200 && response.data.status === 'healthy';

      // Update platform status
      this.platforms[platform] = {
        ...config,
        status: isHealthy ? 'healthy' : 'degraded',
        lastCheck: new Date().toISOString(),
        responseTime,
        uptime: isHealthy ? config.uptime + 30 : 0, // Reset uptime if unhealthy
        lastResponse: response.data,
        errors: isHealthy ? [] : [...config.errors.slice(-4), {
          time: new Date().toISOString(),
          error: `Status: ${response.status}`,
          responseTime
        }]
      };

      // Alert if response time is slow
      if (responseTime > this.alertThresholds.responseTime) {
        this.recordIncident(platform, 'slow_response', `Response time: ${responseTime}ms`);
      }

    } catch (error) {
      // Platform is down or unreachable
      this.platforms[platform] = {
        ...config,
        status: 'down',
        lastCheck: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        uptime: 0,
        errors: [...config.errors.slice(-4), {
          time: new Date().toISOString(),
          error: error.message,
          responseTime: Date.now() - startTime
        }]
      };

      this.recordIncident(platform, 'platform_down', error.message);
      console.error(`❌ ${platform} health check failed:`, error.message);
    }
  }

  updateSystemHealth() {
    const platformStatuses = Object.values(this.platforms);
    const healthyCount = platformStatuses.filter(p => p.status === 'healthy').length;
    const downCount = platformStatuses.filter(p => p.status === 'down').length;
    const degradedCount = platformStatuses.filter(p => p.status === 'degraded').length;

    // Determine overall system health
    let overallHealth = 'healthy';
    if (downCount > 0) {
      overallHealth = downCount >= 2 ? 'critical' : 'degraded';
    } else if (degradedCount > 0) {
      overallHealth = 'degraded';
    }

    this.systemMetrics = {
      ...this.systemMetrics,
      overallHealth,
      healthyPlatforms: healthyCount,
      platformCounts: {
        healthy: healthyCount,
        degraded: degradedCount,
        down: downCount
      },
      lastUpdate: new Date().toISOString()
    };

    // Emit critical alerts
    if (overallHealth === 'critical') {
      this.io.emit('critical-alert', {
        message: `CRITICAL: ${downCount} platforms are down!`,
        platforms: Object.entries(this.platforms)
          .filter(([, config]) => config.status === 'down')
          .map(([name]) => name)
      });
    }
  }

  async performSystemCheck() {
    console.log('🔧 Performing detailed system check...');
    
    // Check automation workflows
    await this.checkAutomationHealth();
    
    // Check revenue flow
    await this.checkRevenueHealth();
    
    // Check AI services
    await this.checkAIServicesHealth();
    
    // Generate health report
    const report = await this.generateHealthReport();
    this.io.emit('health-report', report);
  }

  async checkAutomationHealth() {
    try {
      const response = await axios.get('http://localhost:4000/status', { timeout: 5000 });
      
      if (response.data.success) {
        const workflowStatuses = response.data.status;
        
        // Check if any workflows are failing
        Object.entries(workflowStatuses).forEach(([workflow, status]) => {
          if (status.status === 'error') {
            this.recordIncident('automation', 'workflow_error', `${workflow} workflow failed`);
          }
        });
      }
    } catch (error) {
      this.recordIncident('automation', 'automation_check_failed', error.message);
    }
  }

  async checkRevenueHealth() {
    try {
      // Check if revenue is flowing (at least some activity in last 24h)
      const response = await axios.get('http://localhost:3000/api/analytics/revenue/all', { timeout: 5000 });
      
      if (response.data.success && response.data.revenue.total === 0) {
        this.recordIncident('revenue', 'no_revenue_flow', 'No revenue recorded in recent period');
      }
    } catch (error) {
      this.recordIncident('revenue', 'revenue_check_failed', error.message);
    }
  }

  async checkAIServicesHealth() {
    try {
      // Test AI service with a simple request
      const response = await axios.post('http://localhost:3000/api/ai/generate-content', {
        platform: 'test',
        type: 'health-check',
        prompt: 'Say "healthy" if you are working properly.',
        parameters: { maxTokens: 10 }
      }, { timeout: 10000 });

      if (!response.data.success) {
        this.recordIncident('ai-services', 'ai_not_responding', 'AI services not generating content');
      }
    } catch (error) {
      this.recordIncident('ai-services', 'ai_check_failed', error.message);
    }
  }

  recordIncident(platform, type, description) {
    const incident = {
      id: `${platform}_${Date.now()}`,
      platform,
      type,
      description,
      timestamp: new Date().toISOString(),
      severity: this.calculateSeverity(type),
      resolved: false
    };

    this.systemMetrics.incidents.unshift(incident);
    this.systemMetrics.incidents = this.systemMetrics.incidents.slice(0, 50); // Keep last 50 incidents
    this.systemMetrics.lastIncident = incident;

    // Emit real-time alert
    this.io.emit('new-incident', incident);
    
    console.log(`🚨 Incident recorded: ${platform} - ${description}`);
  }

  calculateSeverity(type) {
    const severityMap = {
      'platform_down': 'high',
      'workflow_error': 'high',
      'no_revenue_flow': 'medium',
      'slow_response': 'low',
      'ai_not_responding': 'high'
    };

    return severityMap[type] || 'medium';
  }

  async generateHealthReport() {
    const report = {
      timestamp: new Date().toISOString(),
      systemHealth: this.systemMetrics,
      platformDetails: this.platforms,
      recommendations: this.generateRecommendations(),
      uptime: ((Date.now() - this.systemMetrics.uptime) / (1000 * 60 * 60)).toFixed(2) + ' hours'
    };

    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    // Check for platforms that are down
    Object.entries(this.platforms).forEach(([platform, config]) => {
      if (config.status === 'down') {
        recommendations.push({
          type: 'critical',
          message: `Restart ${platform} service immediately`,
          action: `Check logs and restart service for ${platform}`
        });
      } else if (config.status === 'degraded') {
        recommendations.push({
          type: 'warning',
          message: `Monitor ${platform} - showing degraded performance`,
          action: `Review ${platform} logs and check resource usage`
        });
      }
    });

    // Check incident patterns
    const recentIncidents = this.systemMetrics.incidents.slice(0, 10);
    const frequentPlatforms = {};
    
    recentIncidents.forEach(incident => {
      frequentPlatforms[incident.platform] = (frequentPlatforms[incident.platform] || 0) + 1;
    });

    Object.entries(frequentPlatforms).forEach(([platform, count]) => {
      if (count >= 3) {
        recommendations.push({
          type: 'warning',
          message: `${platform} has ${count} recent incidents - investigate root cause`,
          action: `Deep dive into ${platform} stability and performance`
        });
      }
    });

    return recommendations;
  }

  // Manual controls
  async restartPlatform(platform) {
    console.log(`🔄 Manual restart requested for ${platform}`);
    
    // In production, this would trigger actual service restart
    // For now, mark as restarting and then healthy
    this.platforms[platform].status = 'restarting';
    this.emitHealthUpdate();

    // Simulate restart time
    setTimeout(() => {
      this.platforms[platform].status = 'healthy';
      this.platforms[platform].uptime = 0;
      this.platforms[platform].errors = [];
      this.emitHealthUpdate();
      
      this.io.emit('platform-restarted', { platform });
    }, 5000);
  }

  emitHealthUpdate() {
    this.io.emit('health-update', {
      systemHealth: this.systemMetrics,
      platforms: this.platforms
    });
  }

  // Public getters
  getCurrentStatus() {
    return {
      system: this.systemMetrics,
      platforms: this.platforms
    };
  }

  getSystemHealth() {
    return this.systemMetrics;
  }

  stopMonitoring() {
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
    if (this.systemCheckInterval) clearInterval(this.systemCheckInterval);
    this.isMonitoring = false;
    console.log('🛑 Health monitoring stopped');
  }
}

module.exports = HealthMonitor;