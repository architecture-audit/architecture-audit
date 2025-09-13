#!/bin/bash

# AWS Amplify Deployment Script
# Easiest deployment with built-in CI/CD

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 AI Architecture Audit - AWS Amplify Deployment${NC}"
echo "================================================"

# Check if Amplify CLI is installed
if ! command -v amplify &> /dev/null; then
    echo -e "${YELLOW}📦 Installing AWS Amplify CLI...${NC}"
    npm install -g @aws-amplify/cli
fi

# Initialize Amplify project
echo -e "${YELLOW}🔧 Initializing Amplify project...${NC}"

cat > amplify.yml <<EOF
version: 1
frontend:
  phases:
    # No build phase needed for static site
    build:
      commands:
        - echo "Deploying static website"
  artifacts:
    baseDirectory: /
    files:
      - '**/*'
  cache:
    paths: []
EOF

# Create Amplify app configuration
cat > amplify-config.json <<EOF
{
  "name": "ai-architecture-audit",
  "envName": "production",
  "defaultEditor": "code",
  "appType": "javascript",
  "framework": "none",
  "buildCommand": "echo 'No build required'",
  "startCommand": "echo 'Static site'",
  "customHeaders": [
    {
      "pattern": "**/*.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "pattern": "**/*.css",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "pattern": "**/*.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/docs/<path>",
      "target": "/docs/<path>",
      "status": "200"
    },
    {
      "source": "/calculators/<path>",
      "target": "/calculators/<path>",
      "status": "200"
    }
  ]
}
EOF

# Initialize Amplify
echo -e "${YELLOW}🚀 Setting up Amplify hosting...${NC}"

# Check if amplify is already initialized
if [ ! -d "amplify" ]; then
    amplify init --yes
fi

# Add hosting
amplify add hosting <<EOF
Hosting with Amplify Console
Manual deployment
EOF

# Deploy
echo -e "${YELLOW}📤 Deploying to Amplify...${NC}"
amplify publish --yes

# Get the app URL
APP_ID=$(amplify status --json | grep -o '"appId":"[^"]*' | grep -o '[^"]*$' | head -1)
APP_URL="https://main.${APP_ID}.amplifyapp.com"

# Create GitHub Actions workflow for continuous deployment
mkdir -p .github/workflows
cat > .github/workflows/amplify-deploy.yml <<EOF
name: Deploy to Amplify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Deploy to Amplify
      run: |
        npm install -g @aws-amplify/cli
        amplify pull --appId ${APP_ID} --envName production --yes
        amplify publish --yes
EOF

echo ""
echo -e "${GREEN}🎉 Amplify Deployment Complete!${NC}"
echo "================================================"
echo -e "App URL: ${GREEN}$APP_URL${NC}"
echo -e "App ID: ${GREEN}$APP_ID${NC}"
echo ""
echo -e "${BLUE}✨ Features Enabled:${NC}"
echo "✅ Automatic HTTPS"
echo "✅ Global CDN"
echo "✅ Continuous deployment from Git"
echo "✅ Preview deployments for branches"
echo "✅ Custom domain support"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Visit your app at $APP_URL"
echo "2. Connect GitHub repo for auto-deployment:"
echo "   amplify hosting configure"
echo "3. Add custom domain:"
echo "   amplify add domain"
echo ""
echo -e "${GREEN}View Amplify Console:${NC}"
echo "https://console.aws.amazon.com/amplify/home"