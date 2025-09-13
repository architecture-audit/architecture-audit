#!/bin/bash

# Development server starter script
# This script starts nginx with the development configuration

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
NGINX_CONF="$PROJECT_DIR/nginx-dev.conf"
PORT=8888

echo "🚀 Starting AI Architecture Audit Development Server"
echo "====================================================="

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "❌ nginx is not installed!"
    echo ""
    echo "To install nginx on macOS:"
    echo "  brew install nginx"
    echo ""
    echo "To install nginx on Ubuntu/Debian:"
    echo "  sudo apt-get install nginx"
    echo ""
    exit 1
fi

# Kill any existing Python servers on port 8888
echo "🔍 Checking for existing servers on port $PORT..."
lsof -ti:$PORT | xargs kill -9 2>/dev/null

# Check if nginx is already running
if pgrep nginx > /dev/null; then
    echo "⚠️  nginx is already running. Stopping it first..."
    nginx -s stop 2>/dev/null || sudo nginx -s stop 2>/dev/null
    sleep 1
fi

# Update nginx config with correct project path
sed -i.bak "s|root /Users/deo/migrations/aiarchitectureaudit.com|root $PROJECT_DIR|g" "$NGINX_CONF"

# Start nginx with our config
echo "🌐 Starting nginx on http://localhost:$PORT"
echo ""

# Try to start nginx (may need sudo depending on system)
if nginx -c "$NGINX_CONF" 2>/dev/null; then
    echo "✅ Server started successfully!"
else
    echo "🔐 Trying with sudo..."
    if sudo nginx -c "$NGINX_CONF"; then
        echo "✅ Server started successfully with sudo!"
    else
        echo "❌ Failed to start nginx"
        exit 1
    fi
fi

echo ""
echo "📍 Server URLs:"
echo "   Homepage:      http://localhost:$PORT/"
echo "   Calculators:   http://localhost:$PORT/calculators/"
echo "   Documentation: http://localhost:$PORT/docs/"
echo ""
echo "📋 Commands:"
echo "   Stop server:   nginx -s stop (or sudo nginx -s stop)"
echo "   Reload config: nginx -s reload"
echo "   View logs:     tail -f /usr/local/var/log/nginx/aiaudit-*.log"
echo ""
echo "Press Ctrl+C to exit (server will keep running in background)"
echo "To stop the server, run: nginx -s stop"

# Keep script running to show the info
read -r -d '' _ </dev/tty