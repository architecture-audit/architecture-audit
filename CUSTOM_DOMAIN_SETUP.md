# Custom Domain Setup for AWS Amplify

## Prerequisites
- Domain registered (via Route53, GoDaddy, Namecheap, etc.)
- Access to DNS management
- AWS Amplify app deployed (✅ Already done: d3qk0krzfez6q2)

## Option 1: Using AWS CLI (Automated)

### Step 1: Add Domain to Amplify
```bash
# Add your domain to Amplify app
aws amplify create-domain-association \
  --app-id d3qk0krzfez6q2 \
  --domain-name YOUR_DOMAIN.com \
  --sub-domain-settings "prefix=www,branchName=main" \
  --sub-domain-settings "prefix='',branchName=main" \
  --region ap-south-1
```

### Step 2: Get DNS Records
```bash
# Get the DNS records you need to add
aws amplify get-domain-association \
  --app-id d3qk0krzfez6q2 \
  --domain-name YOUR_DOMAIN.com \
  --region ap-south-1 \
  --query 'domainAssociation.subDomains[*].dnsRecord' \
  --output table
```

## Option 2: Using AWS Console (Visual)

1. **Open Amplify Console**:
   https://ap-south-1.console.aws.amazon.com/amplify/apps/d3qk0krzfez6q2/settings/domains

2. **Click "Add domain"**

3. **Enter your domain name**

4. **Configure subdomains**:
   - Add `www` subdomain → points to main branch
   - Add root domain → points to main branch

5. **Copy DNS records** provided by Amplify

## DNS Configuration

### For Route53 (AWS):
```bash
# If your domain is in Route53
aws route53 list-hosted-zones # Find your hosted zone ID

# Create CNAME records automatically
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch file://dns-records.json
```

### For External Registrars:

#### GoDaddy:
1. Log in to GoDaddy
2. Go to DNS Management
3. Add CNAME records:
   - Type: CNAME
   - Name: _aws_amplify_hostname_verification
   - Value: [Provided by Amplify]
   - TTL: 600

#### Namecheap:
1. Sign in to Namecheap
2. Domain List → Manage → Advanced DNS
3. Add new records:
   - CNAME Record for verification
   - CNAME Record for www
   - ALIAS/ANAME for root domain

#### Cloudflare:
1. Log in to Cloudflare
2. Select your domain
3. Go to DNS
4. Add CNAME records (set Proxy status to DNS only)

## Example DNS Records

```json
{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "_aws_amplify_hostname_verification.YOUR_DOMAIN.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "verification-code.amplify.app"
          }
        ]
      }
    },
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "www.YOUR_DOMAIN.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "d3qk0krzfez6q2.cloudfront.net"
          }
        ]
      }
    }
  ]
}
```

## SSL Certificate

AWS Amplify automatically:
- Requests SSL certificate from ACM
- Validates domain ownership
- Installs certificate
- Renews certificate automatically

## Verification Timeline

- **DNS Propagation**: 5 minutes - 48 hours
- **SSL Certificate**: 15-30 minutes after DNS verification
- **Full activation**: Usually within 1 hour

## Check Status

```bash
# Check domain association status
aws amplify get-domain-association \
  --app-id d3qk0krzfez6q2 \
  --domain-name YOUR_DOMAIN.com \
  --region ap-south-1 \
  --query 'domainAssociation.domainStatus' \
  --output text
```

Status progression:
1. `CREATING` - Initial setup
2. `REQUESTING_CERTIFICATE` - SSL certificate request
3. `PENDING_VERIFICATION` - Waiting for DNS
4. `PENDING_DEPLOYMENT` - Deploying configuration
5. `AVAILABLE` - Domain is active ✅

## Troubleshooting

### Domain not verifying?
```bash
# Check DNS propagation
nslookup _aws_amplify_hostname_verification.YOUR_DOMAIN.com

# Should return the Amplify verification CNAME
```

### SSL Certificate stuck?
```bash
# Check certificate status
aws amplify get-domain-association \
  --app-id d3qk0krzfez6q2 \
  --domain-name YOUR_DOMAIN.com \
  --region ap-south-1 \
  --query 'domainAssociation.certificate' \
  --output json
```

### Force refresh:
```bash
# Trigger re-verification
aws amplify update-domain-association \
  --app-id d3qk0krzfez6q2 \
  --domain-name YOUR_DOMAIN.com \
  --region ap-south-1
```

## Multiple Domains

To add multiple domains or subdomains:

```bash
# Add subdomain
aws amplify create-domain-association \
  --app-id d3qk0krzfez6q2 \
  --domain-name YOUR_DOMAIN.com \
  --sub-domain-settings "prefix=api,branchName=main" \
  --sub-domain-settings "prefix=docs,branchName=main" \
  --region ap-south-1
```

## Redirect Rules

Add redirects for SEO:

```bash
# Redirect non-www to www
aws amplify update-app \
  --app-id d3qk0krzfez6q2 \
  --custom-rules '[
    {
      "source": "https://YOUR_DOMAIN.com",
      "target": "https://www.YOUR_DOMAIN.com",
      "status": "301"
    }
  ]' \
  --region ap-south-1
```

## Quick Setup Script

Create `setup-domain.sh`:

```bash
#!/bin/bash

DOMAIN="YOUR_DOMAIN.com"
APP_ID="d3qk0krzfez6q2"
REGION="ap-south-1"

echo "🌐 Setting up domain: $DOMAIN"

# Add domain
aws amplify create-domain-association \
  --app-id $APP_ID \
  --domain-name $DOMAIN \
  --sub-domain-settings "prefix=www,branchName=main" \
  --sub-domain-settings "prefix='',branchName=main" \
  --region $REGION

# Get DNS records
echo "📝 DNS Records to add:"
aws amplify get-domain-association \
  --app-id $APP_ID \
  --domain-name $DOMAIN \
  --region $REGION \
  --query 'domainAssociation.subDomains[*].[subDomainSetting.prefix, dnsRecord]' \
  --output table

echo "✅ Add these DNS records to your domain registrar"
echo "⏳ Domain verification usually takes 15-60 minutes"
```

## Important Notes

1. **Keep existing DNS records** - Don't delete MX, TXT records
2. **Use DNS-only mode** if using Cloudflare (disable proxy)
3. **TTL** - Use low TTL (300-600) during setup
4. **Patience** - DNS propagation can take time
5. **Multiple domains** - Each domain needs separate association

---

**Ready to proceed?** Let me know your domain name and I'll help you set it up!