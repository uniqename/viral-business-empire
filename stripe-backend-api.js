/**
 * Stripe Backend API for Real Revenue Generation
 * Handle payments, webhooks, and revenue tracking
 */

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_secret_key_here');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// Products configuration
const PRODUCTS = {
    'ai-course-basic': {
        name: 'AI Business Automation Course',
        price: 2900, // $29.00
        description: 'Learn to automate your business with AI',
        success_url: '/success?product=ai-course',
        cancel_url: '/cancel'
    },
    'viral-game-development': {
        name: 'Custom Viral Game Development',
        price: 19900, // $199.00
        description: 'We create a viral game for your business',
        success_url: '/success?product=game-dev',
        cancel_url: '/cancel'
    },
    'fitness-program-premium': {
        name: 'Premium Fitness Program',
        price: 7900, // $79.00
        description: 'Complete 12-week transformation program',
        success_url: '/success?product=fitness',
        cancel_url: '/cancel'
    },
    'business-consultation': {
        name: '1-on-1 Business Consultation',
        price: 19700, // $197.00
        description: 'Personal business strategy session',
        success_url: '/success?product=consultation',
        cancel_url: '/cancel'
    },
    'print-design-service': {
        name: 'Custom Print Design Service',
        price: 4900, // $49.00
        description: 'Professional designs for your products',
        success_url: '/success?product=design',
        cancel_url: '/cancel'
    }
};

// Revenue tracking
let totalRevenue = 0;
let dailyRevenue = 0;
let transactions = [];

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Create Stripe Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { productId } = req.body;
        const product = PRODUCTS[productId];
        
        if (!product) {
            return res.status(400).json({ error: 'Invalid product' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        description: product.description,
                    },
                    unit_amount: product.price,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${req.headers.origin}${product.success_url}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}${product.cancel_url}`,
            metadata: {
                product_id: productId
            }
        });

        console.log(`💳 Checkout session created for ${product.name} - $${product.price/100}`);
        
        res.json({
            id: session.id,
            url: session.url
        });
    } catch (error) {
        console.error('Checkout session creation failed:', error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook endpoint for Stripe events
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.log('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            await handleSuccessfulPayment(session);
            break;
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('💰 Payment succeeded:', paymentIntent.amount / 100, 'USD');
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({received: true});
});

// Handle successful payment
async function handleSuccessfulPayment(session) {
    const productId = session.metadata.product_id;
    const product = PRODUCTS[productId];
    const amount = session.amount_total / 100;
    
    // Update revenue tracking
    totalRevenue += amount;
    dailyRevenue += amount;
    
    // Record transaction
    const transaction = {
        id: session.id,
        product_id: productId,
        product_name: product.name,
        amount: amount,
        customer_email: session.customer_details.email,
        timestamp: new Date().toISOString(),
        status: 'completed'
    };
    
    transactions.unshift(transaction);
    
    console.log(`🎉 SALE COMPLETED: $${amount} - ${product.name}`);
    console.log(`💰 Total Revenue: $${totalRevenue.toFixed(2)}`);
    
    // TODO: Send confirmation email
    // TODO: Deliver digital product
    // TODO: Update customer database
}

// Get revenue stats
app.get('/api/revenue-stats', (req, res) => {
    res.json({
        total_revenue: totalRevenue,
        daily_revenue: dailyRevenue,
        total_transactions: transactions.length,
        recent_transactions: transactions.slice(0, 10),
        top_products: getTopProducts()
    });
});

// Get top selling products
function getTopProducts() {
    const productSales = {};
    
    transactions.forEach(t => {
        if (!productSales[t.product_id]) {
            productSales[t.product_id] = {
                name: t.product_name,
                sales: 0,
                revenue: 0
            };
        }
        productSales[t.product_id].sales += 1;
        productSales[t.product_id].revenue += t.amount;
    });
    
    return Object.entries(productSales)
        .map(([id, data]) => ({id, ...data}))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
}

// Success page
app.get('/success', (req, res) => {
    const { product, session_id } = req.query;
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Successful!</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { 
                    font-family: -apple-system, sans-serif; 
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0;
                    color: white;
                }
                .success-container {
                    text-align: center;
                    background: rgba(255,255,255,0.1);
                    padding: 3rem;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    max-width: 500px;
                }
                .success-icon { font-size: 5rem; margin-bottom: 1rem; }
                h1 { font-size: 2.5rem; margin-bottom: 1rem; }
                p { font-size: 1.2rem; line-height: 1.5; margin-bottom: 2rem; }
                .btn { 
                    background: white; 
                    color: #059669; 
                    padding: 1rem 2rem; 
                    border: none; 
                    border-radius: 8px; 
                    font-size: 1.1rem; 
                    font-weight: 600;
                    text-decoration: none;
                    display: inline-block;
                    margin: 0.5rem;
                }
            </style>
        </head>
        <body>
            <div class="success-container">
                <div class="success-icon">🎉</div>
                <h1>Payment Successful!</h1>
                <p>Thank you for your purchase. You'll receive your product shortly via email.</p>
                <p><small>Transaction ID: ${session_id}</small></p>
                <a href="/" class="btn">Return to Store</a>
                <a href="/dashboard/" class="btn">View Dashboard</a>
            </div>
        </body>
        </html>
    `);
});

// Cancel page  
app.get('/cancel', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Cancelled</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { 
                    font-family: -apple-system, sans-serif; 
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0;
                    color: white;
                }
                .cancel-container {
                    text-align: center;
                    background: rgba(255,255,255,0.1);
                    padding: 3rem;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    max-width: 500px;
                }
                .cancel-icon { font-size: 5rem; margin-bottom: 1rem; }
                h1 { font-size: 2.5rem; margin-bottom: 1rem; }
                p { font-size: 1.2rem; line-height: 1.5; margin-bottom: 2rem; }
                .btn { 
                    background: white; 
                    color: #d97706; 
                    padding: 1rem 2rem; 
                    border: none; 
                    border-radius: 8px; 
                    font-size: 1.1rem; 
                    font-weight: 600;
                    text-decoration: none;
                    display: inline-block;
                }
            </style>
        </head>
        <body>
            <div class="cancel-container">
                <div class="cancel-icon">😔</div>
                <h1>Payment Cancelled</h1>
                <p>Your payment was cancelled. No charges were made to your card.</p>
                <a href="/" class="btn">Return to Store</a>
            </div>
        </body>
        </html>
    `);
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        revenue: `$${totalRevenue.toFixed(2)}`,
        transactions: transactions.length,
        uptime: process.uptime()
    });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`💳 Stripe Payment Server running on port ${PORT}`);
    console.log(`💰 Ready to process real payments and generate revenue!`);
    console.log(`📊 Visit http://localhost:${PORT}/api/revenue-stats for live stats`);
    
    // Reset daily revenue at midnight
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
        dailyRevenue = 0;
        console.log('🌅 Daily revenue counter reset');
        
        // Set up daily reset interval
        setInterval(() => {
            dailyRevenue = 0;
            console.log('🌅 Daily revenue counter reset');
        }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
});

module.exports = app;