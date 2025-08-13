const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mpeg', 'audio/wav'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Upload and process media files
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { platform, purpose = 'general', quality = 'high' } = req.body;
    const fileId = uuidv4();
    const originalPath = req.file.path;
    let processedPath = originalPath;

    // Process based on file type
    if (req.file.mimetype.startsWith('image/')) {
      processedPath = await processImage(originalPath, fileId, purpose, quality);
    } else if (req.file.mimetype.startsWith('video/')) {
      processedPath = await processVideo(originalPath, fileId, purpose, quality);
    } else if (req.file.mimetype.startsWith('audio/')) {
      processedPath = await processAudio(originalPath, fileId, purpose, quality);
    }

    // Generate different sizes for images
    const variants = req.file.mimetype.startsWith('image/') ? 
      await generateImageVariants(processedPath, fileId) : null;

    const mediaInfo = {
      id: fileId,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: processedPath,
      url: `/media/${fileId}`,
      variants,
      platform,
      purpose,
      uploadedAt: new Date().toISOString()
    };

    // Save media info to database (mock for now)
    await saveMediaInfo(mediaInfo);

    res.json({
      success: true,
      media: mediaInfo
    });
  } catch (error) {
    console.error('Media upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get media file
router.get('/file/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { size = 'original' } = req.query;

    const mediaInfo = await getMediaInfo(id);
    if (!mediaInfo) {
      return res.status(404).json({
        success: false,
        error: 'Media not found'
      });
    }

    let filePath = mediaInfo.path;
    
    // Serve different sizes for images
    if (mediaInfo.variants && size !== 'original' && mediaInfo.variants[size]) {
      filePath = mediaInfo.variants[size].path;
    }

    res.sendFile(path.resolve(filePath));
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Batch process media files
router.post('/batch-process', upload.array('files', 10), async (req, res) => {
  try {
    const { platform, purpose = 'batch', operations = [] } = req.body;
    const results = [];

    for (const file of req.files) {
      try {
        const fileId = uuidv4();
        let processedPath = file.path;

        // Apply batch operations
        for (const operation of operations) {
          if (file.mimetype.startsWith('image/')) {
            processedPath = await applyImageOperation(processedPath, operation, fileId);
          }
        }

        results.push({
          originalName: file.originalname,
          id: fileId,
          url: `/media/${fileId}`,
          success: true
        });
      } catch (error) {
        results.push({
          originalName: file.originalname,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Processed ${req.files.length} files`,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate AI image from prompt
router.post('/generate-ai-image', async (req, res) => {
  try {
    const { prompt, style, size = '1024x1024', platform } = req.body;

    // Use shared AI service
    const axios = require('axios');
    const response = await axios.post('http://localhost:3000/api/ai/generate-image', {
      prompt: `${prompt}, ${style} style`,
      size,
      quality: 'hd'
    });

    if (response.data.success) {
      // Download and save the generated image
      const imageResponse = await axios.get(response.data.imageUrl, {
        responseType: 'arraybuffer'
      });

      const fileId = uuidv4();
      const fileName = `ai_generated_${fileId}.png`;
      const filePath = path.join('uploads', fileName);
      
      await fs.writeFile(filePath, Buffer.from(imageResponse.data));

      // Generate variants
      const variants = await generateImageVariants(filePath, fileId);

      const mediaInfo = {
        id: fileId,
        originalName: fileName,
        mimeType: 'image/png',
        path: filePath,
        url: `/media/${fileId}`,
        variants,
        platform,
        purpose: 'ai-generated',
        metadata: { prompt, style, aiGenerated: true },
        createdAt: new Date().toISOString()
      };

      await saveMediaInfo(mediaInfo);

      res.json({
        success: true,
        media: mediaInfo
      });
    } else {
      throw new Error('AI image generation failed');
    }
  } catch (error) {
    console.error('AI image generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Media optimization for different platforms
router.post('/optimize/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { targetPlatform, optimizations = [] } = req.body;

    const mediaInfo = await getMediaInfo(id);
    if (!mediaInfo) {
      return res.status(404).json({
        success: false,
        error: 'Media not found'
      });
    }

    const optimizedVariants = {};

    // Platform-specific optimizations
    const platformSpecs = {
      'youtube': { width: 1920, height: 1080, quality: 85 },
      'instagram': { width: 1080, height: 1080, quality: 80 },
      'facebook': { width: 1200, height: 630, quality: 75 },
      'twitter': { width: 1024, height: 512, quality: 80 },
      'shopify': { width: 800, height: 800, quality: 85 },
      'etsy': { width: 570, height: 570, quality: 80 }
    };

    if (platformSpecs[targetPlatform] && mediaInfo.mimeType.startsWith('image/')) {
      const spec = platformSpecs[targetPlatform];
      const optimizedId = `${id}_${targetPlatform}`;
      const optimizedPath = `uploads/optimized_${optimizedId}.jpg`;

      await sharp(mediaInfo.path)
        .resize(spec.width, spec.height, { 
          fit: 'cover', 
          position: 'center' 
        })
        .jpeg({ quality: spec.quality })
        .toFile(optimizedPath);

      optimizedVariants[targetPlatform] = {
        path: optimizedPath,
        url: `/media/${optimizedId}`,
        width: spec.width,
        height: spec.height,
        size: (await fs.stat(optimizedPath)).size
      };
    }

    res.json({
      success: true,
      originalMedia: mediaInfo,
      optimizedVariants,
      targetPlatform
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper functions
async function processImage(inputPath, fileId, purpose, quality) {
  const outputPath = `uploads/processed_${fileId}.jpg`;
  
  let sharpInstance = sharp(inputPath);
  
  // Apply processing based on purpose
  switch (purpose) {
    case 'thumbnail':
      sharpInstance = sharpInstance.resize(300, 300, { fit: 'cover' });
      break;
    case 'product':
      sharpInstance = sharpInstance.resize(800, 800, { fit: 'inside' });
      break;
    case 'banner':
      sharpInstance = sharpInstance.resize(1200, 400, { fit: 'cover' });
      break;
  }

  // Apply quality settings
  const qualityValue = quality === 'high' ? 90 : quality === 'medium' ? 75 : 60;
  
  await sharpInstance
    .jpeg({ quality: qualityValue })
    .toFile(outputPath);

  return outputPath;
}

async function processVideo(inputPath, fileId, purpose, quality) {
  // For now, just return the original path
  // In production, you'd use ffmpeg to process videos
  return inputPath;
}

async function processAudio(inputPath, fileId, purpose, quality) {
  // For now, just return the original path
  // In production, you'd process audio files
  return inputPath;
}

async function generateImageVariants(imagePath, fileId) {
  const variants = {};
  const sizes = {
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: 300 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 }
  };

  for (const [sizeName, dimensions] of Object.entries(sizes)) {
    try {
      const variantPath = `uploads/${fileId}_${sizeName}.jpg`;
      
      await sharp(imagePath)
        .resize(dimensions.width, dimensions.height, { 
          fit: 'cover', 
          position: 'center' 
        })
        .jpeg({ quality: 80 })
        .toFile(variantPath);

      const stats = await fs.stat(variantPath);
      variants[sizeName] = {
        path: variantPath,
        url: `/media/${fileId}?size=${sizeName}`,
        width: dimensions.width,
        height: dimensions.height,
        size: stats.size
      };
    } catch (error) {
      console.error(`Error generating ${sizeName} variant:`, error);
    }
  }

  return variants;
}

async function applyImageOperation(imagePath, operation, fileId) {
  const outputPath = `uploads/processed_${fileId}_${operation.type}.jpg`;
  let sharpInstance = sharp(imagePath);

  switch (operation.type) {
    case 'resize':
      sharpInstance = sharpInstance.resize(operation.width, operation.height);
      break;
    case 'crop':
      sharpInstance = sharpInstance.extract({
        left: operation.x,
        top: operation.y,
        width: operation.width,
        height: operation.height
      });
      break;
    case 'rotate':
      sharpInstance = sharpInstance.rotate(operation.angle);
      break;
    case 'blur':
      sharpInstance = sharpInstance.blur(operation.sigma || 3);
      break;
    case 'sharpen':
      sharpInstance = sharpInstance.sharpen();
      break;
  }

  await sharpInstance.jpeg({ quality: 85 }).toFile(outputPath);
  return outputPath;
}

// Mock database functions
const mediaDatabase = new Map();

async function saveMediaInfo(mediaInfo) {
  mediaDatabase.set(mediaInfo.id, mediaInfo);
  return mediaInfo;
}

async function getMediaInfo(id) {
  return mediaDatabase.get(id);
}

module.exports = router;