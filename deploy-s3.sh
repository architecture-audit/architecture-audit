#!/bin/bash

# S3 Static Website Deployment Script
# Simple deployment for AI Architecture Audit website

set -e

# Configuration
BUCKET_NAME="aiarchitectureaudit.com"
REGION="us-east-1"
PROFILE="default"  # Change this to your AWS profile

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 AI Architecture Audit - S3 Deployment Script${NC}"
echo "================================================"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check AWS credentials
echo -e "${YELLOW}📋 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity --profile $PROFILE &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Run 'aws configure'${NC}"
    exit 1
fi

# Create S3 bucket if it doesn't exist
echo -e "${YELLOW}🪣 Creating S3 bucket if needed...${NC}"
if aws s3api head-bucket --bucket "$BUCKET_NAME" --profile $PROFILE 2>/dev/null; then
    echo -e "${GREEN}✅ Bucket $BUCKET_NAME already exists${NC}"
else
    aws s3 mb "s3://$BUCKET_NAME" --region $REGION --profile $PROFILE
    echo -e "${GREEN}✅ Created bucket $BUCKET_NAME${NC}"
fi

# Enable static website hosting
echo -e "${YELLOW}🌐 Configuring static website hosting...${NC}"
aws s3 website "s3://$BUCKET_NAME" \
    --index-document index.html \
    --error-document 404.html \
    --profile $PROFILE

# Create bucket policy for public access
echo -e "${YELLOW}🔓 Setting bucket policy for public access...${NC}"
cat > /tmp/bucket-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy \
    --bucket "$BUCKET_NAME" \
    --policy file:///tmp/bucket-policy.json \
    --profile $PROFILE

# Disable block public access
echo -e "${YELLOW}🔧 Configuring public access settings...${NC}"
aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
    --profile $PROFILE

# Sync files to S3
echo -e "${YELLOW}📤 Uploading files to S3...${NC}"
aws s3 sync . "s3://$BUCKET_NAME" \
    --profile $PROFILE \
    --exclude ".git/*" \
    --exclude ".gitignore" \
    --exclude "*.md" \
    --exclude "*.sh" \
    --exclude ".DS_Store" \
    --exclude "node_modules/*" \
    --exclude "package*.json" \
    --exclude "nginx*.conf" \
    --exclude "Dockerfile" \
    --exclude ".github/*" \
    --delete \
    --cache-control "public, max-age=3600"

# Set cache headers for static assets
echo -e "${YELLOW}⚡ Setting cache headers for assets...${NC}"
aws s3 cp "s3://$BUCKET_NAME/docs/assets/" "s3://$BUCKET_NAME/docs/assets/" \
    --recursive \
    --profile $PROFILE \
    --metadata-directive REPLACE \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "*.html"

# Clean up
rm /tmp/bucket-policy.json

# Get website URL
WEBSITE_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "================================================"
echo -e "Website URL: ${GREEN}$WEBSITE_URL${NC}"
echo -e "S3 Bucket: ${GREEN}$BUCKET_NAME${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Visit your website at $WEBSITE_URL"
echo "2. Consider setting up CloudFront for HTTPS and better performance"
echo "3. Configure a custom domain with Route53"
echo ""
echo -e "${GREEN}Run './deploy-cloudfront.sh' to add CloudFront CDN${NC}"