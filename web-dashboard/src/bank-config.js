const crypto = require('crypto');

class BankConfiguration {
  constructor() {
    this.loadConfiguration();
  }

  loadConfiguration() {
    this.config = {
      bankName: process.env.BANK_NAME || 'Not Configured',
      accountType: process.env.BANK_ACCOUNT_TYPE || 'Business Checking',
      routingNumber: process.env.BANK_ROUTING_NUMBER || '',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '',
      accountHolder: process.env.BANK_ACCOUNT_HOLDER || process.env.BUSINESS_NAME || '',
      businessInfo: {
        name: process.env.BUSINESS_NAME || 'Your Business',
        address: process.env.BUSINESS_ADDRESS || '',
        phone: process.env.BUSINESS_PHONE || '',
        email: process.env.BUSINESS_EMAIL || ''
      },
      transferSettings: {
        minAmount: parseFloat(process.env.MIN_TRANSFER_AMOUNT) || 25.00,
        feePercentage: parseFloat(process.env.TRANSFER_FEE_PERCENTAGE) || 0.025,
        processingDays: parseInt(process.env.TRANSFER_PROCESSING_DAYS) || 2
      }
    };
  }

  // Get masked account info for display
  getMaskedAccountInfo() {
    const accountNumber = this.config.accountNumber;
    const lastFour = accountNumber.length >= 4 ? accountNumber.slice(-4) : '****';
    
    return {
      bankName: this.config.bankName,
      accountType: this.config.accountType,
      lastFour: `****${lastFour}`,
      accountHolder: this.config.accountHolder,
      isConfigured: this.isConfigured()
    };
  }

  // Check if bank account is properly configured
  isConfigured() {
    return !!(
      this.config.bankName && 
      this.config.routingNumber && 
      this.config.accountNumber &&
      this.config.routingNumber !== '' &&
      this.config.accountNumber !== ''
    );
  }

  // Validate routing number (basic US routing number validation)
  validateRoutingNumber(routingNumber) {
    if (!/^\d{9}$/.test(routingNumber)) {
      return false;
    }
    
    // ABA routing number checksum validation
    const digits = routingNumber.split('').map(Number);
    const checksum = 
      (3 * (digits[0] + digits[3] + digits[6])) +
      (7 * (digits[1] + digits[4] + digits[7])) +
      (digits[2] + digits[5] + digits[8]);
    
    return checksum % 10 === 0;
  }

  // Update bank account information
  updateBankAccount(bankInfo) {
    const { routingNumber, accountNumber, bankName, accountType, accountHolder } = bankInfo;
    
    // Validate routing number
    if (!this.validateRoutingNumber(routingNumber)) {
      throw new Error('Invalid routing number');
    }
    
    // Validate account number (basic length check)
    if (!accountNumber || accountNumber.length < 4) {
      throw new Error('Invalid account number');
    }
    
    // Update configuration
    this.config.routingNumber = routingNumber;
    this.config.accountNumber = accountNumber;
    this.config.bankName = bankName || this.config.bankName;
    this.config.accountType = accountType || this.config.accountType;
    this.config.accountHolder = accountHolder || this.config.accountHolder;
    
    return this.getMaskedAccountInfo();
  }

  // Get full configuration (for internal use only)
  getFullConfiguration() {
    if (!this.isConfigured()) {
      throw new Error('Bank account not configured');
    }
    
    return {
      ...this.config,
      // Add encrypted identifiers for secure processing
      accountId: this.generateAccountId(),
      configuredAt: new Date().toISOString()
    };
  }

  // Generate secure account identifier
  generateAccountId() {
    const data = `${this.config.routingNumber}${this.config.accountNumber}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }
}

module.exports = BankConfiguration;