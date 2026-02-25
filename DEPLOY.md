# 🚀 部署到 GitHub Pages 指南

## 自动部署（推荐）

本项目已配置 GitHub Actions 自动部署，只需简单的设置即可。

### 步骤 1: 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名称填写: `ai-ecosystem-sandbox`
3. 选择 **Public**（公开）
4. 点击 **Create repository**

### 步骤 2: 推送代码

```bash
# 在项目目录中执行
cd ai-ecosystem-sandbox

# 初始化git仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: AI Ecosystem Sandbox"

# 添加远程仓库（将 YOUR_USERNAME 替换为你的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/ai-ecosystem-sandbox.git

# 推送
git push -u origin main
```

### 步骤 3: 启用 GitHub Pages

1. 打开仓库页面: `https://github.com/YOUR_USERNAME/ai-ecosystem-sandbox`
2. 点击 **Settings**（设置）
3. 左侧菜单选择 **Pages**
4. **Source** 部分选择 **GitHub Actions**
5. 等待几分钟，访问: `https://YOUR_USERNAME.github.io/ai-ecosystem-sandbox`

## 手动部署（备用方案）

如果不想使用 GitHub Actions，可以手动部署到 `gh-pages` 分支：

```bash
# 创建并切换到 gh-pages 分支
git checkout --orphan gh-pages

# 保留需要的文件，删除其他
git rm -rf --cached .
git add index.html css/ js/ LICENSE
git commit -m "Deploy to GitHub Pages"

# 强制推送到 gh-pages 分支
git push origin gh-pages --force

# 切回主分支
git checkout main
```

然后在 GitHub 仓库设置中，将 Pages 的 Source 设置为 **Deploy from a branch**，选择 `gh-pages` 分支。

## ✅ 部署检查清单

- [ ] 创建了 GitHub 仓库
- [ ] 代码已推送到 main 分支
- [ ] GitHub Pages 已启用（GitHub Actions 或 gh-pages 分支）
- [ ] 访问 `https://YOUR_USERNAME.github.io/ai-ecosystem-sandbox` 可以看到页面
- [ ] README.md 中的链接已更新为你的用户名

## 🐛 故障排除

### 页面显示 404
- 确认仓库是 Public 的
- 检查 GitHub Pages 设置是否正确
- 等待 5-10 分钟再刷新

### Actions 部署失败
- 进入仓库的 Actions 标签查看错误信息
- 确认 `.github/workflows/deploy.yml` 文件存在
- 检查仓库 Settings > Actions > General 中的权限设置

### 样式或脚本加载失败
- 检查浏览器控制台的错误信息
- 确认文件路径大小写正确（Linux 服务器区分大小写）

## 📝 更新网站

只需推送新的提交到 main 分支，GitHub Actions 会自动重新部署：

```bash
git add .
git commit -m "Update: xxx"
git push origin main
```

等待约 1-2 分钟后，网站会自动更新。
