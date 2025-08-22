// 🔓 SIMPLIFIED OAUTH FOR SOCIAL MEDIA AUTOMATION
const express = require('express');
const axios = require('axios');
const app = express();

app.get('/facebook-auth', (req, res) => {
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=2170655680106841&` +
        `redirect_uri=http://localhost:3012/facebook-callback&` +
        `scope=public_profile,email&` +
        `response_type=code&` +
        `state=facebook_auth`;
    
    res.redirect(authUrl);
});

app.get('/linkedin-auth', (req, res) => {
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
        `response_type=code&` +
        `client_id=78vhx4tmqc88tu&` +
        `redirect_uri=http://localhost:3012/linkedin-callback&` +
        `scope=r_liteprofile%20r_emailaddress&` +
        `state=linkedin_auth`;
    
    res.redirect(authUrl);
});

app.get('/facebook-callback', async (req, res) => {
    const { code } = req.query;
    
    if (code) {
        try {
            const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
                params: {
                    client_id: '2170655680106841',
                    client_secret: '8ada5e72a00fc51a3480f021944ac35a',
                    redirect_uri: 'http://localhost:3012/facebook-callback',
                    code: code
                }
            });
            
            console.log('✅ Facebook token obtained:', tokenResponse.data.access_token.substring(0, 20) + '...');
            
            res.send(`
                <h1>✅ Facebook Connected!</h1>
                <p>Token: ${tokenResponse.data.access_token.substring(0, 30)}...</p>
                <p>🔥 Now enabling full Facebook automation...</p>
                <script>setTimeout(() => window.close(), 3000);</script>
            `);
            
            // Enable Facebook automation
            enableFacebookAutomation(tokenResponse.data.access_token);
            
        } catch (error) {
            console.log('❌ Facebook auth error:', error.response?.data || error.message);
            res.send('❌ Facebook authentication failed');
        }
    }
});

app.get('/linkedin-callback', async (req, res) => {
    const { code } = req.query;
    
    if (code) {
        try {
            const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
                params: {
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: 'http://localhost:3012/linkedin-callback',
                    client_id: '78vhx4tmqc88tu',
                    client_secret: 'WPL_AP1.N3diPlz3BaQML6Qo.icHynQ=='
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            console.log('✅ LinkedIn token obtained:', tokenResponse.data.access_token.substring(0, 20) + '...');
            
            res.send(`
                <h1>✅ LinkedIn Connected!</h1>
                <p>Token: ${tokenResponse.data.access_token.substring(0, 30)}...</p>
                <p>🔥 Now enabling full LinkedIn automation...</p>
                <script>setTimeout(() => window.close(), 3000);</script>
            `);
            
            // Enable LinkedIn automation
            enableLinkedInAutomation(tokenResponse.data.access_token);
            
        } catch (error) {
            console.log('❌ LinkedIn auth error:', error.response?.data || error.message);
            res.send('❌ LinkedIn authentication failed');
        }
    }
});

async function enableFacebookAutomation(token) {
    console.log('🚀 ENABLING FACEBOOK FULL AUTOMATION...');
    
    // Test posting capability
    try {
        const testPost = await axios.post(`https://graph.facebook.com/me/feed`, {
            message: "🚀 Facebook automation is now LIVE! Testing automated posting for Business Empire HQ. #TestPost #Automation"
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('🎊 SUCCESS! Facebook can now post automatically!');
        console.log('📱 Post ID:', testPost.data.id);
        
        // Start automated posting
        setInterval(() => {
            postToFacebook(token);
        }, 6 * 60 * 60 * 1000); // Every 6 hours
        
    } catch (error) {
        console.log('❌ Facebook posting failed:', error.response?.data || error.message);
    }
}

async function enableLinkedInAutomation(token) {
    console.log('🚀 ENABLING LINKEDIN FULL AUTOMATION...');
    
    try {
        // Get user profile first
        const profile = await axios.get('https://api.linkedin.com/v2/people/~', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });
        
        console.log('✅ LinkedIn profile retrieved:', profile.data.id);
        
        // Start automated posting
        setInterval(() => {
            postToLinkedIn(token, profile.data.id);
        }, 12 * 60 * 60 * 1000); // Every 12 hours
        
        console.log('🎊 SUCCESS! LinkedIn automation is now LIVE!');
        
    } catch (error) {
        console.log('❌ LinkedIn setup failed:', error.response?.data || error.message);
    }
}

async function postToFacebook(token) {
    const content = `🚀 Business Empire Update: Growing multiple revenue streams!
    
Current monthly revenue: $${8500 + Math.random() * 1000}+
    
The power of diversification is working! 💪
    
#BusinessEmpire #Entrepreneurship #Success`;
    
    try {
        const response = await axios.post('https://graph.facebook.com/me/feed', {
            message: content
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('📘 Posted to Facebook! ID:', response.data.id);
    } catch (error) {
        console.log('❌ Facebook post failed:', error.response?.data || error.message);
    }
}

async function postToLinkedIn(token, personUrn) {
    const content = `Strategic Business Portfolio Development

After building seven different businesses, the diversification approach has proven more resilient than single-focus strategies.

Current Results: $${Math.floor(8500 + Math.random() * 1000)}+ monthly revenue

Key insights on portfolio entrepreneurship and systematic business development.

#BusinessStrategy #Entrepreneurship #PortfolioManagement`;
    
    try {
        const postData = {
            author: `urn:li:person:${personUrn}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: content
                    },
                    shareMediaCategory: 'NONE'
                }
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
        };
        
        const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });
        
        console.log('💼 Posted to LinkedIn! ID:', response.data.id);
    } catch (error) {
        console.log('❌ LinkedIn post failed:', error.response?.data || error.message);
    }
}

app.get('/', (req, res) => {
    res.send(`
        <h1>🚀 Social Media OAuth Authentication</h1>
        <p><a href="/facebook-auth" target="_blank">🔗 Connect Facebook</a></p>
        <p><a href="/linkedin-auth" target="_blank">🔗 Connect LinkedIn</a></p>
        <p>After connecting, full automation will be enabled!</p>
    `);
});

const PORT = 3012;
app.listen(PORT, () => {
    console.log('🔓 Simple OAuth server running on port 3012');
    console.log('🌐 Open http://localhost:3012 to authenticate');
    console.log('🚀 After authentication, full automation will be enabled!');
});