#!/bin/bash

echo "🚀 Starting Your 7 Viral Business Platforms Dashboard"
echo "=============================================="

# Navigate to the dashboard directory
cd /Users/enamegyir/Documents/Projects/ScalableBusinessPlatforms/web-dashboard

# Kill any existing dashboard process
pkill -f "node server.js" 2>/dev/null || true

echo "📊 Starting Secure Dashboard Server..."

# Start the dashboard with proper credentials
ADMIN_USERNAME=admin ADMIN_PASSWORD=password123 PORT=3008 node server.js &

# Wait a moment for server to start
sleep 3

echo ""
echo "✅ Dashboard is ready!"
echo ""
echo "🌐 Access your dashboard at:"
echo "   • http://localhost:3008/login"
echo "   • http://127.0.0.1:3008/login"
echo ""
echo "🔐 Login Credentials:"
echo "   Username: admin"
echo "   Password: password123"
echo ""
echo "💰 Your 7 Platforms:"
echo "   1. Mobile App/Game Platform"
echo "   2. YouTube Automation Channel"
echo "   3. Print-on-Demand Store"
echo "   4. Online Course Platform"
echo "   5. Second Game App Platform"
echo "   6. Fitness YouTube Channel"
echo "   7. Business Course Platform"
echo ""
echo "🎯 Features:"
echo "   • Real-time revenue monitoring"
echo "   • Automation control center"
echo "   • Platform health monitoring"
echo "   • Viral content optimization"
echo "   • Emergency stop controls"
echo ""
echo "📱 If localhost doesn't work in Safari, try:"
echo "   • Use Chrome instead"
echo "   • Try: http://127.0.0.1:3008/login"
echo ""
echo "Press Ctrl+C to stop the dashboard"
echo ""

# Keep the script running
wait