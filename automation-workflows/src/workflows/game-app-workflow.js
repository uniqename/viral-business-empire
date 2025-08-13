const axios = require('axios');

class GameAppWorkflow {
  constructor(logger) {
    this.logger = logger;
    this.apiBase = process.env.GAME_APP_URL || 'http://localhost:3005';
    this.status = 'ready';
    this.lastRun = null;
    this.metrics = {
      gamesGenerated: 0,
      gamesBuilt: 0,
      gamesPublished: 0,
      totalDownloads: 0,
      revenue: 0
    };
  }

  async execute(parameters = {}) {
    this.status = 'running';
    this.lastRun = new Date().toISOString();
    
    try {
      this.logger.info('Starting Game App automation workflow');

      // Step 1: Generate diverse game concepts
      const gameConfigs = await this.generateGameConfigs(parameters);

      // Step 2: Create games
      const gameResults = await this.createGames(gameConfigs);

      // Step 3: Build games for platforms
      const buildResults = await this.buildGames(gameResults);

      // Step 4: Publish games (mock for now)
      const publishResults = await this.publishGames(buildResults);

      // Step 5: Update metrics
      await this.trackMetrics(gameResults, buildResults, publishResults);

      this.status = 'completed';
      this.logger.info(`Game App workflow completed. Created ${gameResults.length} games`);

      return {
        success: true,
        gamesCreated: gameResults.length,
        gamesBuilt: buildResults.length,
        gamesPublished: publishResults.length,
        metrics: this.metrics
      };

    } catch (error) {
      this.status = 'error';
      this.logger.error(`Game App workflow error: ${error.message}`);
      throw error;
    }
  }

  async generateGameConfigs(parameters = {}) {
    const gameTypes = [
      { genre: 'puzzle', complexity: 'simple', theme: 'match-3', targetAge: '8+', monetization: 'ads' },
      { genre: 'arcade', complexity: 'simple', theme: 'runner', targetAge: '13+', monetization: 'freemium' },
      { genre: 'casual', complexity: 'medium', theme: 'simulation', targetAge: '16+', monetization: 'premium' },
      { genre: 'action', complexity: 'simple', theme: 'shooter', targetAge: '13+', monetization: 'ads' },
      { genre: 'strategy', complexity: 'medium', theme: 'tower-defense', targetAge: '16+', monetization: 'freemium' }
    ];

    const gameConfigs = [];

    for (const config of gameTypes) {
      try {
        this.logger.info(`Generating ${config.genre} game concept`);

        const response = await axios.get(`${this.apiBase}/api/games/concepts/${config.genre}`);

        if (response.data.success) {
          const selectedConcept = response.data.concepts[0]; // Take first concept
          gameConfigs.push({
            ...config,
            concept: selectedConcept,
            generatedAt: new Date().toISOString()
          });
          
          this.logger.info(`Generated ${config.genre} concept: ${selectedConcept.title}`);
        }
      } catch (error) {
        this.logger.error(`Game concept generation error for ${config.genre}: ${error.message}`);
      }
    }

    return gameConfigs;
  }

  async createGames(gameConfigs) {
    const gameResults = [];

    for (const config of gameConfigs) {
      try {
        this.logger.info(`Creating game: ${config.concept.title}`);

        const response = await axios.post(`${this.apiBase}/api/games/generate`, config);

        if (response.data.success) {
          gameResults.push({
            ...response.data,
            config,
            createdAt: new Date().toISOString()
          });
          
          this.metrics.gamesGenerated++;
        }
      } catch (error) {
        this.logger.error(`Game creation error for "${config.concept.title}": ${error.message}`);
      }
    }

    return gameResults;
  }

  async buildGames(gameResults) {
    const buildResults = [];
    const platforms = ['android', 'ios', 'web'];

    for (const game of gameResults) {
      for (const platform of platforms) {
        try {
          this.logger.info(`Building ${game.game.title} for ${platform}`);

          const response = await axios.post(`${this.apiBase}/api/games/build/${game.game.id}`, {
            platform,
            buildType: 'release'
          });

          if (response.data.success) {
            buildResults.push({
              ...response.data.build,
              game: game.game,
              platform,
              builtAt: new Date().toISOString()
            });
            
            this.metrics.gamesBuilt++;
          }
        } catch (error) {
          this.logger.error(`Build error for "${game.game.title}" on ${platform}: ${error.message}`);
        }
      }
    }

    return buildResults;
  }

  async publishGames(buildResults) {
    const publishResults = [];

    for (const build of buildResults) {
      try {
        // Mock publishing for now - in production, integrate with app stores
        const mockPublish = {
          gameId: build.game.id,
          platform: build.platform,
          storeUrl: `https://play.google.com/store/apps/details?id=com.scalablebusiness.${build.game.id}`,
          status: 'published',
          publishedAt: new Date().toISOString(),
          title: build.game.title
        };

        publishResults.push(mockPublish);
        this.metrics.gamesPublished++;
        
        this.logger.info(`Mock published: ${build.game.title} on ${build.platform}`);
      } catch (error) {
        this.logger.error(`Publish error for "${build.game.title}": ${error.message}`);
      }
    }

    return publishResults;
  }

  async trackMetrics(gameResults, buildResults, publishResults) {
    try {
      await axios.post('http://localhost:3000/api/analytics/track', {
        platform: 'game-app',
        userId: 'system',
        event: 'game_workflow_completed',
        properties: {
          gamesGenerated: gameResults.length,
          gamesBuilt: buildResults.length,
          gamesPublished: publishResults.length,
          genres: gameResults.map(g => g.config.genre),
          platforms: [...new Set(buildResults.map(b => b.platform))],
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      this.logger.error(`Game analytics tracking error: ${error.message}`);
    }
  }

  async getDailyMetrics() {
    return {
      platform: 'game-app',
      gamesGenerated: this.metrics.gamesGenerated,
      gamesBuilt: this.metrics.gamesBuilt,
      gamesPublished: this.metrics.gamesPublished,
      totalDownloads: this.metrics.totalDownloads,
      revenue: this.metrics.revenue,
      contentCreated: this.metrics.gamesGenerated,
      activeUsers: 1,
      lastRun: this.lastRun
    };
  }

  getStatus() {
    return {
      status: this.status,
      lastRun: this.lastRun,
      metrics: this.metrics,
      platform: 'game-app'
    };
  }
}

module.exports = GameAppWorkflow;