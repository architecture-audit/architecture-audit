#!/bin/bash

# CloudFront Deployment Script for AI Architecture Audit
# Adds CDN, HTTPS, and improved performance to S3 static website

set -e

# Configuration
BUCKET_NAME="aiarchitectureaudit.com"
REGION="us-east-1"
PROFILE="default"
DOMAIN_NAME="${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}☁️  AI Architecture Audit - CloudFront Deployment${NC}"
echo "================================================"

# Check if bucket exists
echo -e "${YELLOW}🔍 Checking S3 bucket...${NC}"
if ! aws s3api head-bucket --bucket "$BUCKET_NAME" --profile $PROFILE 2>/dev/null; then
    echo -e "${RED}❌ Bucket $BUCKET_NAME doesn't exist. Run deploy-s3.sh first.${NC}"
    exit 1
fi

# Create CloudFront Origin Access Identity
echo -e "${YELLOW}🔐 Creating Origin Access Identity...${NC}"
OAI_ID=$(aws cloudfront create-cloud-front-origin-access-identity \
    --cloud-front-origin-access-identity-config \
    "CallerReference=$(date +%s),Comment=OAI for $BUCKET_NAME" \
    --profile $PROFILE \
    --query 'CloudFrontOriginAccessIdentity.Id' \
    --output text 2>/dev/null || echo "existing")

if [ "$OAI_ID" = "existing" ]; then
    # Get existing OAI
    OAI_ID=$(aws cloudfront list-cloud-front-origin-access-identities \
        --profile $PROFILE \
        --query "CloudFrontOriginAccessIdentityList.Items[?Comment=='OAI for $BUCKET_NAME'].Id | [0]" \
        --output text)
    echo -e "${GREEN}✅ Using existing OAI: $OAI_ID${NC}"
else
    echo -e "${GREEN}✅ Created OAI: $OAI_ID${NC}"
fi

# Create CloudFront distribution configuration
echo -e "${YELLOW}📝 Creating CloudFront configuration...${NC}"
cat > /tmp/cloudfront-config.json <<EOF
{
    "CallerReference": "$(date +%s)",
    "Comment": "AI Architecture Audit CDN",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [{
            "Id": "S3-$BUCKET_NAME",
            "DomainName": "$BUCKET_NAME.s3.amazonaws.com",
            "S3OriginConfig": {
                "OriginAccessIdentity": "origin-access-identity/cloudfront/$OAI_ID"
            }
        }]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$BUCKET_NAME",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {"Forward": "none"},
            "Headers": {
                "Quantity": 0
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": true,
        "AllowedMethods": {
            "Quantity": 2,
            "Items": ["GET", "HEAD"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"]
            }
        }
    },
    "CacheBehaviors": {
        "Quantity": 2,
        "Items": [
            {
                "PathPattern": "*.js",
                "TargetOriginId": "S3-$BUCKET_NAME",
                "ViewerProtocolPolicy": "redirect-to-https",
                "TrustedSigners": {
                    "Enabled": false,
                    "Quantity": 0
                },
                "ForwardedValues": {
                    "QueryString": false,
                    "Cookies": {"Forward": "none"},
                    "Headers": {"Quantity": 0}
                },
                "MinTTL": 31536000,
                "DefaultTTL": 31536000,
                "MaxTTL": 31536000,
                "Compress": true,
                "AllowedMethods": {
                    "Quantity": 2,
                    "Items": ["GET", "HEAD"],
                    "CachedMethods": {
                        "Quantity": 2,
                        "Items": ["GET", "HEAD"]
                    }
                }
            },
            {
                "PathPattern": "*.css",
                "TargetOriginId": "S3-$BUCKET_NAME",
                "ViewerProtocolPolicy": "redirect-to-https",
                "TrustedSigners": {
                    "Enabled": false,
                    "Quantity": 0
                },
                "ForwardedValues": {
                    "QueryString": false,
                    "Cookies": {"Forward": "none"},
                    "Headers": {"Quantity": 0}
                },
                "MinTTL": 31536000,
                "DefaultTTL": 31536000,
                "MaxTTL": 31536000,
                "Compress": true,
                "AllowedMethods": {
                    "Quantity": 2,
                    "Items": ["GET", "HEAD"],
                    "CachedMethods": {
                        "Quantity": 2,
                        "Items": ["GET", "HEAD"]
                    }
                }
            }
        ]
    },
    "CustomErrorResponses": {
        "Quantity": 2,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/404.html",
                "ResponseCode": "404",
                "ErrorCachingMinTTL": 300
            },
            {
                "ErrorCode": 403,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 0
            }
        ]
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100",
    "ViewerCertificate": {
        "CloudFrontDefaultCertificate": true,
        "MinimumProtocolVersion": "TLSv1.2_2021"
    },
    "HttpVersion": "http2"
}
EOF

# Create CloudFront distribution
echo -e "${YELLOW}🚀 Creating CloudFront distribution...${NC}"
DISTRIBUTION_ID=$(aws cloudfront create-distribution \
    --distribution-config file:///tmp/cloudfront-config.json \
    --profile $PROFILE \
    --query 'Distribution.Id' \
    --output text)

echo -e "${GREEN}✅ Created CloudFront distribution: $DISTRIBUTION_ID${NC}"

# Get distribution domain name
DISTRIBUTION_DOMAIN=$(aws cloudfront get-distribution \
    --id $DISTRIBUTION_ID \
    --profile $PROFILE \
    --query 'Distribution.DomainName' \
    --output text)

# Update S3 bucket policy to allow CloudFront
echo -e "${YELLOW}🔧 Updating S3 bucket policy for CloudFront...${NC}"
cat > /tmp/bucket-policy-cf.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowCloudFrontOAI",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity $OAI_ID"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        },
        {
            "Sid": "AllowCloudFrontList",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity $OAI_ID"
            },
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::$BUCKET_NAME"
        }
    ]
}
EOF

aws s3api put-bucket-policy \
    --bucket "$BUCKET_NAME" \
    --policy file:///tmp/bucket-policy-cf.json \
    --profile $PROFILE

# Create invalidation script
echo -e "${YELLOW}📄 Creating invalidation script...${NC}"
cat > invalidate-cache.sh <<EOF
#!/bin/bash
# Invalidate CloudFront cache
aws cloudfront create-invalidation \\
    --distribution-id $DISTRIBUTION_ID \\
    --paths "/*" \\
    --profile $PROFILE
echo "✅ Cache invalidation created"
EOF
chmod +x invalidate-cache.sh

# Clean up
rm /tmp/cloudfront-config.json
rm /tmp/bucket-policy-cf.json

# Display results
echo ""
echo -e "${GREEN}🎉 CloudFront Deployment Complete!${NC}"
echo "================================================"
echo -e "Distribution ID: ${GREEN}$DISTRIBUTION_ID${NC}"
echo -e "CloudFront URL: ${GREEN}https://$DISTRIBUTION_DOMAIN${NC}"
echo ""
echo -e "${YELLOW}⏳ Note: Distribution deployment takes 15-20 minutes${NC}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "1. Wait for distribution to deploy (check status below)"
echo "2. Visit https://$DISTRIBUTION_DOMAIN when ready"
echo "3. Consider adding a custom domain with ACM certificate"
echo "4. Run './invalidate-cache.sh' after updates"
echo ""
echo -e "${YELLOW}Check deployment status:${NC}"
echo "aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.Status' --profile $PROFILE"
echo ""
echo -e "${GREEN}Distribution will be available at: https://$DISTRIBUTION_DOMAIN${NC}"