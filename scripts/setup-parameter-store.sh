#!/bin/bash

# Setup script for AWS Parameter Store
# Run this once to store your OpenAI API key securely

echo "🔐 Setting up AWS Parameter Store for Databricks Calculator"
echo "=========================================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first:"
    echo "   brew install awscli  (on macOS)"
    echo "   or visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
echo "1. Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Run: aws configure"
    exit 1
fi

echo "✅ AWS credentials found"

# Get the API key
echo ""
echo "2. Enter your OpenAI API key:"
echo "   (Get it from: https://platform.openai.com/api-keys)"
read -s OPENAI_API_KEY

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ No API key provided"
    exit 1
fi

# Store in Parameter Store
PARAMETER_NAME="/amplify/databricks-calculator/openai-api-key"
REGION=${AWS_REGION:-us-east-1}

echo ""
echo "3. Storing API key in Parameter Store..."
echo "   Parameter: $PARAMETER_NAME"
echo "   Region: $REGION"

aws ssm put-parameter \
    --name "$PARAMETER_NAME" \
    --value "$OPENAI_API_KEY" \
    --type "SecureString" \
    --overwrite \
    --region "$REGION" \
    --description "OpenAI API key for Databricks calculator LLM cache generation" \
    2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ API key stored successfully!"
    echo ""
    echo "4. Testing parameter retrieval..."
    aws ssm get-parameter \
        --name "$PARAMETER_NAME" \
        --with-decryption \
        --query "Parameter.Value" \
        --output text \
        --region "$REGION" \
        > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo "✅ Parameter retrieval successful!"
    else
        echo "⚠️  Parameter stored but retrieval failed. Check IAM permissions."
    fi
else
    echo "❌ Failed to store parameter. Check your AWS permissions."
    exit 1
fi

echo ""
echo "=========================================================="
echo "✅ Setup complete! You can now run:"
echo "   npm run generate-cache"
echo ""
echo "For Amplify deployment, add this IAM policy to your service role:"
echo '
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters"
      ],
      "Resource": "arn:aws:ssm:*:*:parameter/amplify/databricks-calculator/*"
    }
  ]
}
'