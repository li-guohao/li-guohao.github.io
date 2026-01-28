# 🚀 Personal .io Website Deployment Guide

## 部署到 GitHub Pages

本指南将帮助您将个人网站部署到 GitHub Pages，获得免费的托管服务。

### 📋 部署步骤

#### 1. 创建 GitHub 仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角的 "+" 号，选择 "New repository"
3. 仓库名称设置为：`li-guohao.github.io`（必须与您的用户名完全匹配）
4. 选择 "Public"（公开）
5. 不要初始化 README（我们已经有了）
6. 点击 "Create repository"

#### 2. 本地初始化并推送

打开终端，执行以下命令：

```bash
# 进入项目目录
cd "E:\miniMax\9\li-guohao.github.io"

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "🎉 Initial commit: Personal .io website v1.0"

# 添加远程仓库
git remote add origin https://github.com/li-guohao/li-guohao.github.io.git

# 推送到 GitHub
git push -u origin main
```

#### 3. 启用 GitHub Pages

1. 进入仓库页面：https://github.com/li-guohao/li-guohao.github.io
2. 点击 "Settings" 标签
3. 左侧菜单选择 "Pages"
4. 在 "Source" 部分：
   - Branch 选择 "main"
   - Folder 选择 "/ (root)"
   - 点击 "Save"
5. 等待 1-2 分钟，页面会自动刷新

#### 4. 访问您的网站

部署成功后，您可以通过以下地址访问：
- **主地址**: https://li-guohao.github.io
- **备用地址**: https://li-guohao.github.io/li-guohao.github.io/

---

## 🔧 自定义配置

### 更新个人信息

编辑 `index.html` 文件，替换以下内容：

```html
<!-- 邮箱 -->
<a href="mailto:li-guohao@example.com">

<!-- LinkedIn -->
<a href="https://linkedin.com/in/li-guohao">

<!-- Twitter -->
<a href="https://twitter.com/li-guohao">
```

### 更新项目链接

在 `index.html` 中找到项目链接部分：

```html
<!-- CAUSAL_FINANCE 项目 -->
<a href="https://github.com/li-guohao/CAUSAL_FINANCE">

<!-- 其他项目 -->
<a href="https://github.com/li-guohao/your-other-project">
```

### 更新统计数据

在 `about` 部分找到统计数字，修改 `data-target` 属性：

```html
<div class="stat-number" data-target="100">0</div>
```

---

## 🎨 自定义主题

### 修改配色方案

在 `styles.css` 文件中修改 CSS 变量：

```css
:root {
    /* 更改主色调 */
    --coral-red: #FF6B6B;      /* 修改为您的颜色 */
    --cyan-teal: #4ECDC4;      /* 修改为您的颜色 */
    --electric-blue: #45B7D1;  /* 修改为您的颜色 */
    --bright-yellow: #FFD93D;  /* 修改为您的颜色 */
    
    /* 背景色 */
    --dark-purple: #1a1a2e;    /* 修改为您的背景色 */
}
```

### 修改粒子颜色

在 `script.js` 中找到 `initParticles()` 函数：

```javascript
color: {
    value: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFD93D']
}
```

---

## 📱 本地测试

在部署之前，您可以在本地测试网站：

### 使用 Python（推荐）

```bash
# 进入项目目录
cd "E:\miniMax\9\li-guohao.github.io"

# 启动本地服务器
python -m http.server 8000

# 在浏览器中打开
# http://localhost:8000
```

### 使用 Node.js

```bash
# 安装 serve
npm install -g serve

# 启动本地服务器
serve

# 在浏览器中打开显示的地址
```

---

## 🔒 HTTPS 配置

GitHub Pages 自动提供 HTTPS 证书，无需额外配置。

## 🌐 自定义域名（可选）

如果您有自己的域名，可以配置自定义域名：

1. 在仓库 Settings → Pages 中找到 "Custom domain"
2. 输入您的域名（如：`li-guohao.io`）
3. 点击 "Save"
4. 在您的域名提供商处添加以下 DNS 记录：
   - A 记录：指向 GitHub IP 地址
   - CNAME 记录：`li-guohao.github.io`

---

## 📊 性能优化

### 已包含的优化

- ✅ 响应式设计（支持所有设备）
- ✅ 懒加载图片和组件
- ✅ 压缩的 CSS 和 JS
- ✅ 使用 CDN 加速第三方库
- ✅ 优化的动画性能

### 监控工具

- **Google PageSpeed Insights**: https://pagespeed.web.dev
- **GTmetrix**: https://gtmetrix.com
- **Pingdom**: https://tools.pingdom.com

---

## 🐛 常见问题

### Q: 网站没有显示？
**A**: 
1. 检查 GitHub Pages 是否已启用（Settings → Pages）
2. 等待 2-5 分钟让部署完成
3. 清除浏览器缓存
4. 尝试无痕模式访问

### Q: 粒子效果不显示？
**A**: 
1. 检查网络连接（需要加载 particles.js）
2. 检查浏览器控制台是否有错误
3. 确认 script.js 文件已正确加载

### Q: 动画效果卡顿？
**A**: 
1. 减少粒子数量（在 script.js 中）
2. 关闭硬件加速（在 styles.css 中）

---

## 📈 SEO 优化建议

### 添加 Meta 标签

在 `index.html` 的 `<head>` 部分添加：

```html
<meta name="description" content="Guohao Li - AI & Quant Researcher. Exploring causal inference in finance.">
<meta name="keywords" content="AI, Machine Learning, Quantitative Finance, Causal Inference, Python">
<meta name="author" content="Guohao Li">
<meta property="og:title" content="Guohao Li | AI & Quant Researcher">
<meta property="og:description" content="Exploring causal inference in finance">
<meta property="og:image" content="https://li-guohao.github.io/og-image.jpg">
```

### 添加站点地图

创建 `sitemap.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://li-guohao.github.io</loc>
        <changefreq>monthly</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>
```

---

## 📝 更新网站

### 本地修改后推送

```bash
# 查看更改
git status

# 添加更改的文件
git add .

# 提交更改
git commit -m "📝 Update: 您的更改描述"

# 推送到 GitHub
git push
```

GitHub Pages 会自动更新，通常在 1-2 分钟内生效。

---

## 🎉 恭喜！

您的个人网站已经上线！🎊

访问地址：https://li-guohao.github.io

### 下一步建议

1. **分享您的网站** - 在社交媒体上分享
2. **添加分析工具** - 如 Google Analytics
3. **持续更新** - 定期添加新项目和博客
4. **收集反馈** - 听取朋友和同事的意见

---

## 📞 获取帮助

如果您遇到问题：

1. 查看 [GitHub Pages 文档](https://docs.github.com/en/pages)
2. 搜索 [GitHub Community](https://github.com/community)
3. 联系 GitHub Support

---

**Made with ❤️ by Matrix Agent**
**© 2026 Guohao Li. All rights reserved.**
