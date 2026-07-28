#!/bin/bash
set -e
cd "$(dirname "$0")/.."

# Read and increment version
VERSION_FILE="app/VERSION"
CURRENT=$(cat "$VERSION_FILE")
NEW=$((CURRENT + 1))
echo "$NEW" > "$VERSION_FILE"

# Update all ?v= references in index.html
sed -i '' "s/\?v=[0-9]*/\?v=$NEW/g" app/index.html

echo "Bumped version to v=$NEW"

# Deploy
aws s3 sync app s3://kuettai-unlock-asset/app/ --delete --exclude "*.DS_Store" --region ap-southeast-1
aws s3 sync scenarios s3://kuettai-unlock-asset/scenarios/ --exclude "*.DS_Store" --region ap-southeast-1
aws cloudfront create-invalidation --distribution-id E2C30I0Z1TIG84 --paths "/*" --region us-east-1

echo "Deployed and invalidated. Version: v=$NEW"
