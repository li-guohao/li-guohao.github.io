#!/bin/bash

echo "=========================================="
echo "  AI Ecosystem Sandbox - GitHub 部署脚本"
echo "=========================================="
echo ""

# 检查是否输入了用户名
if [ -z "$1" ]; then
    echo "用法: ./deploy.sh YOUR_GITHUB_USERNAME"
    echo "例如: ./deploy.sh johndoe"
    echo ""
    exit 1
fi

USERNAME=$1
REPO_URL="https://github.com/$USERNAME/ai-ecosystem-sandbox.git"

echo "将部署到: $REPO_URL"
echo ""

# 检查 git 是否安装
if ! command -v git &> /dev/null; then
    echo "[错误] Git 未安装！请先安装 Git"
    echo "Mac: brew install git"
    echo "Linux: sudo apt-get install git"
    exit 1
fi

echo "[1/5] 检查 Git 仓库..."
if [ ! -d .git ]; then
    echo "初始化 Git 仓库..."
    git init
fi

echo ""
echo "[2/5] 配置远程仓库..."
git remote remove origin 2>/dev/null
git remote add origin $REPO_URL

echo ""
echo "[3/5] 添加文件..."
git add .

echo ""
echo "[4/5] 提交更改..."
git commit -m "Deploy AI Ecosystem Sandbox" 2>/dev/null || echo "无新更改需要提交"

echo ""
echo "[5/5] 推送到 GitHub..."
git branch -M main
git push -u origin main --force

if [ $? -ne 0 ]; then
    echo ""
    echo "[错误] 推送失败！请检查："
    echo "1. 你是否在 GitHub 创建了仓库？"
    echo "2. 用户名是否正确？"
    echo "3. 是否已配置 Git 凭据？"
    echo ""
    echo "访问 https://github.com/new 创建仓库"
    echo ""
    exit 1
fi

echo ""
echo "=========================================="
echo "  ✅ 部署成功！"
echo "=========================================="
echo ""
echo "仓库地址: https://github.com/$USERNAME/ai-ecosystem-sandbox"
echo ""
echo "下一步："
echo "1. 访问 https://github.com/$USERNAME/ai-ecosystem-sandbox"
echo "2. 点击 Settings > Pages"
echo "3. Source 选择 'GitHub Actions'"
echo "4. 等待 2 分钟后访问:"
echo "   https://$USERNAME.github.io/ai-ecosystem-sandbox"
echo ""
