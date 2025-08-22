#!/bin/bash

# 🤖 AI Social Media Automation Startup Script

echo "🚀 Starting AI Social Media Automation System..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install axios express
fi

# Set environment variables (demo mode)
export TWITTER_API_KEY="demo-key"
export TWITTER_API_SECRET="demo-secret"
export TWITTER_ACCESS_TOKEN="demo-token"
export TWITTER_ACCESS_TOKEN_SECRET="demo-token-secret"
export INSTAGRAM_ACCESS_TOKEN="demo-token"
export LINKEDIN_ACCESS_TOKEN="demo-token"
export FACEBOOK_ACCESS_TOKEN="demo-token"
export FACEBOOK_PAGE_ID="demo-page-id"
export OPENAI_API_KEY="demo-key"

# Start the social media automation
echo "🤖 Launching AI automation system..."
echo "📱 All social media platforms will be automated"
echo "💰 Revenue-based content generation active"
echo "🔥 Viral detection system online"
echo "👥 Auto-engagement monitoring active"
echo ""
echo "🎯 Dashboard will be available at: http://localhost:3010/api/social/stats"
echo ""

# Start the automation in background and show output
node ai-social-automation.js