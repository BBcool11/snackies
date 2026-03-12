# 🚀 部署指南

## 方案一：Vercel 部署（推荐，最简单）

### 1. 准备代码
确保 `dist` 目录已生成：
```bash
npm run build
```

### 2. 安装 Vercel CLI
```bash
npm i -g vercel
```

### 3. 部署
```bash
cd "/Users/zoe/Downloads/app 2"
vercel --prod
```

### 4. 或使用 Vercel 网站部署
1. 访问 https://vercel.com
2. 用 GitHub 账号登录
3. 导入项目或拖拽 `dist` 文件夹上传

---

## 方案二：Netlify 部署

### 1. 拖拽部署（最简单）
1. 访问 https://app.netlify.com/drop
2. 将 `dist` 文件夹拖拽到网页上
3. 自动生成网址！

### 2. 或使用 CLI
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## 方案三：GitHub Pages 部署

### 1. 创建 GitHub 仓库
```bash
# 在 GitHub 创建新仓库，然后：
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

### 2. 启用 GitHub Pages
1. 进入仓库 Settings → Pages
2. Source 选择 "Deploy from a branch"
3. Branch 选择 "main"，文件夹选择 "/dist"
4. 保存后等待几分钟，会生成网址

---

## 方案四：静态文件托管（任意服务器）

将 `dist` 目录下的所有文件上传到任意静态服务器：

```
dist/
├── index.html          ← 入口文件
├── assets/             ← CSS/JS
├── snack-images/       ← 怀旧零食图片 (274张)
├── snack-images-hot/   ← 热门零食图片 (95张)
└── ...
```

### 常用托管平台
- **腾讯云 COS**: https://console.cloud.tencent.com/cos
- **阿里云 OSS**: https://oss.console.aliyun.com
- **七牛云**: https://portal.qiniu.com
- **AWS S3**: https://s3.console.aws.amazon.com

---

## 📦 本地预览部署包

已生成部署包在 `dist/` 目录，包含：
- ✅ 365个零食数据
- ✅ 274张怀旧零食图片
- ✅ 95张热门零食图片
- ✅ 完整的 CSS/JS

### 本地预览
```bash
cd "/Users/zoe/Downloads/app 2/dist"
python3 -m http.server 8080
# 访问 http://localhost:8080
```

---

## 🔧 部署前检查清单

- [ ] `npm run build` 成功
- [ ] `dist/snack-images/` 存在 (274张图片)
- [ ] `dist/snack-images-hot/` 存在 (95张图片)
- [ ] `dist/index.html` 存在

---

## 🌐 部署后网址示例

- Vercel: `https://snack-archive.vercel.app`
- Netlify: `https://snack-archive.netlify.app`
- GitHub Pages: `https://你的用户名.github.io/仓库名`
# Deploy 2026年 3月12日 星期四 16时38分39秒 CST
