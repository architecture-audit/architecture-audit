# AWS Deployment Guide for AI Architecture Audit

## 🚀 Deployment Options Overview

### Option 1: S3 Static Website Hosting (Recommended)
**Cost: ~$1-5/month** | **Complexity: Low** | **Setup Time: 15 minutes**

Perfect for static websites with no backend requirements.

```bash
# 1. Create S3 bucket
aws s3 mb s3://aiarchitectureaudit.com

# 2. Enable static website hosting
aws s3 website s3://aiarchitectureaudit.com \
  --index-document index.html \
  --error-document error.html

# 3. Set bucket policy for public access
aws s3api put-bucket-policy --bucket aiarchitectureaudit.com \
  --policy file://bucket-policy.json

# 4. Sync files
aws s3 sync . s3://aiarchitectureaudit.com \
  --exclude ".git/*" \
  --exclude "*.md" \
  --exclude "tests/*"
```

**Bucket Policy (bucket-policy.json):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::aiarchitectureaudit.com/*"
    }
  ]
}
```

### Option 2: S3 + CloudFront CDN
**Cost: ~$5-15/month** | **Complexity: Low-Medium** | **Setup Time: 30 minutes**

Adds global CDN, HTTPS, and better performance.

```bash
# 1. Create S3 bucket (private)
aws s3 mb s3://aiarchitectureaudit-origin

# 2. Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json

# 3. Upload files
aws s3 sync . s3://aiarchitectureaudit-origin \
  --exclude ".git/*" \
  --exclude "*.md"
```

**CloudFront Configuration:**
```json
{
  "CallerReference": "aiarchitectureaudit-2025",
  "Comment": "AI Architecture Audit CDN",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "S3-aiarchitectureaudit",
      "DomainName": "aiarchitectureaudit-origin.s3.amazonaws.com",
      "S3OriginConfig": {
        "OriginAccessIdentity": ""
      }
    }]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-aiarchitectureaudit",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "Compress": true,
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6"
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
  "Enabled": true
}
```

### Option 3: AWS Amplify Hosting
**Cost: ~$5-10/month** | **Complexity: Very Low** | **Setup Time: 10 minutes**

Easiest option with CI/CD built-in.

```bash
# 1. Install Amplify CLI
npm install -g @aws-amplify/cli

# 2. Initialize Amplify
amplify init

# 3. Add hosting
amplify add hosting

# 4. Publish
amplify publish
```

**amplify.yml:**
```yaml
version: 1
frontend:
  phases:
    build:
      commands:
        - echo "No build required for static site"
  artifacts:
    baseDirectory: /
    files:
      - '**/*'
  cache:
    paths: []
```

### Option 4: EC2 with Nginx
**Cost: ~$10-30/month** | **Complexity: Medium** | **Setup Time: 1 hour**

For more control and potential backend additions.

```bash
# 1. Launch EC2 instance
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.micro \
  --key-name your-key \
  --security-group-ids sg-xxxxxx \
  --user-data file://ec2-userdata.sh
```

**EC2 User Data Script (ec2-userdata.sh):**
```bash
#!/bin/bash
yum update -y
yum install -y nginx git

# Clone repository
git clone https://github.com/architecture-audit/frameworks.git /var/www/html

# Configure Nginx
cat > /etc/nginx/conf.d/aiarchitecture.conf <<EOF
server {
    listen 80;
    server_name aiarchitectureaudit.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
EOF

# Start Nginx
systemctl start nginx
systemctl enable nginx
```

### Option 5: ECS Fargate with Docker
**Cost: ~$20-50/month** | **Complexity: High** | **Setup Time: 2 hours**

For containerized deployment with auto-scaling.

**Dockerfile:**
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**task-definition.json:**
```json
{
  "family": "aiarchitecture-audit",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [{
    "name": "web",
    "image": "your-ecr-repo/aiarchitecture:latest",
    "portMappings": [{
      "containerPort": 80,
      "protocol": "tcp"
    }],
    "essential": true,
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/aiarchitecture",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "ecs"
      }
    }
  }]
}
```

### Option 6: Elastic Beanstalk
**Cost: ~$15-40/month** | **Complexity: Low-Medium** | **Setup Time: 30 minutes**

Managed platform with easy scaling.

**.ebextensions/static.config:**
```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:staticfiles:
    /: .
  aws:elasticbeanstalk:environment:proxy:staticfiles:
    /assets: docs/assets
    /calculators: calculators
```

**Deploy:**
```bash
# Initialize EB
eb init -p docker aiarchitecture-audit

# Create environment
eb create production

# Deploy
eb deploy
```

## 🏗️ Infrastructure as Code (Terraform)

**main.tf:**
```hcl
provider "aws" {
  region = "us-east-1"
}

# S3 Bucket
resource "aws_s3_bucket" "website" {
  bucket = "aiarchitectureaudit.com"
}

resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "website" {
  origin {
    domain_name = aws_s3_bucket_website_configuration.website.website_endpoint
    origin_id   = "S3-${aws_s3_bucket.website.id}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.website.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# Route53 (if using custom domain)
resource "aws_route53_zone" "main" {
  name = "aiarchitectureaudit.com"
}

resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "aiarchitectureaudit.com"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}
```

## 📊 Cost Comparison

| Option | Monthly Cost | Pros | Cons |
|--------|-------------|------|------|
| S3 Static | $1-5 | Cheapest, simple | No HTTPS by default |
| S3 + CloudFront | $5-15 | Fast, HTTPS, global | Slightly more complex |
| Amplify | $5-10 | CI/CD built-in | Less control |
| EC2 | $10-30 | Full control | Requires maintenance |
| ECS Fargate | $20-50 | Auto-scaling | Complex setup |
| Elastic Beanstalk | $15-40 | Managed platform | Less customization |

## 🚦 Deployment Pipeline (GitHub Actions)

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to AWS

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
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Deploy to S3
      run: |
        aws s3 sync . s3://aiarchitectureaudit.com \
          --exclude ".git/*" \
          --exclude "*.md" \
          --exclude ".github/*" \
          --delete
    
    - name: Invalidate CloudFront
      run: |
        aws cloudfront create-invalidation \
          --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
          --paths "/*"
```

## 🛡️ Security Best Practices

### 1. Enable AWS WAF
```bash
aws wafv2 create-web-acl \
  --name aiarchitecture-waf \
  --scope CLOUDFRONT \
  --default-action Allow={} \
  --rules file://waf-rules.json
```

### 2. Set Security Headers
```javascript
// CloudFront Function for security headers
function handler(event) {
    var response = event.response;
    var headers = response.headers;
    
    headers['strict-transport-security'] = { value: 'max-age=63072000; includeSubdomains; preload' };
    headers['x-content-type-options'] = { value: 'nosniff' };
    headers['x-frame-options'] = { value: 'DENY' };
    headers['x-xss-protection'] = { value: '1; mode=block' };
    headers['referrer-policy'] = { value: 'same-origin' };
    
    return response;
}
```

### 3. Enable S3 Versioning
```bash
aws s3api put-bucket-versioning \
  --bucket aiarchitectureaudit.com \
  --versioning-configuration Status=Enabled
```

## 🔄 Auto-Scaling Configuration

For EC2/ECS deployments:

```yaml
# Auto Scaling Group Configuration
AutoScalingGroup:
  MinSize: 1
  MaxSize: 5
  DesiredCapacity: 2
  TargetGroupARNs:
    - !Ref ALBTargetGroup
  HealthCheckType: ELB
  HealthCheckGracePeriod: 300
  
ScalingPolicy:
  PolicyType: TargetTrackingScaling
  TargetTrackingScalingPolicyConfiguration:
    PredefinedMetricSpecification:
      PredefinedMetricType: ASGAverageCPUUtilization
    TargetValue: 70
```

## 📈 Monitoring & Alerts

### CloudWatch Alarms
```bash
# High traffic alarm
aws cloudwatch put-metric-alarm \
  --alarm-name high-traffic \
  --alarm-description "Alert when requests exceed 10000/min" \
  --metric-name Requests \
  --namespace AWS/CloudFront \
  --statistic Sum \
  --period 60 \
  --threshold 10000 \
  --comparison-operator GreaterThanThreshold
```

### X-Ray Tracing
```javascript
// Add to your application
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
```

## 🎯 Quick Start Commands

```bash
# Clone repository
git clone https://github.com/architecture-audit/frameworks.git
cd frameworks

# Choose deployment method:

# Option 1: S3 Static (Simplest)
./deploy-s3.sh

# Option 2: Amplify (Easiest CI/CD)
amplify init && amplify publish

# Option 3: Docker + ECS (Scalable)
docker build -t aiarchitecture .
./deploy-ecs.sh

# Option 4: Terraform (Infrastructure as Code)
terraform init
terraform plan
terraform apply
```

## 📝 Environment Variables

Create `.env.production`:
```bash
REACT_APP_API_URL=https://api.aiarchitectureaudit.com
REACT_APP_REGION=us-east-1
REACT_APP_COGNITO_POOL_ID=us-east-1_xxxxx
```

## 🔗 Custom Domain Setup

1. Register domain in Route53
2. Request ACM certificate
3. Update CloudFront with custom domain
4. Create Route53 A record

```bash
# Request certificate
aws acm request-certificate \
  --domain-name aiarchitectureaudit.com \
  --validation-method DNS

# Update CloudFront
aws cloudfront update-distribution \
  --id E1234567890ABC \
  --distribution-config file://cf-custom-domain.json
```

## 💡 Optimization Tips

1. **Enable Gzip compression**
2. **Set cache headers for static assets**
3. **Use CloudFront for global distribution**
4. **Implement lazy loading for images**
5. **Minify CSS/JS files**
6. **Use S3 Transfer Acceleration for uploads**

## 🆘 Troubleshooting

### Common Issues:

1. **403 Forbidden**: Check S3 bucket policy
2. **Slow loading**: Enable CloudFront compression
3. **CORS errors**: Configure S3 CORS policy
4. **SSL issues**: Verify ACM certificate

### Debug Commands:
```bash
# Check S3 bucket policy
aws s3api get-bucket-policy --bucket aiarchitectureaudit.com

# View CloudFront distribution
aws cloudfront get-distribution --id E1234567890ABC

# Test website
curl -I https://aiarchitectureaudit.com
```

---

## 📚 Additional Resources

- [AWS Static Website Hosting Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Best Practices](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/best-practices.html)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

**Choose based on your needs:**
- **Simplest & Cheapest**: S3 Static Hosting
- **Best Performance**: S3 + CloudFront
- **Easiest CI/CD**: AWS Amplify
- **Most Control**: EC2 or ECS