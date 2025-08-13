const axios = require('axios');
const { createCanvas, loadImage, registerFont } = require('canvas');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class DesignGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '../../output/designs');
    this.templatesDir = path.join(__dirname, '../templates');
    this.assetsDir = path.join(__dirname, '../assets');
    
    // Design dimensions for different products
    this.productSizes = {
      't-shirt': { width: 3000, height: 3000 },
      'mug': { width: 2400, height: 1260 },
      'poster': { width: 3000, height: 4500 },
      'sticker': { width: 1000, height: 1000 },
      'phone-case': { width: 1500, height: 3000 },
      'tote-bag': { width: 3000, height: 3000 },
      'hoodie': { width: 3000, height: 3000 }
    };
  }

  async generateDesignIdeas(niche, style, count = 10) {
    try {
      const response = await axios.post('http://localhost:3000/api/ai/suggest-designs', {
        category: niche,
        style,
        colors: ['#000000', '#FFFFFF', '#FF6B6B', '#4ECDC4', '#45B7D1'],
        keywords: await this.getTrendingKeywords(niche)
      });

      return {
        success: true,
        ideas: response.data.suggestions,
        niche,
        style,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Design ideas generation error:', error);
      return { success: false, error: error.message };
    }
  }

  async createTextBasedDesign(options) {
    const {
      text,
      productType = 't-shirt',
      style = 'modern',
      colors = ['#000000', '#FFFFFF'],
      font = 'Arial',
      layout = 'center'
    } = options;

    try {
      const size = this.productSizes[productType];
      const canvas = createCanvas(size.width, size.height);
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = colors[1] || '#FFFFFF';
      ctx.fillRect(0, 0, size.width, size.height);

      // Apply style-specific design
      await this.applyDesignStyle(ctx, style, size, colors);

      // Add main text
      await this.addStyledText(ctx, text, {
        size,
        font,
        color: colors[0] || '#000000',
        layout,
        style
      });

      // Save design
      const designId = uuidv4();
      const fileName = `design_${designId}.png`;
      const designPath = path.join(this.outputDir, fileName);
      
      await fs.mkdir(path.dirname(designPath), { recursive: true });
      const buffer = canvas.toBuffer('image/png');
      await fs.writeFile(designPath, buffer);

      // Generate mockups for different products
      const mockups = await this.generateMockups(designPath, productType);

      return {
        success: true,
        designId,
        designPath,
        fileName,
        mockups,
        metadata: {
          text,
          productType,
          style,
          colors,
          dimensions: size
        }
      };
    } catch (error) {
      console.error('Text design creation error:', error);
      return { success: false, error: error.message };
    }
  }

  async createAIGeneratedDesign(prompt, productType = 't-shirt') {
    try {
      // Generate image using DALL-E through shared services
      const response = await axios.post('http://localhost:3000/api/ai/generate-image', {
        prompt: `${prompt}, ${productType} design, high quality, commercial use, transparent background`,
        size: '1024x1024',
        quality: 'hd'
      });

      if (response.data.success) {
        // Download and process the generated image
        const imageResponse = await axios.get(response.data.imageUrl, {
          responseType: 'arraybuffer'
        });

        const designId = uuidv4();
        const fileName = `ai_design_${designId}.png`;
        const designPath = path.join(this.outputDir, fileName);

        // Process image to fit product dimensions
        const size = this.productSizes[productType];
        const processedImage = await sharp(Buffer.from(imageResponse.data))
          .resize(size.width, size.height, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
          .png()
          .toBuffer();

        await fs.mkdir(path.dirname(designPath), { recursive: true });
        await fs.writeFile(designPath, processedImage);

        // Generate mockups
        const mockups = await this.generateMockups(designPath, productType);

        return {
          success: true,
          designId,
          designPath,
          fileName,
          mockups,
          metadata: {
            prompt,
            productType,
            aiGenerated: true,
            dimensions: size
          }
        };
      }
    } catch (error) {
      console.error('AI design creation error:', error);
      return { success: false, error: error.message };
    }
  }

  async applyDesignStyle(ctx, style, size, colors) {
    switch (style) {
      case 'minimalist':
        // Clean, simple background
        ctx.fillStyle = colors[1] || '#FFFFFF';
        ctx.fillRect(0, 0, size.width, size.height);
        break;

      case 'vintage':
        // Vintage texture and colors
        ctx.fillStyle = '#F4F1E8';
        ctx.fillRect(0, 0, size.width, size.height);
        this.addVintageTexture(ctx, size);
        break;

      case 'modern':
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, size.width, size.height);
        gradient.addColorStop(0, colors[0] || '#000000');
        gradient.addColorStop(1, colors[1] || '#FFFFFF');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size.width, size.height);
        break;

      case 'geometric':
        // Geometric patterns
        ctx.fillStyle = colors[1] || '#FFFFFF';
        ctx.fillRect(0, 0, size.width, size.height);
        this.addGeometricPattern(ctx, size, colors[0] || '#000000');
        break;

      default:
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size.width, size.height);
    }
  }

  async addStyledText(ctx, text, options) {
    const { size, font, color, layout, style: designStyle } = options;

    // Set font properties
    const fontSize = Math.min(size.width, size.height) * 0.1;
    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px ${font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Add text effects based on style
    switch (designStyle) {
      case 'vintage':
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        break;
      
      case 'modern':
        ctx.strokeStyle = color === '#FFFFFF' ? '#000000' : '#FFFFFF';
        ctx.lineWidth = fontSize * 0.02;
        break;
    }

    // Position text based on layout
    let x = size.width / 2;
    let y = size.height / 2;

    if (layout === 'top') {
      y = size.height * 0.25;
    } else if (layout === 'bottom') {
      y = size.height * 0.75;
    }

    // Wrap text if too long
    const lines = this.wrapText(ctx, text, size.width * 0.8);
    const lineHeight = fontSize * 1.2;
    const startY = y - (lines.length - 1) * lineHeight / 2;

    lines.forEach((line, index) => {
      const lineY = startY + index * lineHeight;
      if (ctx.strokeStyle && designStyle === 'modern') {
        ctx.strokeText(line, x, lineY);
      }
      ctx.fillText(line, x, lineY);
    });
  }

  addVintageTexture(ctx, size) {
    // Add vintage noise texture
    const imageData = ctx.getImageData(0, 0, size.width, size.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 30;
      data[i] += noise;     // Red
      data[i + 1] += noise; // Green  
      data[i + 2] += noise; // Blue
    }

    ctx.putImageData(imageData, 0, 0);
  }

  addGeometricPattern(ctx, size, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;

    // Draw geometric shapes
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * size.width;
      const y = Math.random() * size.height;
      const radius = Math.random() * 100 + 20;

      ctx.beginPath();
      if (Math.random() > 0.5) {
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
      } else {
        ctx.rect(x - radius, y - radius, radius * 2, radius * 2);
      }
      ctx.stroke();
    }
  }

  async generateMockups(designPath, productType) {
    const mockups = [];
    const mockupTemplates = {
      't-shirt': ['tshirt_front.png', 'tshirt_back.png'],
      'mug': ['mug_white.png', 'mug_black.png'],
      'poster': ['poster_frame.png'],
      'hoodie': ['hoodie_front.png', 'hoodie_back.png']
    };

    const templates = mockupTemplates[productType] || ['generic.png'];

    for (const template of templates) {
      try {
        const mockupId = uuidv4();
        const mockupFileName = `mockup_${mockupId}.png`;
        const mockupPath = path.join(this.outputDir, '../mockups', mockupFileName);

        // For now, just copy the design as mockup
        // In production, you'd overlay on actual product templates
        await fs.mkdir(path.dirname(mockupPath), { recursive: true });
        await fs.copyFile(designPath, mockupPath);

        mockups.push({
          id: mockupId,
          path: mockupPath,
          fileName: mockupFileName,
          template,
          productType
        });
      } catch (error) {
        console.error(`Mockup generation error for ${template}:`, error);
      }
    }

    return mockups;
  }

  async getTrendingKeywords(niche) {
    // In production, integrate with Google Trends API
    const keywordSets = {
      'motivational': ['success', 'inspiration', 'mindset', 'goals', 'achievement'],
      'funny': ['humor', 'comedy', 'meme', 'laughs', 'witty'],
      'nature': ['outdoor', 'adventure', 'wilderness', 'hiking', 'mountains'],
      'fitness': ['workout', 'gym', 'health', 'strength', 'motivation'],
      'coffee': ['caffeine', 'espresso', 'morning', 'energy', 'brew']
    };

    return keywordSets[niche] || ['trending', 'popular', 'cool', 'awesome', 'unique'];
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  async batchGenerateDesigns(designs) {
    const results = [];

    for (const design of designs) {
      try {
        let result;
        
        if (design.type === 'text') {
          result = await this.createTextBasedDesign(design.options);
        } else if (design.type === 'ai') {
          result = await this.createAIGeneratedDesign(design.prompt, design.productType);
        }

        results.push({
          id: design.id || uuidv4(),
          success: result.success,
          design: result.success ? result : null,
          error: result.success ? null : result.error
        });
      } catch (error) {
        results.push({
          id: design.id || uuidv4(),
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }
}

module.exports = DesignGenerator;