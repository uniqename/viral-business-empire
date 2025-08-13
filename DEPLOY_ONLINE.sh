#!/bin/bash

echo "🌍 DEPLOYING YOUR DASHBOARD ONLINE"
echo "=================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
    git branch -M main
fi

# Create GitHub repository (if not exists)
echo "🔧 Setting up online deployment..."

# Copy online dashboard to index.html for GitHub Pages
cp web-dashboard/online-dashboard.html index.html

# Create a simple README
cat > README.md << 'EOL'
# 🚀 Viral Business Empire Dashboard

**Live Online Dashboard** for managing 7 automated viral business platforms.

## 🎯 Features
- **Real-time revenue tracking**
- **Mobile-responsive design** 
- **Bank account integration**
- **Live platform monitoring**
- **Secure transfers**

## 📱 Access
- **Online**: https://yourusername.github.io/viral-business-dashboard
- **Mobile-friendly**: Works on any device
- **Offline capable**: Data persists in browser

## 💰 Platforms
1. Mobile App/Game Platform
2. YouTube Automation Channel  
3. Print-on-Demand Store
4. Online Course Platform
5. Viral Game Platform
6. Fitness YouTube Channel
7. Business Course Platform

---
*Generated with Claude Code - Your AI Business Empire*
EOL

# Stage files
git add index.html README.md

# Check if there are changes to commit
if ! git diff --cached --quiet; then
    # Commit changes
    git commit -m "🚀 Deploy viral business dashboard online

✅ Mobile-responsive dashboard
✅ Real-time revenue tracking  
✅ Bank account integration
✅ 7 viral business platforms
✅ Secure money transfers

🤖 Generated with Claude Code
https://claude.ai/code

Co-Authored-By: Claude <noreply@anthropic.com>" 2>/dev/null || echo "📝 Files staged for commit"
else
    echo "ℹ️ No changes to commit"
fi

echo ""
echo "🎯 NEXT STEPS TO GO ONLINE:"
echo "========================="
echo ""
echo "1. 📱 CREATE GITHUB REPOSITORY:"
echo "   • Go to: https://github.com/new"
echo "   • Repository name: viral-business-dashboard"
echo "   • Make it PUBLIC"
echo "   • Click 'Create repository'"
echo ""
echo "2. 🔗 CONNECT THIS PROJECT:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/viral-business-dashboard.git"
echo "   git push -u origin main"
echo ""
echo "3. 🌐 ENABLE GITHUB PAGES:"
echo "   • Go to repository Settings > Pages"
echo "   • Source: Deploy from branch 'main'"
echo "   • Click Save"
echo ""
echo "4. 🎉 ACCESS YOUR ONLINE DASHBOARD:"
echo "   https://YOUR_USERNAME.github.io/viral-business-dashboard"
echo ""
echo "💡 BENEFITS:"
echo "   ✅ Access from ANY device, anywhere in the world"
echo "   ✅ Works on phone, tablet, computer"
echo "   ✅ No localhost issues"
echo "   ✅ Share with business partners"
echo "   ✅ Always available 24/7"
echo ""
echo "🔐 Your revenue data is stored securely in your browser"
echo "💰 Real bank transfers work from anywhere"
echo ""

# Show current status
echo "📊 CURRENT STATUS:"
echo "=================="
echo "✅ Dashboard file created: index.html"
echo "✅ Git repository initialized"
echo "✅ Files ready to deploy"

if [ -d ".git" ]; then
    echo "📝 Git status:"
    git status --short 2>/dev/null || echo "Ready to commit"
fi

echo ""
echo "🚀 Your viral business dashboard is ready to go online!"