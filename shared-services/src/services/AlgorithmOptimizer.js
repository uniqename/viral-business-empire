const axios = require('axios');

class AlgorithmOptimizer {
  constructor() {
    this.platforms = {
      youtube: {
        name: 'YouTube',
        algorithm: 'engagement_and_watch_time',
        optimization_factors: {
          title: 40,
          thumbnail: 25,
          first_15_seconds: 20,
          engagement: 15
        }
      },
      tiktok: {
        name: 'TikTok',
        algorithm: 'completion_rate_and_engagement',
        optimization_factors: {
          first_3_seconds: 50,
          completion_rate: 30,
          engagement: 20
        }
      },
      instagram: {
        name: 'Instagram',
        algorithm: 'relationship_and_engagement',
        optimization_factors: {
          engagement_rate: 40,
          hashtags: 25,
          timing: 20,
          visual_quality: 15
        }
      },
      app_store: {
        name: 'App Store',
        algorithm: 'keyword_relevance_and_ratings',
        optimization_factors: {
          app_title: 35,
          keywords: 25,
          ratings: 25,
          screenshots: 15
        }
      },
      google_play: {
        name: 'Google Play',
        algorithm: 'downloads_and_ratings',
        optimization_factors: {
          title: 30,
          description: 25,
          ratings: 25,
          install_rate: 20
        }
      }
    };

    this.viral_triggers = {
      psychological: {
        curiosity: ['secret', 'hidden', 'revealed', 'exposed', 'truth behind'],
        urgency: ['limited time', 'before it\'s too late', 'last chance', 'ending soon'],
        social_proof: ['millions use', 'everyone\'s talking', 'trending now', 'viral'],
        exclusivity: ['insider secret', 'VIP access', 'members only', 'exclusive'],
        transformation: ['life-changing', 'game-changer', 'revolutionary', 'breakthrough']
      },
      emotional: {
        excitement: ['amazing', 'incredible', 'insane', 'mind-blowing', 'shocking'],
        fear_of_missing_out: ['don\'t miss', 'limited offer', 'while supplies last'],
        achievement: ['master', 'become expert', 'level up', 'transform'],
        controversy: ['truth they hide', 'what they don\'t want you to know', 'industry secret']
      }
    };

    this.trending_patterns = {
      2024: {
        youtube: ['AI tutorials', 'productivity hacks', 'side hustles', 'morning routines', 'life optimization'],
        tiktok: ['aesthetic content', 'life hacks', 'transformation videos', 'day in my life', 'tutorials'],
        instagram: ['carousel posts', 'behind the scenes', 'tutorials', 'quotes', 'before/after'],
        fitness: ['home workouts', 'quick routines', '30-day challenges', 'body transformations'],
        business: ['AI automation', 'passive income', 'digital products', 'online courses', 'remote work']
      }
    };
  }

  // Optimize content for specific platforms
  async optimizeForPlatform(content, platform, contentType = 'video') {
    const platformConfig = this.platforms[platform];
    if (!platformConfig) {
      throw new Error(`Platform ${platform} not supported`);
    }

    const optimizations = {
      original: content,
      platform: platform,
      optimized: {},
      score: 0,
      improvements: []
    };

    switch (platform) {
      case 'youtube':
        optimizations.optimized = this.optimizeForYouTube(content);
        break;
      case 'tiktok':
        optimizations.optimized = this.optimizeForTikTok(content);
        break;
      case 'instagram':
        optimizations.optimized = this.optimizeForInstagram(content);
        break;
      case 'app_store':
        optimizations.optimized = this.optimizeForAppStore(content);
        break;
      case 'google_play':
        optimizations.optimized = this.optimizeForGooglePlay(content);
        break;
      default:
        optimizations.optimized = content;
    }

    optimizations.score = this.calculateViralScore(optimizations.optimized, platform);
    optimizations.improvements = this.getImprovementSuggestions(optimizations.optimized, platform);

    return optimizations;
  }

  optimizeForYouTube(content) {
    return {
      ...content,
      title: this.optimizeTitle(content.title, 'youtube'),
      description: this.optimizeDescription(content.description, 'youtube'),
      tags: this.generateOptimalTags(content.topic, 'youtube'),
      thumbnail: {
        style: 'high_contrast_emotional',
        elements: ['shocked face', 'bold text', 'bright colors', 'arrows'],
        text_overlay: this.extractKeyPhrase(content.title),
        colors: ['#FF0000', '#FFFF00', '#00FF00'] // High contrast colors
      },
      video_optimization: {
        hook_length: '15 seconds',
        retention_strategy: 'payoff every 2 minutes',
        engagement_prompts: ['like if you agree', 'comment your thoughts', 'subscribe for more'],
        end_screen: 'subscribe + suggest next video',
        ideal_length: '8-12 minutes for max watch time'
      },
      posting_strategy: {
        best_times: ['2-4 PM EST', '7-9 PM EST'],
        frequency: '3-4 videos per week',
        consistency: 'same day/time weekly'
      }
    };
  }

  optimizeForTikTok(content) {
    return {
      ...content,
      title: this.optimizeTitle(content.title, 'tiktok'),
      description: this.optimizeDescription(content.description, 'tiktok'),
      hashtags: this.generateOptimalHashtags(content.topic, 'tiktok'),
      video_optimization: {
        hook_length: '3 seconds',
        ideal_length: '15-30 seconds',
        format: 'vertical 9:16',
        captions: 'auto-generated + manual review',
        music: 'trending audio essential',
        effects: 'trending filters/effects'
      },
      content_strategy: {
        trend_participation: 'use trending sounds/challenges',
        duets_stitches: 'enable for virality',
        posting_frequency: '3-5 times daily',
        peak_times: ['6-10 AM', '7-9 PM EST']
      }
    };
  }

  optimizeForAppStore(content) {
    return {
      ...content,
      app_name: this.optimizeAppName(content.title),
      subtitle: this.optimizeSubtitle(content.description),
      keywords: this.generateAppStoreKeywords(content.topic),
      description: this.optimizeAppDescription(content.description),
      screenshots: {
        count: 10,
        strategy: 'benefit-focused, not feature-focused',
        captions: 'clear value propositions',
        order: 'most compelling first'
      },
      app_preview: {
        duration: '30 seconds max',
        focus: 'core value demonstration',
        no_loading_screens: true
      },
      ratings_strategy: {
        in_app_prompts: 'after positive interactions',
        timing: 'after user achievement',
        frequency: 'not more than 3 times per year'
      }
    };
  }

  optimizeTitle(title, platform) {
    const maxLengths = {
      youtube: 60,
      tiktok: 40,
      instagram: 50,
      app_store: 30
    };

    let optimized = title;
    const maxLength = maxLengths[platform] || 60;

    // Add viral triggers if not present
    if (!this.hasViralTriggers(title)) {
      const trigger = this.selectRandomTrigger();
      optimized = `${trigger} ${title}`;
    }

    // Add platform-specific optimizations
    switch (platform) {
      case 'youtube':
        if (!optimized.includes('(') && !optimized.includes('[')) {
          optimized += ' (You Won\'t Believe This!)';
        }
        break;
      case 'tiktok':
        if (!optimized.startsWith('POV:') && !optimized.includes('#')) {
          optimized = `POV: ${optimized}`;
        }
        break;
    }

    // Truncate if too long
    if (optimized.length > maxLength) {
      optimized = optimized.substring(0, maxLength - 3) + '...';
    }

    return optimized;
  }

  optimizeDescription(description, platform) {
    const hooks = [
      "🔥 This is going VIRAL for a reason...",
      "💯 Everyone needs to see this!",
      "⚠️ WARNING: This will change your life!",
      "🚨 Don't scroll past this!",
      "✨ The secret everyone's talking about:"
    ];

    const randomHook = hooks[Math.floor(Math.random() * hooks.length)];
    
    let optimized = `${randomHook}\n\n${description}`;

    // Add platform-specific CTAs
    switch (platform) {
      case 'youtube':
        optimized += '\n\n🔔 SUBSCRIBE for more life-changing content!\n👍 LIKE if this helped you!\n💬 COMMENT your thoughts below!';
        break;
      case 'tiktok':
        optimized += '\n\n❤️ Double tap if you agree!\n💬 Comment "YES" if you want part 2!\n🔄 Share this with someone who needs to see it!';
        break;
      case 'instagram':
        optimized += '\n\n💝 Save this post for later!\n👥 Tag a friend who needs this!\n❤️ Like if you found this helpful!';
        break;
    }

    return optimized;
  }

  generateOptimalTags(topic, platform) {
    const baseTags = [topic, `${topic}2024`, `${topic}tutorial`, `${topic}tips`];
    
    const viralTags = {
      youtube: ['viral', 'trending', 'algorithm', 'fyp', 'recommended'],
      tiktok: ['fyp', 'foryou', 'viral', 'trending', 'algorithm'],
      instagram: ['reels', 'explore', 'viral', 'trending', 'algorithm']
    };

    const platformTags = viralTags[platform] || viralTags.youtube;
    
    return [...baseTags, ...platformTags, ...this.getTrendingKeywords2024()];
  }

  generateOptimalHashtags(topic, platform) {
    const baseHashtags = [`#${topic}`, `#${topic}2024`, `#${topic}tips`];
    
    const platformHashtags = {
      tiktok: ['#fyp', '#foryou', '#viral', '#trending', '#algorithm', '#explore'],
      instagram: ['#reels', '#explore', '#viral', '#trending', '#instagood', '#photooftheday'],
      youtube: ['#viral', '#trending', '#youtube', '#subscribe', '#like']
    };

    const trending2024 = ['#2024', '#ai', '#productivity', '#mindset', '#growth', '#success'];
    
    return [...baseHashtags, ...platformHashtags[platform], ...trending2024].slice(0, 30);
  }

  calculateViralScore(content, platform) {
    let score = 0;
    const factors = this.platforms[platform].optimization_factors;

    // Title score
    if (this.hasViralTriggers(content.title)) score += factors.title * 0.8;
    if (this.hasEmotionalWords(content.title)) score += factors.title * 0.2;

    // Engagement potential
    if (content.description && this.hasCallToAction(content.description)) {
      score += factors.engagement || 15;
    }

    // Thumbnail/visual score (if applicable)
    if (content.thumbnail && this.isHighContrastThumbnail(content.thumbnail)) {
      score += factors.thumbnail || 20;
    }

    // Platform-specific optimizations
    switch (platform) {
      case 'youtube':
        if (content.video_optimization && content.video_optimization.hook_length === '15 seconds') {
          score += 20;
        }
        break;
      case 'tiktok':
        if (content.video_optimization && content.video_optimization.hook_length === '3 seconds') {
          score += 30;
        }
        break;
    }

    return Math.min(score, 100); // Cap at 100
  }

  getImprovementSuggestions(content, platform) {
    const suggestions = [];

    if (!this.hasViralTriggers(content.title)) {
      suggestions.push('Add viral triggers to title (secret, shocking, amazing, etc.)');
    }

    if (!this.hasEmotionalWords(content.title)) {
      suggestions.push('Include emotional words in title');
    }

    if (!this.hasCallToAction(content.description)) {
      suggestions.push('Add strong call-to-action in description');
    }

    // Platform-specific suggestions
    switch (platform) {
      case 'youtube':
        suggestions.push('Optimize for 8+ minute watch time');
        suggestions.push('Include engagement prompts every 30 seconds');
        break;
      case 'tiktok':
        suggestions.push('Hook viewers in first 3 seconds');
        suggestions.push('Use trending audio');
        break;
      case 'app_store':
        suggestions.push('Focus screenshots on benefits, not features');
        suggestions.push('Use long-tail keywords in title');
        break;
    }

    return suggestions;
  }

  // Helper methods
  hasViralTriggers(text) {
    const allTriggers = [
      ...Object.values(this.viral_triggers.psychological).flat(),
      ...Object.values(this.viral_triggers.emotional).flat()
    ];
    return allTriggers.some(trigger => text.toLowerCase().includes(trigger.toLowerCase()));
  }

  hasEmotionalWords(text) {
    const emotions = ['amazing', 'incredible', 'shocking', 'unbelievable', 'insane', 'crazy', 'mind-blowing'];
    return emotions.some(emotion => text.toLowerCase().includes(emotion));
  }

  hasCallToAction(text) {
    const ctas = ['subscribe', 'like', 'comment', 'share', 'follow', 'save', 'tag'];
    return ctas.some(cta => text.toLowerCase().includes(cta));
  }

  selectRandomTrigger() {
    const allTriggers = [
      ...Object.values(this.viral_triggers.psychological).flat(),
      ...Object.values(this.viral_triggers.emotional).flat()
    ];
    return allTriggers[Math.floor(Math.random() * allTriggers.length)];
  }

  getTrendingKeywords2024() {
    return ['ai', 'productivity', 'hustle', 'mindset', 'growth', 'viral', 'trending'];
  }

  extractKeyPhrase(title) {
    const words = title.split(' ');
    return words.slice(0, 3).join(' ').toUpperCase();
  }

  // App Store specific optimizations
  optimizeAppName(title) {
    // Front-load main keyword, keep under 30 characters
    const keywords = ['Game', 'Fun', 'Puzzle', 'Challenge'];
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    return `${randomKeyword}: ${title}`.substring(0, 30);
  }

  optimizeSubtitle(description) {
    // Focus on main benefit in under 30 characters
    const benefits = ['Addictive Fun', 'Brain Challenge', 'Stress Relief', 'Quick Entertainment'];
    return benefits[Math.floor(Math.random() * benefits.length)];
  }

  generateAppStoreKeywords(topic) {
    return [
      topic,
      `${topic} game`,
      'fun',
      'addictive',
      'puzzle',
      'challenge',
      'entertainment',
      'time killer',
      'brain training',
      'casual game'
    ];
  }

  // Real-time trend analysis (mock implementation)
  async getTrendingTopics(platform) {
    // In production, this would connect to platform APIs
    return this.trending_patterns['2024'][platform] || [];
  }

  // Content scheduling optimization
  getOptimalPostingTimes(platform, timezone = 'EST') {
    const times = {
      youtube: ['2-4 PM', '7-9 PM'],
      tiktok: ['6-9 AM', '7-9 PM'],
      instagram: ['11 AM-1 PM', '5-7 PM'],
      general: ['9 AM', '12 PM', '5 PM', '7 PM']
    };

    return times[platform] || times.general;
  }
}

module.exports = AlgorithmOptimizer;