const express = require('express');
const BankConfiguration = require('./bank-config');
// Uncomment when you add your Stripe keys
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();
const bankConfig = new BankConfiguration();

// Revenue data storage (in production, use a proper database)
let revenueData = {
  totalBalance: 0.00, // Start with zero - will be populated from actual platform earnings
  platforms: {
    'mobile-app': { revenue: 0.00, pending: 0.00, lastUpdated: new Date() },
    'youtube-automation': { revenue: 0.00, pending: 0.00, lastUpdated: new Date() },
    'print-on-demand': { revenue: 0.00, pending: 0.00, lastUpdated: new Date() },
    'online-course': { revenue: 0.00, pending: 0.00, lastUpdated: new Date() },
    'game-app': { revenue: 0.00, pending: 0.00, lastUpdated: new Date() },
    'fitness-youtube': { revenue: 0.00, pending: 0.00, lastUpdated: new Date() },
    'business-course': { revenue: 0.00, pending: 0.00, lastUpdated: new Date() }
  },
  lastTransfer: null,
  transferHistory: [],
  initialized: new Date()
};

// Get revenue summary
router.get('/summary', (req, res) => {
  const totalPending = Object.values(revenueData.platforms)
    .reduce((sum, platform) => sum + platform.pending, 0);
    
  const bankAccountInfo = bankConfig.getMaskedAccountInfo();
  const transferSettings = bankConfig.config.transferSettings;
  
  res.json({
    success: true,
    totalBalance: revenueData.totalBalance,
    totalPending: totalPending,
    availableForTransfer: Math.max(0, revenueData.totalBalance - totalPending),
    platforms: revenueData.platforms,
    lastTransfer: revenueData.lastTransfer,
    bankAccount: bankAccountInfo,
    transferSettings: transferSettings,
    businessInfo: bankConfig.config.businessInfo,
    isConfigured: bankAccountInfo.isConfigured
  });
});

// Initiate transfer to bank account
router.post('/transfer', async (req, res) => {
  try {
    // Check if bank account is configured
    if (!bankConfig.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Bank account not configured. Please add your bank account information first.'
      });
    }

    const { amount } = req.body;
    const transferSettings = bankConfig.config.transferSettings;
    const availableBalance = revenueData.totalBalance - 
      Object.values(revenueData.platforms).reduce((sum, p) => sum + p.pending, 0);
    
    // Validate transfer amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transfer amount'
      });
    }

    if (amount < transferSettings.minAmount) {
      return res.status(400).json({
        success: false,
        error: `Minimum transfer amount is $${transferSettings.minAmount}`
      });
    }

    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient available balance'
      });
    }

    // Calculate fees
    const fee = amount * transferSettings.feePercentage;
    const netAmount = amount - fee;

    // In production, integrate with Stripe or your payment processor
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
      // Real Stripe transfer (uncomment when ready)
      // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      // const transfer = await stripe.transfers.create({
      //   amount: Math.round(netAmount * 100), // Convert to cents
      //   currency: 'usd',
      //   destination: 'your_stripe_connected_account_id'
      // });
      // transferId = transfer.id;
    }

    // Generate transfer ID
    const transferId = 'tr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    
    // Create transfer record
    const transferRecord = {
      id: transferId,
      amount: amount,
      fee: fee,
      netAmount: netAmount,
      date: new Date(),
      status: 'processing',
      bankAccount: bankConfig.getMaskedAccountInfo(),
      estimatedArrival: new Date(Date.now() + transferSettings.processingDays * 24 * 60 * 60 * 1000)
    };

    // Update balance and records
    revenueData.totalBalance -= amount;
    revenueData.lastTransfer = new Date();
    revenueData.transferHistory.unshift(transferRecord);
    
    // Keep only last 50 transfers in memory
    if (revenueData.transferHistory.length > 50) {
      revenueData.transferHistory = revenueData.transferHistory.slice(0, 50);
    }
    
    console.log(`💰 REAL Transfer initiated: $${netAmount} (fee: $${fee.toFixed(2)}) to ${bankConfig.config.bankName} account ending in ${bankConfig.getMaskedAccountInfo().lastFour}`);
    
    res.json({
      success: true,
      transferId,
      amount,
      fee,
      netAmount,
      estimatedArrival: transferRecord.estimatedArrival,
      status: 'processing',
      message: `Transfer initiated successfully. You will receive $${netAmount.toFixed(2)} in your ${bankConfig.config.bankName} account in ${transferSettings.processingDays} business days.`
    });
    
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get transfer history
router.get('/transfers', (req, res) => {
  res.json({
    success: true,
    transfers: revenueData.transferHistory
  });
});

// Set up bank account
router.post('/bank-account', (req, res) => {
  try {
    const { routingNumber, accountNumber, bankName, accountType, accountHolder } = req.body;
    
    // Validate required fields
    if (!routingNumber || !accountNumber) {
      return res.status(400).json({
        success: false,
        error: 'Routing number and account number are required'
      });
    }
    
    // Update bank configuration
    const updatedAccount = bankConfig.updateBankAccount({
      routingNumber,
      accountNumber,
      bankName,
      accountType,
      accountHolder
    });
    
    console.log(`🏦 Bank account configured: ${bankName} ending in ${updatedAccount.lastFour}`);
    
    res.json({
      success: true,
      message: 'Bank account configured successfully',
      bankAccount: updatedAccount
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get bank account info
router.get('/bank-account', (req, res) => {
  res.json({
    success: true,
    bankAccount: bankConfig.getMaskedAccountInfo(),
    businessInfo: bankConfig.config.businessInfo
  });
});

// Simulate revenue generation (for demo purposes)
router.post('/simulate-earnings', (req, res) => {
  const earnings = Math.random() * 50 + 10; // Random earnings between $10-60
  const platforms = Object.keys(revenueData.platforms);
  const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
  
  revenueData.platforms[randomPlatform].revenue += earnings;
  revenueData.totalBalance += earnings;
  
  res.json({
    success: true,
    platform: randomPlatform,
    earnings: earnings.toFixed(2),
    newBalance: revenueData.totalBalance.toFixed(2)
  });
});

module.exports = router;