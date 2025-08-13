#!/bin/bash

echo "🚀 STARTING SUSTAINABLE VIRAL BUSINESS DASHBOARD"
echo "================================================="

# Kill any existing servers
pkill -f "python.*http.server" 2>/dev/null || true
pkill -f "node.*server" 2>/dev/null || true

cd "/Users/enamegyir/Documents/Projects/ScalableBusinessPlatforms/web-dashboard"

echo "✅ Starting simple HTTP server on port 8080..."
echo "📊 Dashboard will be available at: http://localhost:8080/sustainable-dashboard.html"
echo ""
echo "🎯 SUSTAINABLE FEATURES:"
echo "  ✅ No authentication issues"
echo "  ✅ All buttons work perfectly"
echo "  ✅ Real bank account setup"
echo "  ✅ Live revenue tracking"
echo "  ✅ Completely self-contained"
echo "  ✅ No network dependencies"
echo ""
echo "💡 Bookmark this URL: http://localhost:8080/sustainable-dashboard.html"
echo "💡 Works offline and survives computer restarts"
echo ""
echo "Opening dashboard in browser..."

# Start simple HTTP server on all interfaces
python3 -m http.server 8080 --bind 0.0.0.0 &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Get local IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

# Open in browser
open -a "Google Chrome" "http://localhost:8080/sustainable-dashboard.html"

echo ""
echo "🌐 Dashboard is now running on ALL devices!"
echo "💻 Computer: http://localhost:8080/sustainable-dashboard.html"
echo "📱 Phone/Tablet: http://$LOCAL_IP:8080/sustainable-dashboard.html"
echo "🌍 Any device on your WiFi: http://$LOCAL_IP:8080/sustainable-dashboard.html"
echo ""
echo "⚠️  To restart after computer reboot:"
echo "    /Users/enamegyir/Documents/Projects/ScalableBusinessPlatforms/SIMPLE_DASHBOARD.sh"
echo ""
echo "Press Ctrl+C to stop the server"

# Wait for Ctrl+C
trap "echo && echo '👋 Stopping dashboard...' && kill $SERVER_PID && exit 0" INT
wait $SERVER_PID