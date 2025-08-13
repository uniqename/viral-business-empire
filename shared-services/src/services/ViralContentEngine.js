const axios = require('axios');

class ViralContentEngine {
  constructor() {
    this.trendingKeywords = [];
    this.viralPatterns = {
      hooks: [
        "This will blow your mind...",
        "Nobody talks about this...", 
        "The secret that changed everything...",
        "What they don't want you to know...",
        "This simple trick...",
        "You won't believe what happened next...",
        "The mistake everyone makes...",
        "Why you're doing it wrong...",
        "The truth about...",
        "This changes everything..."
      ],
      emotions: [
        { emotion: 'curiosity', triggers: ['secret', 'hidden', 'revealed', 'exposed', 'truth'] },
        { emotion: 'urgency', triggers: ['now', 'today', 'immediately', 'before it\'s too late', 'limited time'] },
        { emotion: 'exclusivity', triggers: ['exclusive', 'insider', 'VIP', 'members only', 'private'] },
        { emotion: 'transformation', triggers: ['transform', 'change your life', 'breakthrough', 'revolution'] },
        { emotion: 'social_proof', triggers: ['millions use', 'trending', 'viral', 'everyone\'s talking', 'popular'] }
      ],
      formats: {
        youtube: {
          titles: [
            "I tried [TOPIC] for 30 days - Here's what happened",
            "The [TOPIC] method that changed my life",
            "[NUMBER] [TOPIC] hacks that actually work",
            "Why everyone is obsessed with [TOPIC]",
            "The [TOPIC] trend that's taking over",
            "[TOPIC]: The good, bad, and ugly truth"
          ],
          thumbnails: ['shocked_face', 'before_after', 'red_arrow', 'big_text', 'contrast_colors']
        },
        games: {
          concepts: [
            "Addictive one-tap gameplay that keeps you playing",
            "Satisfying mechanics that trigger dopamine hits", 
            "Simple but challenging progression systems",
            "Social competition and leaderboards",
            "Reward loops that create habit formation",
            "Visual effects that provide instant gratification"
          ]
        },
        courses: {
          hooks: [
            "Master [SKILL] in just [TIME] - Even if you're a complete beginner",
            "The [SKILL] course that pays for itself in [TIME]",
            "From zero to [RESULT] - The complete [SKILL] blueprint",
            "The [SKILL] secrets that [AUTHORITY] don't want you to know",
            "[SKILL] made simple - Start earning [RESULT] today"
          ]
        }
      }
    };
    
    this.algorithmOptimization = {
      youtube: {
        watchTime: 'Optimize for 8+ minute videos with high retention',
        engagement: 'Include questions, calls to action every 30 seconds',
        keywords: 'Use trending keywords in title, description, tags',
        timing: 'Post when your audience is most active',
        thumbnails: 'High contrast, emotional faces, bold text'
      },
      tiktok: {
        hooks: 'First 3 seconds determine everything',
        length: '15-30 seconds for maximum reach',
        music: 'Use trending audio and sounds',
        hashtags: 'Mix trending and niche hashtags',
        posting: 'Post 3-5 times daily at peak hours'
      },
      instagram: {
        reels: 'Short, vertical, trending audio',
        stories: 'Interactive stickers, polls, questions',
        posts: 'High-quality visuals, engaging captions',
        hashtags: 'Use 20-30 relevant hashtags'
      },
      appstore: {
        keywords: 'Target long-tail, low-competition keywords',
        screenshots: 'Show benefits, not just features',
        reviews: 'Encourage positive reviews with in-app prompts',
        description: 'Front-load benefits in first 2 lines'
      }
    };
  }

  async generateViralContent(platform, topic, audience) {
    const trendingData = await this.getTrendingData(topic);
    const viralElements = this.selectViralElements(platform, audience);
    
    return {
      title: this.createViralTitle(platform, topic, viralElements),
      hook: this.createViralHook(topic, viralElements),
      description: this.createViralDescription(platform, topic, viralElements),
      keywords: this.generateViralKeywords(topic, trendingData),
      hashtags: this.generateViralHashtags(topic, platform),
      callToAction: this.createViralCTA(platform, topic),
      thumbnailConcept: this.generateThumbnailConcept(topic, viralElements),
      algorithmTips: this.algorithmOptimization[platform] || {}
    };
  }

  async getTrendingData(topic) {
    // In production, this would connect to Google Trends, TikTok API, etc.
    const mockTrending = {
      keywords: [`${topic} 2024`, `${topic} hack`, `${topic} secret`, `${topic} method`],
      hashtags: [`#${topic}`, `#${topic}hack`, `#viral${topic}`, `#${topic}2024`],
      competitors: [`Top ${topic} creators`, `Viral ${topic} content`],
      searchVolume: Math.floor(Math.random() * 100000) + 10000
    };
    
    return mockTrending;
  }

  selectViralElements(platform, audience) {
    const hook = this.viralPatterns.hooks[Math.floor(Math.random() * this.viralPatterns.hooks.length)];
    const emotion = this.viralPatterns.emotions[Math.floor(Math.random() * this.viralPatterns.emotions.length)];
    const format = this.viralPatterns.formats[platform] || this.viralPatterns.formats.youtube;
    
    return { hook, emotion, format };
  }

  createViralTitle(platform, topic, elements) {
    const templates = {
      youtube: [
        `${elements.hook} ${topic} (${elements.emotion.triggers[0]})`,
        `This ${topic} hack is going VIRAL for a reason`,
        `${topic}: The method everyone's talking about`,
        `I tried the viral ${topic} trend - Results shocked me`,
        `Why ${topic} is trending everywhere right now`
      ],
      fitness: [
        `Get RIPPED with this ${topic} routine (NO GYM!)`,
        `${topic} transformation in 30 days (INSANE results)`,
        `This ${topic} workout is breaking the internet`,
        `The ${topic} secret fitness influencers use`,
        `${topic}: The workout that changed everything`
      ],
      business: [
        `How I made $10K+ with ${topic} (Step by step)`,
        `The ${topic} business model making people rich`,
        `${topic}: From $0 to $100K (My journey)`,
        `This ${topic} strategy generated $50K in 90 days`,
        `Why everyone's starting a ${topic} business`
      ],
      gaming: [
        `This ${topic} game is ADDICTIVE (Can't stop playing!)`,
        `${topic} - The game everyone's obsessed with`,
        `Why ${topic} is the #1 trending game`,
        `I played ${topic} for 24 hours straight`,
        `${topic}: The game that's taking over`
      ]
    };

    const platformTemplates = templates[platform] || templates.youtube;
    const selectedTemplate = platformTemplates[Math.floor(Math.random() * platformTemplates.length)];
    
    return selectedTemplate;
  }

  createViralHook(topic, elements) {
    const hooks = [
      `If you've ever struggled with ${topic}, this video will change your life.`,
      `What I'm about to show you about ${topic} is controversial, but it works.`,
      `This ${topic} method is so good, I almost didn't want to share it.`,
      `Everyone's doing ${topic} wrong - here's the right way.`,
      `I discovered this ${topic} secret by accident, and now I'm sharing it with you.`,
      `The ${topic} industry doesn't want you to know this, but I'm telling you anyway.`
    ];

    return hooks[Math.floor(Math.random() * hooks.length)];
  }

  createViralDescription(platform, topic, elements) {
    return `🔥 VIRAL ALERT: This ${topic} content is taking off!

${elements.hook} 

In this ${platform === 'youtube' ? 'video' : 'content'}, you'll discover:
✅ The SECRET ${topic} method that's trending everywhere
✅ Why 99% of people get ${topic} wrong (and how to do it right)  
✅ The exact step-by-step process I use
✅ Real results that speak for themselves

🚨 WARNING: This ${topic} technique is so effective, everyone will want to know your secret!

💰 Ready to transform your ${topic} game? Hit that ${platform === 'youtube' ? 'subscribe button' : 'follow button'} for more life-changing content!

${elements.emotion.triggers.map(t => `#${t.replace(/\s+/g, '')}`).join(' ')}

⏰ Don't wait - start your ${topic} transformation today!`;
  }

  generateViralKeywords(topic, trendingData) {
    const base = [topic, `${topic} 2024`, `${topic} tutorial`, `${topic} tips`];
    const viral = ['viral', 'trending', 'secret', 'hack', 'method', 'strategy'];
    const emotional = ['amazing', 'shocking', 'incredible', 'insane', 'crazy', 'mind-blowing'];
    
    return [...base, ...viral.map(v => `${topic} ${v}`), ...emotional.map(e => `${e} ${topic}`)];
  }

  generateViralHashtags(topic, platform) {
    const base = [`#${topic}`, `#${topic}2024`, `#${topic}tips`];
    
    const platformSpecific = {
      youtube: ['#viral', '#trending', '#tutorial', '#howto'],
      tiktok: ['#fyp', '#viral', '#trending', '#foryou', '#foryoupage'],
      instagram: ['#reels', '#viral', '#trending', '#explore', '#instagood'],
      fitness: ['#fitness', '#workout', '#gym', '#health', '#motivation', '#fitnessmotivation'],
      gaming: ['#gaming', '#gamer', '#games', '#mobile', '#addictive', '#fun'],
      business: ['#business', '#entrepreneur', '#success', '#money', '#wealth', '#hustle']
    };

    return [...base, ...(platformSpecific[platform] || platformSpecific.youtube)];
  }

  createViralCTA(platform, topic) {
    const ctas = {
      youtube: [
        "SMASH that subscribe button if this ${topic} video helped you!",
        "Want more ${topic} secrets? Subscribe and hit the notification bell!",
        "If you found this ${topic} method helpful, subscribe for weekly tips!",
        "Ready to master ${topic}? Subscribe and let's grow together!"
      ],
      general: [
        "Save this for your ${topic} journey!",
        "Share this with someone who needs to see it!",
        "Follow for daily ${topic} tips that actually work!",
        "Tag a friend who needs to know about ${topic}!"
      ]
    };

    const selectedCTAs = ctas[platform] || ctas.general;
    return selectedCTAs[Math.floor(Math.random() * selectedCTAs.length)].replace('${topic}', topic);
  }

  generateThumbnailConcept(topic, elements) {
    return {
      style: 'high_contrast_viral',
      elements: [
        'Shocked/excited facial expression',
        `Large text: "${topic.toUpperCase()}"`,
        'Bright colors (red, yellow, blue)',
        'Arrow pointing to key element',
        'Before/after visual if applicable',
        'Number callouts (steps, results, etc.)'
      ],
      psychology: 'Creates curiosity gap and emotional trigger',
      colors: ['#FF0000', '#FFFF00', '#00FF00', '#0066FF'],
      fonts: 'Bold, sans-serif, high contrast'
    };
  }

  // Algorithm optimization methods
  optimizeForYouTube(content) {
    return {
      ...content,
      idealLength: '8-12 minutes for maximum watch time',
      retention: 'Hook in first 15 seconds, payoff every 2 minutes',
      engagement: 'Ask questions every 30 seconds, encourage comments',
      endScreen: 'Subscribe CTA, suggest next video',
      cards: 'Strategic placement at high-retention points'
    };
  }

  optimizeForTikTok(content) {
    return {
      ...content,
      idealLength: '15-30 seconds',
      hook: 'Must grab attention in first 3 seconds',
      music: 'Use trending audio for algorithm boost',
      editing: 'Quick cuts, fast-paced, high energy',
      captions: 'Auto-generated captions for accessibility'
    };
  }

  optimizeForAppStore(content) {
    return {
      ...content,
      title: 'Front-load main keyword',
      subtitle: 'Focus on main benefit/emotion',
      keywords: 'Target long-tail, low-competition terms',
      screenshots: 'Show benefits, not just features',
      reviews: 'In-app prompts for 5-star reviews'
    };
  }

  // Get content performance predictions
  predictViralPotential(content, platform) {
    let score = 0;
    const factors = {
      emotional_trigger: this.hasEmotionalTrigger(content.title) ? 20 : 0,
      curiosity_gap: this.hasCuriosityGap(content.title) ? 25 : 0,
      trending_keywords: this.hasTrendingKeywords(content.keywords) ? 15 : 0,
      social_proof: this.hasSocialProof(content.description) ? 10 : 0,
      clear_benefit: this.hasClearBenefit(content.description) ? 15 : 0,
      call_to_action: content.callToAction ? 10 : 0,
      platform_optimization: this.isOptimizedForPlatform(content, platform) ? 5 : 0
    };

    score = Object.values(factors).reduce((a, b) => a + b, 0);

    return {
      score,
      rating: score >= 80 ? 'HIGH VIRAL POTENTIAL' : 
              score >= 60 ? 'GOOD VIRAL POTENTIAL' : 
              score >= 40 ? 'MODERATE VIRAL POTENTIAL' : 'LOW VIRAL POTENTIAL',
      factors,
      recommendations: this.getViralRecommendations(factors)
    };
  }

  hasEmotionalTrigger(title) {
    const triggers = ['shocking', 'amazing', 'secret', 'hidden', 'revealed', 'truth', 'insane', 'crazy'];
    return triggers.some(trigger => title.toLowerCase().includes(trigger));
  }

  hasCuriosityGap(title) {
    const gaps = ['what happened', 'you won\'t believe', 'this will', 'nobody knows', 'why you'];
    return gaps.some(gap => title.toLowerCase().includes(gap));
  }

  hasTrendingKeywords(keywords) {
    const trending = ['2024', 'viral', 'trending', 'hack', 'secret', 'method'];
    return keywords.some(keyword => trending.some(trend => keyword.toLowerCase().includes(trend)));
  }

  hasSocialProof(description) {
    const proof = ['everyone', 'millions', 'thousands', 'trending', 'viral', 'popular'];
    return proof.some(p => description.toLowerCase().includes(p));
  }

  hasClearBenefit(description) {
    const benefits = ['learn', 'discover', 'master', 'transform', 'change', 'improve', 'get'];
    return benefits.some(benefit => description.toLowerCase().includes(benefit));
  }

  isOptimizedForPlatform(content, platform) {
    // Check if content follows platform best practices
    return true; // Simplified for now
  }

  getViralRecommendations(factors) {
    const recs = [];
    if (!factors.emotional_trigger) recs.push('Add emotional triggers to title');
    if (!factors.curiosity_gap) recs.push('Create curiosity gap in title');
    if (!factors.trending_keywords) recs.push('Include trending keywords');
    if (!factors.social_proof) recs.push('Add social proof to description');
    if (!factors.clear_benefit) recs.push('Clarify main benefit');
    
    return recs;
  }
}

module.exports = ViralContentEngine;