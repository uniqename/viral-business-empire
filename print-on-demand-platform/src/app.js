const express = require('express');
const cors = require('cors');
require('dotenv').config();

const designRoutes = require('./routes/design');
const storeRoutes = require('./routes/store');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/design', designRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/product', productRoutes);
app.use('/api/order', orderRoutes);

// Serve static files (designs, mockups)
app.use('/designs', express.static('output/designs'));
app.use('/mockups', express.static('output/mockups'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    platform: 'Print-on-Demand Store',
    timestamp: new Date().toISOString(),
    services: {
      'design-generation': 'active',
      'shopify-integration': 'active',
      'etsy-integration': 'active',
      'printful-fulfillment': 'active',
      'order-processing': 'active'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🛍️ Print-on-Demand Platform',
    version: '1.0.0',
    features: [
      'AI design generation',
      'Multi-store integration',
      'Automated product listing',
      'Order fulfillment',
      'Trend analysis',
      'Bulk operations'
    ],
    integrations: [
      'Shopify',
      'Etsy', 
      'Printful',
      'Printify',
      'Stripe'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🛍️ Print-on-Demand Platform running on port ${PORT}`);
});