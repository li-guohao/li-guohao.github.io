# 🚀 部署到 GitHub Pages - 详细步骤

## 准备工作

项目已在本地初始化并提交。现在需要推送到 GitHub。

---

## 方法一：命令行部署（推荐）

### 步骤 1: 在 GitHub 创建仓库

1. 打开 https://github.com/new
2. 填写信息：
   - **Repository name**: `ai-ecosystem-sandbox`
   - **Description**: 🧬 AI Ecosystem Sandbox - 神经网络驱动的进化生态系统
   - 选择 **Public**
   - 勾选 **Add a README file** (可选)
3. 点击 **Create repository**

### 步骤 2: 推送代码

在终端执行以下命令（将 `YOUR_USERNAME` 替换为你的 GitHub 用户名）：

```bash
# 进入项目目录
cd ai-ecosystem-sandbox

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/ai-ecosystem-sandbox.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

**如果推送失败，尝试：**

```bash
# 强制推送（首次推送时使用）
git push -u origin main --force
```

### 步骤 3: 启用 GitHub Pages

1. 打开仓库页面：`https://github.com/YOUR_USERNAME/ai-ecosystem-sandbox`
2. 点击 **Settings**（顶部标签）
3. 左侧菜单选择 **Pages**
4. **Build and deployment** 部分：
   - **Source**: 选择 **GitHub Actions**
5. 等待 1-2 分钟

### 步骤 4: 访问网站

部署完成后，访问：
```
https://YOUR_USERNAME.github.io/ai-ecosystem-sandbox
```

---

## 方法二：GitHub Desktop（图形界面）

1. 下载 [GitHub Desktop](https://desktop.github.com/)
2. 登录你的 GitHub 账号
3. 点击 **File** → **Add local repository**
4. 选择 `ai-ecosystem-sandbox` 文件夹
5. 点击 **Publish repository**
6. 勾选 **Keep this code private**（取消勾选，保持公开）
7. 点击 **Publish repository**
8. 然后在网页上启用 GitHub Pages（见方法一步骤3）

---

## 方法三：VS Code 部署

1. 在 VS Code 中打开项目
2. 安装 **GitHub Pull Requests and Issues** 扩展
3. 点击左侧活动栏的 **源代码管理** 图标（分支图标）
4. 点击 **发布到 GitHub**
5. 按照提示登录并选择发布为 Public repository
6. 在网页上启用 GitHub Pages（见方法一步骤3）

---

## 🔧 故障排除

### 问题 1: "Permission denied" 或 "403"
需要配置 Git 凭据：

```bash
# 配置用户名和邮箱
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 使用 token 登录（推荐）
# 访问 https://github.com/settings/tokens 创建 Personal Access Token
# 然后推送时会要求输入 token 作为密码
```

### 问题 2: "rejected: non-fast-forward"
```bash
git pull origin main --rebase
git push origin main
```

### 问题 3: GitHub Pages 显示 404
- 确认仓库是 Public
- 等待 2-3 分钟再刷新
- 检查 Settings > Pages 中的 Source 设置
- 确认 `index.html` 在仓库根目录

---

## 📝 部署后更新

后续修改后重新部署：

```bash
cd ai-ecosystem-sandbox
git add .
git commit -m "Update: 描述你的修改"
git push origin main
```

GitHub Actions 会自动重新部署！

---

## ✅ 部署检查清单

- [ ] GitHub 仓库已创建
- [ ] 代码已推送到 main 分支
- [ ] GitHub Pages 已启用（GitHub Actions）
- [ ] 网站可以访问
- [ ] 2D 模式正常
- [ ] 3D 模式正常（点击 3D 按钮）

---

## 🎯 你的仓库地址将会是

```
https://github.com/YOUR_USERNAME/ai-ecosystem-sandbox
```

网站地址：
```
https://YOUR_USERNAME.github.io/ai-ecosystem-sandbox
```

把 `YOUR_USERNAME` 替换为你的 GitHub 用户名即可！

---

需要帮助？可以问我！
