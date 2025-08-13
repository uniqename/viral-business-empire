const axios = require('axios');
const Stripe = require('stripe');

class RevenueService {
  constructor(io) {
    this.io = io;
    this.stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    this.revenueStats = {
      total: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      platforms: {
        'mobile-app': { revenue: 0, transactions: 0 },
        'youtube': { revenue: 0, views: 0 },
        'print-on-demand': { revenue: 0, orders: 0 },
        'online-course': { revenue: 0, enrollments: 0 }
      }
    };
    this.payoutQueue = [];
    this.isTracking = false;
  }

  startRevenueTracking() {
    if (this.isTracking) return;
    
    this.isTracking = true;
    console.log('🔄 Starting revenue tracking...');

    // Update revenue every 5 minutes
    setInterval(() => {
      this.updateRevenueData();
    }, 5 * 60 * 1000);

    // Check for automatic payouts every hour
    setInterval(() => {
      this.processAutomaticPayouts();
    }, 60 * 60 * 1000);

    // Initial update
    this.updateRevenueData();
  }

  async updateRevenueData() {
    try {
      console.log('📊 Updating revenue data...');
      
      // Fetch revenue from all platforms
      const platforms = ['mobile-app', 'youtube', 'print-on-demand', 'online-course'];
      
      for (const platform of platforms) {
        try {
          const platformRevenue = await this.getPlatformRevenue(platform);
          this.revenueStats.platforms[platform] = platformRevenue;
        } catch (error) {
          console.error(`Revenue fetch error for ${platform}:`, error.message);
        }
      }

      // Calculate totals
      this.calculateTotals();
      
      // Get Stripe balance
      const stripeBalance = await this.getStripeBalance();
      this.revenueStats.availableBalance = stripeBalance.available;
      this.revenueStats.pendingBalance = stripeBalance.pending;

      // Emit updated data to dashboard
      this.io.emit('revenue-update', this.revenueStats);
      
      console.log(`💰 Total Revenue: $${this.revenueStats.total}`);
      
    } catch (error) {
      console.error('Revenue update error:', error);
    }
  }

  async getPlatformRevenue(platform) {
    const platformUrls = {
      'mobile-app': 'http://localhost:3000',
      'youtube': 'http://localhost:3001',
      'print-on-demand': 'http://localhost:3002', 
      'online-course': 'http://localhost:3003'
    };

    try {
      const response = await axios.get(`${platformUrls[platform]}/api/revenue`, {
        timeout: 5000
      });
      
      return response.data.revenue || { revenue: 0, transactions: 0 };
    } catch (error) {
      // Mock data for development
      return this.generateMockRevenue(platform);
    }
  }

  generateMockRevenue(platform) {
    // Generate realistic mock revenue data
    const baseAmounts = {
      'mobile-app': Math.random() * 500 + 100,
      'youtube': Math.random() * 800 + 200,
      'print-on-demand': Math.random() * 1200 + 300,
      'online-course': Math.random() * 2000 + 500
    };

    const amount = baseAmounts[platform] || 0;
    
    return {
      revenue: Math.round(amount * 100) / 100,
      transactions: Math.floor(amount / 25),
      growth: (Math.random() - 0.5) * 20 // -10% to +10% growth
    };
  }

  calculateTotals() {
    let totalRevenue = 0;
    
    Object.values(this.revenueStats.platforms).forEach(platform => {
      totalRevenue += platform.revenue || 0;
    });

    this.revenueStats.total = Math.round(totalRevenue * 100) / 100;
    this.revenueStats.today = Math.round(totalRevenue * 0.1 * 100) / 100; // 10% assumed daily
    this.revenueStats.thisWeek = Math.round(totalRevenue * 0.3 * 100) / 100; // 30% weekly
    this.revenueStats.thisMonth = totalRevenue;
  }

  async getStripeBalance() {
    try {
      const balance = await this.stripe.balance.retrieve();
      
      return {
        available: balance.available.reduce((sum, b) => sum + b.amount, 0) / 100,
        pending: balance.pending.reduce((sum, b) => sum + b.amount, 0) / 100,
        currency: balance.available[0]?.currency || 'usd'
      };
    } catch (error) {
      console.error('Stripe balance error:', error);
      return { available: 0, pending: 0, currency: 'usd' };
    }
  }

  async triggerPayout(payoutData) {
    try {
      const { amount, destination, platform } = payoutData;
      
      console.log(`💸 Processing payout: $${amount} to ${destination}`);

      // Create Stripe payout
      const payout = await this.stripe.payouts.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        method: 'instant',
        description: `Payout from ${platform} platform`
      });

      const payoutRecord = {
        id: payout.id,
        amount,
        destination,
        platform,
        status: payout.status,
        estimatedArrival: new Date(payout.arrival_date * 1000),
        createdAt: new Date()
      };

      // Add to payout queue for tracking
      this.payoutQueue.push(payoutRecord);

      // Emit payout success
      this.io.emit('payout-success', payoutRecord);

      console.log(`✅ Payout created: ${payout.id}`);
      
      return {
        success: true,
        payout: payoutRecord
      };

    } catch (error) {
      console.error('Payout error:', error);
      
      // Emit payout error
      this.io.emit('payout-error', { error: error.message });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async processAutomaticPayouts() {
    console.log('🔄 Checking for automatic payouts...');
    
    // Auto-payout if total available balance > $500
    if (this.revenueStats.availableBalance > 500) {
      try {
        await this.triggerPayout({
          amount: this.revenueStats.availableBalance * 0.9, // Keep 10% as buffer
          destination: 'bank_account',
          platform: 'auto-payout'
        });
        
        console.log('✅ Automatic payout processed');
      } catch (error) {
        console.error('Auto-payout failed:', error);
      }
    }
  }

  // Revenue analytics and reporting
  async generateRevenueReport(timeframe = '30d') {
    const report = {
      timeframe,
      generatedAt: new Date().toISOString(),
      summary: {
        totalRevenue: this.revenueStats.total,
        platformBreakdown: this.revenueStats.platforms,
        topPlatform: this.getTopPlatform(),
        growthRate: this.calculateGrowthRate()
      },
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  getTopPlatform() {
    let topPlatform = null;
    let topRevenue = 0;

    Object.entries(this.revenueStats.platforms).forEach(([platform, data]) => {
      if (data.revenue > topRevenue) {
        topRevenue = data.revenue;
        topPlatform = platform;
      }
    });

    return { platform: topPlatform, revenue: topRevenue };
  }

  calculateGrowthRate() {
    // Mock growth calculation - in production, compare with historical data
    return Math.random() * 30 + 5; // 5-35% growth
  }

  generateRecommendations() {
    const recommendations = [];
    
    Object.entries(this.revenueStats.platforms).forEach(([platform, data]) => {
      if (data.revenue < 100) {
        recommendations.push(`Consider optimizing ${platform} - revenue below target`);
      }
      if (data.growth && data.growth > 10) {
        recommendations.push(`Scale up ${platform} - showing strong growth`);
      }
    });

    return recommendations;
  }

  // Public getters
  getCurrentStats() {
    return this.revenueStats;
  }

  getPayoutHistory() {
    return this.payoutQueue.slice(-10); // Last 10 payouts
  }

  async setupStripeWebhook() {
    // In production, set up webhook endpoints for real-time Stripe events
    console.log('Setting up Stripe webhooks...');
    
    // This would register webhook endpoints with Stripe
    // For events like: payment_intent.succeeded, payout.paid, etc.
  }
}

module.exports = RevenueService;