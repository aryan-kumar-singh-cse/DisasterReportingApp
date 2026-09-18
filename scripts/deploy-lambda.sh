#!/bin/bash
#
# deploy-lambda.sh — Packages and deploys the ResQ backend Lambda function
#
# Usage:
#   bash scripts/deploy-lambda.sh <LAMBDA_FUNCTION_NAME> <AWS_REGION>
#
# Example:
#   bash scripts/deploy-lambda.sh DisasterReportHandler ap-south-1
#
# Prerequisites:
#   - AWS CLI configured with credentials (aws configure)
#   - Lambda function already created in AWS console
#   - Environment variables TABLE_NAME and BUCKET_NAME already set on the Lambda

set -e

FUNCTION_NAME="${1:-DisasterReportHandler}"
REGION="${2:-ap-south-1}"
DEPLOY_DIR="/tmp/resq-lambda-deploy"
ZIP_FILE="/tmp/resq-lambda.zip"

echo "=== ResQ Lambda Deployment Script ==="
echo "Function: $FUNCTION_NAME"
echo "Region:   $REGION"
echo ""

# 1. Clean up any previous deployment
rm -rf "$DEPLOY_DIR" "$ZIP_FILE"
mkdir -p "$DEPLOY_DIR"

# 2. Copy backend source code
echo "[1/4] Copying backend source code..."
cp -r "$(dirname "$0")/../backend/src/"* "$DEPLOY_DIR/"
cp "$(dirname "$0")/../backend/package.json" "$DEPLOY_DIR/"

# 3. Create the Lambda entrypoint (index.mjs wrapper for ESM)
echo "[2/4] Creating Lambda entrypoint..."
cat > "$DEPLOY_DIR/index.mjs" << 'EOF'
// ESM Lambda entrypoint
export { handler } from './index.js';
EOF

# 4. Install production dependencies
echo "[3/4] Installing production dependencies..."
cd "$DEPLOY_DIR"
npm install --omit=dev --ignore-scripts

# 5. Create deployment ZIP
echo "[4/4] Creating deployment package..."
cd "$DEPLOY_DIR"
zip -r "$ZIP_FILE" . -x "*.git*" > /dev/null

ZIP_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
echo ""
echo "Deployment package created: $ZIP_FILE ($ZIP_SIZE)"
echo ""

# 6. Deploy to AWS Lambda
echo "Deploying to AWS Lambda..."
aws lambda update-function-code \
  --function-name "$FUNCTION_NAME" \
  --zip-file "fileb://$ZIP_FILE" \
  --region "$REGION" \
  --no-cli-pager

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Test with:"
echo "  curl https://<api-gateway-id>.execute-api.$REGION.amazonaws.com/health"
echo ""
echo "Don't forget to set Lambda environment variables:"
echo "  TABLE_NAME=DisasterReports"
echo "  BUCKET_NAME=<your-s3-bucket-name>"
echo "  AWS_REGION=$REGION"
echo ""
echo "And set Lambda Handler to: index.handler"
echo "And set Lambda Runtime to: Node.js 20.x"
