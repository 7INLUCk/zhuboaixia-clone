#!/bin/bash
# 伴播原型（方案B）- Cloudflare Pages 部署脚本
# 用法: ./deploy-b.sh

set -e

CLOUDFLARE_API_TOKEN="cfut_kGpVAxSgkSLZ9AZOcV5IayKEnZ66HxNnf06GbQAQ70b1407b"
PROJECT_NAME="miaobo-b"

echo "🔨 Building..."
npm run build

echo "🚀 Deploying to Cloudflare Pages ($PROJECT_NAME)..."
CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN" npx wrangler pages deploy ./dist --project-name="$PROJECT_NAME" --branch=b --commit-dirty=true

echo "✅ Done! https://$PROJECT_NAME.pages.dev"
