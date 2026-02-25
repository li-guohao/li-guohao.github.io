@echo off
chcp 65001 >nul
echo ==========================================
echo   AI Ecosystem Sandbox - GitHub 部署脚本
echo ==========================================
echo.

REM 检查是否输入了用户名
if "%~1"=="" (
    echo 用法: deploy.bat YOUR_GITHUB_USERNAME
    echo 例如: deploy.bat johndoe
    echo.
    pause
    exit /b 1
)

set USERNAME=%~1
set REPO_URL=https://github.com/%USERNAME%/ai-ecosystem-sandbox.git

echo 将部署到: %REPO_URL%
echo.

REM 检查 git 是否安装
git --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Git 未安装！请先安装 Git: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [1/5] 检查 Git 仓库...
if not exist .git (
    echo 初始化 Git 仓库...
    git init
)

echo.
echo [2/5] 配置远程仓库...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo [3/5] 添加文件...
git add .

echo.
echo [4/5] 提交更改...
git commit -m "Deploy AI Ecosystem Sandbox" 2>nul || echo 无新更改需要提交

echo.
echo [5/5] 推送到 GitHub...
git branch -M main
git push -u origin main --force

if errorlevel 1 (
    echo.
    echo [错误] 推送失败！请检查：
    echo 1. 你是否在 GitHub 创建了仓库？
    echo 2. 用户名是否正确？
    echo 3. 是否已配置 Git 凭据？
    echo.
    echo 访问 https://github.com/new 创建仓库
    echo.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   ✅ 部署成功！
echo ==========================================
echo.
echo 仓库地址: https://github.com/%USERNAME%/ai-ecosystem-sandbox
echo.
echo 下一步：
echo 1. 访问 https://github.com/%USERNAME%/ai-ecosystem-sandbox
echo 2. 点击 Settings ^> Pages
echo 3. Source 选择 "GitHub Actions"
echo 4. 等待 2 分钟后访问:
echo    https://%USERNAME%.github.io/ai-ecosystem-sandbox
echo.
pause
