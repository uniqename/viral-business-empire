// 🔐 OAUTH CALLBACK HANDLER FOR SOCIAL MEDIA AUTOMATION
const express = require('express');
const axios = require('axios');
const app = express();

// Store tokens (in production, use a database)
let tokens = {
    facebook: null,
    linkedin: null,
    instagram: null
};

// Serve static callback pages
app.use(express.static('.'));

// LinkedIn OAuth callback
app.get('/auth/linkedin/callback', async (req, res) => {
    const { code, state } = req.query;
    
    if (code) {
        try {
            console.log('✅ LinkedIn OAuth callback received!');
            console.log('🔑 Authorization code:', code.substring(0, 20) + '...');
            
            // Exchange code for access token
            const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
                params: {
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: 'https://businessempire.netlify.app/auth/linkedin/callback',
                    client_id: '78vhx4tmqc88tu',
                    client_secret: 'WPL_AP1.N3diPlz3BaQML6Qo.icHynQ=='
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            tokens.linkedin = tokenResponse.data.access_token;
            console.log('🎊 LinkedIn access token obtained!');
            console.log('💼 LinkedIn automation is now LIVE!');
            
            res.send(`
                <html>
                <head><title>LinkedIn Connected!</title></head>
                <body style="font-family: Arial; text-align: center; padding: 50px; background: #0077b5; color: white;">
                    <h1>🎊 LinkedIn Successfully Connected!</h1>
                    <h2>✅ Business Empire HQ LinkedIn automation is now LIVE!</h2>
                    <p>Your LinkedIn will now post professional content automatically every 12 hours.</p>
                    <p>🔥 Revenue-based content generation active!</p>
                    <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; background: white; color: #0077b5; border: none; border-radius: 5px; cursor: pointer;">Close Window</button>
                </body>
                </html>
            `);
            
        } catch (error) {
            console.log('❌ LinkedIn token exchange failed:', error.response?.data || error.message);
            res.send('❌ LinkedIn authentication failed. Please try again.');
        }
    } else {
        res.send('❌ No authorization code received');
    }
});

// Facebook OAuth callback
app.get('/auth/facebook/callback', async (req, res) => {
    const { code } = req.query;
    
    if (code) {
        try {
            console.log('✅ Facebook OAuth callback received!');
            console.log('🔑 Authorization code:', code.substring(0, 20) + '...');
            
            // Exchange code for access token
            const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
                params: {
                    client_id: '2170655680106841',
                    client_secret: '8ada5e72a00fc51a3480f021944ac35a',
                    redirect_uri: 'https://businessempire.netlify.app/auth/facebook/callback',
                    code: code
                }
            });
            
            tokens.facebook = tokenResponse.data.access_token;
            console.log('🎊 Facebook access token obtained!');
            console.log('📘 Facebook + Instagram automation is now LIVE!');
            
            res.send(`
                <html>
                <head><title>Facebook + Instagram Connected!</title></head>
                <body style="font-family: Arial; text-align: center; padding: 50px; background: #1877f2; color: white;">
                    <h1>🎊 Facebook + Instagram Successfully Connected!</h1>
                    <h2>✅ Business Empire HQ automation is now LIVE!</h2>
                    <p>📘 Facebook posts every 6 hours</p>
                    <p>📱 Instagram cross-posts automatically</p>
                    <p>🔥 Revenue-based content generation active!</p>
                    <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; background: white; color: #1877f2; border: none; border-radius: 5px; cursor: pointer;">Close Window</button>
                </body>
                </html>
            `);
            
        } catch (error) {
            console.log('❌ Facebook token exchange failed:', error.response?.data || error.message);
            res.send('❌ Facebook authentication failed. Please try again.');
        }
    } else {
        res.send('❌ No authorization code received');
    }
});

// Status endpoint
app.get('/api/oauth/status', (req, res) => {
    res.json({
        facebook: !!tokens.facebook,
        linkedin: !!tokens.linkedin,
        instagram: tokens.facebook ? 'Connected via Facebook' : false,
        twitter: 'Already Live',
        automation_status: 'Ready for full automation'
    });
});

// Token retrieval for automation systems
app.get('/api/oauth/tokens', (req, res) => {
    res.json({
        facebook: tokens.facebook ? 'Available' : null,
        linkedin: tokens.linkedin ? 'Available' : null,
        message: 'Tokens are secured and ready for automation'
    });
});

const PORT = 3011;
app.listen(PORT, () => {
    console.log('🔐 OAuth Handler running on port 3011');
    console.log('📱 Callback endpoints ready for Facebook and LinkedIn');
    console.log('✅ Ready to complete social media automation!');
});

module.exports = { tokens };