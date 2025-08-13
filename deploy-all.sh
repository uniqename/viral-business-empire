#!/bin/bash

# Deploy All Scalable Business Platforms
# This script starts all services and deploys the complete system

echo "🚀 Deploying Scalable Business Platforms Suite..."
echo "=================================================="

# Function to check if a port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "❌ Port $port is already in use"
        return 1
    fi
    return 0
}

# Function to start a service
start_service() {
    local name=$1
    local port=$2
    local dir=$3
    local command=$4
    
    echo "🔄 Starting $name on port $port..."
    
    cd "$dir" || {
        echo "❌ Failed to change to directory: $dir"
        return 1
    }
    
    if [ ! -f "package.json" ]; then
        echo "📦 Installing dependencies for $name..."
        npm install
    fi
    
    # Start service in background
    $command > "/tmp/${name}.log" 2>&1 &
    local pid=$!
    echo "$pid" > "/tmp/${name}.pid"
    
    # Wait a moment and check if service started
    sleep 3
    if kill -0 "$pid" 2>/dev/null; then
        echo "✅ $name started successfully (PID: $pid)"
        return 0
    else
        echo "❌ Failed to start $name"
        cat "/tmp/${name}.log"
        return 1
    fi
}

# Function to check service health
check_health() {
    local name=$1
    local url=$2
    
    echo "🏥 Checking health of $name..."
    
    # Try up to 10 times with 2 second intervals
    for i in {1..10}; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo "✅ $name is healthy"
            return 0
        fi
        echo "⏳ Waiting for $name to be ready... (attempt $i/10)"
        sleep 2
    done
    
    echo "❌ $name failed health check"
    return 1
}

# Set up environment
echo "🔧 Setting up environment..."
export NODE_ENV=production
export DASHBOARD_PORT=5000

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

# Check Flutter (for mobile app platform)
if ! command -v flutter &> /dev/null; then
    echo "⚠️  Flutter is not installed. Mobile app platform may not work properly."
fi

echo "✅ Prerequisites checked"

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "📁 Project root: $PROJECT_ROOT"

# Check required ports
echo "🔍 Checking port availability..."
REQUIRED_PORTS=(3000 3001 3002 3003 4000 5000)

for port in "${REQUIRED_PORTS[@]}"; do
    if ! check_port $port; then
        echo "❌ Required port $port is not available. Please free up this port and try again."
        exit 1
    fi
done

echo "✅ All required ports are available"

# Create logs directory
mkdir -p /tmp/scalable-business-logs

echo ""
echo "🚀 Starting all services..."
echo "=========================="

# Start services in dependency order
SERVICES_STARTED=()

# 1. Shared Services (Core API)
if start_service "shared-services" 3000 "$PROJECT_ROOT/shared-services" "npm start"; then
    SERVICES_STARTED+=("shared-services:3000")
else
    echo "❌ Failed to start shared services. Cannot continue."
    exit 1
fi

# 2. YouTube Automation Platform
if start_service "youtube-automation" 3001 "$PROJECT_ROOT/youtube-automation-platform" "npm start"; then
    SERVICES_STARTED+=("youtube-automation:3001")
else
    echo "⚠️  YouTube automation failed to start but continuing..."
fi

# 3. Print-on-Demand Platform
if start_service "print-on-demand" 3002 "$PROJECT_ROOT/print-on-demand-platform" "npm start"; then
    SERVICES_STARTED+=("print-on-demand:3002")
else
    echo "⚠️  Print-on-demand platform failed to start but continuing..."
fi

# 4. Online Course Platform
if start_service "online-course" 3003 "$PROJECT_ROOT/online-course-platform" "npm start"; then
    SERVICES_STARTED+=("online-course:3003")
else
    echo "⚠️  Online course platform failed to start but continuing..."
fi

# 5. Automation Orchestrator
if start_service "automation-orchestrator" 4000 "$PROJECT_ROOT/automation-workflows" "npm start"; then
    SERVICES_STARTED+=("automation-orchestrator:4000")
else
    echo "⚠️  Automation orchestrator failed to start but continuing..."
fi

# 6. Dashboard (Must be last)
if start_service "dashboard" 5000 "$PROJECT_ROOT/dashboard" "npm start"; then
    SERVICES_STARTED+=("dashboard:5000")
else
    echo "❌ Failed to start dashboard. This is critical."
    exit 1
fi

echo ""
echo "🏥 Performing health checks..."
echo "============================="

# Health check all services
HEALTHY_SERVICES=()
FAILED_SERVICES=()

for service_info in "${SERVICES_STARTED[@]}"; do
    IFS=':' read -r name port <<< "$service_info"
    health_url="http://localhost:$port/health"
    
    if check_health "$name" "$health_url"; then
        HEALTHY_SERVICES+=("$name")
    else
        FAILED_SERVICES+=("$name")
    fi
done

echo ""
echo "📊 Deployment Summary"
echo "===================="
echo "Services Started: ${#SERVICES_STARTED[@]}"
echo "Healthy Services: ${#HEALTHY_SERVICES[@]}"
echo "Failed Services: ${#FAILED_SERVICES[@]}"

if [ ${#FAILED_SERVICES[@]} -gt 0 ]; then
    echo ""
    echo "⚠️  The following services failed:"
    for service in "${FAILED_SERVICES[@]}"; do
        echo "   - $service"
    done
fi

echo ""
echo "🎯 Access Your Business Dashboard"
echo "================================="
echo "🌐 Main Dashboard:     http://localhost:5000"
echo "💰 Revenue Management: http://localhost:5000/revenue"  
echo "🤖 Automation Control: http://localhost:5000/automation"
echo "🏥 Health Monitor:     http://localhost:5000/health"
echo ""
echo "🔧 Individual Platform APIs:"
echo "📱 Mobile Apps:        http://localhost:3000"
echo "🎥 YouTube Automation: http://localhost:3001"
echo "🛍️  Print-on-Demand:   http://localhost:3002"
echo "🎓 Online Courses:     http://localhost:3003"
echo "⚡ Automation Hub:     http://localhost:4000"

# Create management script
cat > "$PROJECT_ROOT/manage.sh" << 'EOF'
#!/bin/bash

# Business Platform Management Script

case "$1" in
    status)
        echo "📊 Service Status:"
        for service in shared-services youtube-automation print-on-demand online-course automation-orchestrator dashboard; do
            if [ -f "/tmp/${service}.pid" ]; then
                pid=$(cat "/tmp/${service}.pid")
                if kill -0 "$pid" 2>/dev/null; then
                    echo "✅ $service (PID: $pid)"
                else
                    echo "❌ $service (stopped)"
                fi
            else
                echo "❌ $service (no pid file)"
            fi
        done
        ;;
    stop)
        echo "🛑 Stopping all services..."
        for service in shared-services youtube-automation print-on-demand online-course automation-orchestrator dashboard; do
            if [ -f "/tmp/${service}.pid" ]; then
                pid=$(cat "/tmp/${service}.pid")
                if kill -0 "$pid" 2>/dev/null; then
                    kill "$pid"
                    echo "🛑 Stopped $service"
                fi
                rm -f "/tmp/${service}.pid"
            fi
        done
        ;;
    restart)
        echo "🔄 Restarting all services..."
        $0 stop
        sleep 5
        ./deploy-all.sh
        ;;
    logs)
        service_name=${2:-"all"}
        if [ "$service_name" = "all" ]; then
            echo "📋 Recent logs from all services:"
            for log in /tmp/*.log; do
                if [ -f "$log" ]; then
                    echo "=== $(basename "$log") ==="
                    tail -20 "$log"
                    echo ""
                fi
            done
        else
            log_file="/tmp/${service_name}.log"
            if [ -f "$log_file" ]; then
                echo "📋 Logs for $service_name:"
                tail -50 "$log_file"
            else
                echo "❌ No log file found for $service_name"
            fi
        fi
        ;;
    *)
        echo "Business Platform Management"
        echo "Usage: $0 {status|stop|restart|logs [service]}"
        echo ""
        echo "Commands:"
        echo "  status   - Show status of all services"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"  
        echo "  logs     - Show logs (optionally for specific service)"
        echo ""
        echo "Services: shared-services, youtube-automation, print-on-demand,"
        echo "          online-course, automation-orchestrator, dashboard"
        ;;
esac
EOF

chmod +x "$PROJECT_ROOT/manage.sh"

echo ""
echo "🛠️  Management Commands:"
echo "./manage.sh status   - Check service status"
echo "./manage.sh stop     - Stop all services"
echo "./manage.sh restart  - Restart all services"
echo "./manage.sh logs     - View logs"

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================="

if [ ${#HEALTHY_SERVICES[@]} -ge 4 ]; then
    echo "✅ Your scalable business platform suite is ready!"
    echo "🚀 Start generating passive income across all platforms!"
    
    # Open dashboard in browser (macOS)
    if command -v open &> /dev/null; then
        echo "🌐 Opening dashboard in your browser..."
        open "http://localhost:5000"
    fi
    
    echo ""
    echo "💡 Next Steps:"
    echo "1. Visit http://localhost:5000 to access your dashboard"
    echo "2. Set up your API keys in the .env files"
    echo "3. Configure payment processing (Stripe)"
    echo "4. Monitor automation workflows"
    echo "5. Watch your revenue grow! 💰"
    
else
    echo "⚠️  Some services may not be running properly."
    echo "📋 Check the logs with: ./manage.sh logs"
    echo "🔧 You can still access the dashboard at: http://localhost:5000"
fi

echo ""
echo "📚 Need help? Check the README.md for detailed setup instructions."
echo "🎛️  Happy automating! Your business empire awaits..."