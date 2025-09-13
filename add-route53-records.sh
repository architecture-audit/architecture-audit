#!/bin/bash

# Route53 DNS Records Setup for aiarchitectureaudit.com
HOSTED_ZONE_ID="Z00754358WOW33I58K8D"
CLOUDFRONT_DOMAIN="d19kbb25go9gma.cloudfront.net"

echo "🚀 Adding DNS records to Route53..."

# 1. Add SSL Certificate Verification CNAME
echo "Adding SSL certificate verification record..."
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "_c5048cc4ce7d504d911fb40929c5c31e.aiarchitectureaudit.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{
          "Value": "_f7d7e1618942e6a9d577ce8bc948ffea.xlfgrmvvlj.acm-validations.aws."
        }]
      }
    }]
  }'

# 2. Add root domain ALIAS record (Route53 special feature)
echo "Adding root domain ALIAS record..."
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "aiarchitectureaudit.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "'$CLOUDFRONT_DOMAIN'",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'

# 3. Add www subdomain CNAME
echo "Adding www subdomain..."
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "www.aiarchitectureaudit.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{
          "Value": "'$CLOUDFRONT_DOMAIN'"
        }]
      }
    }]
  }'

# 4. Add root domain AAAA record for IPv6
echo "Adding IPv6 support..."
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "aiarchitectureaudit.com",
        "Type": "AAAA",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "'$CLOUDFRONT_DOMAIN'",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'

echo "✅ All DNS records added successfully!"
echo ""
echo "📊 Checking records..."
aws route53 list-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --query "ResourceRecordSets[?Type != 'NS' && Type != 'SOA'].[Name, Type]" \
  --output table

echo ""
echo "⏰ Timeline:"
echo "- Nameserver propagation: 1-48 hours (usually 1-2 hours)"
echo "- SSL certificate validation: 15-30 minutes after DNS propagates"
echo "- Full domain activation: Within 2-3 hours typically"
echo ""
echo "🔍 Check domain status:"
echo "aws amplify get-domain-association --app-id d3qk0krzfez6q2 --domain-name aiarchitectureaudit.com --region ap-south-1 --query 'domainAssociation.domainStatus' --output text"