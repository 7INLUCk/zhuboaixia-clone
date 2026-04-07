#!/bin/bash
# 助播虾原型 - Cloudflare Pages 一键部署脚本
# 用法: ./deploy.sh

set -e

CLOUDFLARE_API_TOKEN="cfut_kGpVAxSgkSLZ9AZOcV5IayKEnZ66HxNnf06GbQAQ70b1407b"
PROJECT_NAME="miaobo-b"

echo "🔨 Building..."
npm run build

echo "🚀 Deploying to Cloudflare Pages..."
CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN" npx wrangler pages deploy ./dist --project-name="$PROJECT_NAME" --branch=b --commit-dirty=true

echo "✅ Done!"
