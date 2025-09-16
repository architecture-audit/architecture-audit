#!/bin/bash

# Quick script to store API key in Parameter Store
echo "🔐 Storing OpenAI API key in AWS Parameter Store"
echo "========================================="

# Prompt for API key
echo "Enter your OpenAI API key:"
read -s API_KEY

if [ -z "$API_KEY" ]; then
    echo "❌ No API key provided"
    exit 1
fi

# Store in Parameter Store
aws ssm put-parameter \
    --name "/amplify/databricks-calculator/openai-api-key" \
    --value "$API_KEY" \
    --type "SecureString" \
    --overwrite \
    --region us-east-1 \
    --description "OpenAI API key for Databricks calculator"

if [ $? -eq 0 ]; then
    echo "✅ API key stored successfully!"
    echo ""
    echo "Testing retrieval..."
    aws ssm get-parameter \
        --name "/amplify/databricks-calculator/openai-api-key" \
        --with-decryption \
        --region us-east-1 \
        --query "Parameter.Value" \
        --output text | head -c 10
    echo "..."
    echo "✅ Parameter retrieval successful!"
else
    echo "❌ Failed to store parameter"
    exit 1
fi