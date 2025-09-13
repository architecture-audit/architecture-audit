# Root Domain Configuration Fix

Since CNAME records are not allowed at the root domain, here are the solutions:

## Option 1: Use A Records (Most Common Solution)

First, let's get the IP addresses for the CloudFront distribution:

```bash
nslookup d19kbb25go9gma.cloudfront.net
```

### Add these A records for root domain:
**Type**: A
**Name**: @ (or leave blank)
**Value**: Use the IP addresses from CloudFront
**TTL**: 300

Note: CloudFront IPs may change, so this isn't ideal long-term.

## Option 2: Use ALIAS/ANAME (If Your Provider Supports It)

### For Namecheap:
- Type: **ALIAS Record**
- Host: **@**
- Value: `d19kbb25go9gma.cloudfront.net`
- TTL: Automatic

### For GoDaddy:
GoDaddy doesn't support ALIAS records for root domain pointing to external services.
**Workaround**: Use forwarding
1. Set up domain forwarding from aiarchitectureaudit.com to www.aiarchitectureaudit.com
2. Type: **301 Permanent Forward**
3. Forward to: `https://www.aiarchitectureaudit.com`

### For Cloudflare (Recommended):
1. Add your domain to Cloudflare (free plan)
2. Use Cloudflare's CNAME flattening:
   - Type: **CNAME**
   - Name: **@**
   - Target: `d19kbb25go9gma.cloudfront.net`
   - Proxy status: **DNS only** (gray cloud)

### For Google Domains:
- Type: **Synthetic record** → **Subdomain forward**
- Subdomain: **@**
- Destination: `https://www.aiarchitectureaudit.com`

### For Route53 (AWS):
If you transfer your domain to Route53:
- Type: **A** (Alias)
- Alias: Yes
- Alias Target: `d19kbb25go9gma.cloudfront.net`

## Option 3: Redirect Root to WWW (Simplest)

If your registrar doesn't support ALIAS/ANAME:

1. **Set up domain forwarding**:
   - From: `aiarchitectureaudit.com`
   - To: `https://www.aiarchitectureaudit.com`
   - Type: 301 Permanent
   - Forward with masking: NO

2. **Only use the www subdomain** (which is already configured)

## Option 4: Use WWW as Primary

Update Amplify to use www as the primary domain:

```bash
aws amplify update-domain-association \
  --app-id d3qk0krzfez6q2 \
  --domain-name aiarchitectureaudit.com \
  --sub-domain-settings prefix=www,branchName=main \
  --region ap-south-1
```

Then market your site as: **www.aiarchitectureaudit.com**

## Quick Check - What's Your DNS Provider?

Tell me which DNS provider you're using and I can give you the exact steps:
- Namecheap → Use ALIAS record
- GoDaddy → Use domain forwarding
- Cloudflare → Use CNAME flattening
- Google Domains → Use synthetic records
- Other → Let me know which one

## Verification

Once configured, test with:
```bash
# Check root domain
dig aiarchitectureaudit.com

# Check www subdomain  
dig www.aiarchitectureaudit.com

# Test redirect
curl -I aiarchitectureaudit.com
```