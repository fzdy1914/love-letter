# 部署指南：将情书网站部署到 GitHub Pages

## 前提条件

- 已安装 Node.js 18+
- 已安装 npm
- 拥有一个 GitHub 账号

## 第一步：准备情书

1. 在 `raw-letters/` 文件夹中创建 `.txt` 文件
2. 每个文件的**第一行**是密码（仅限字母和数字）
3. **其余行**是情书正文

例如 `raw-letters/my-letter.txt`：
```
love2026
亲爱的，

这是写给你的情书...

永远爱你的
```

## 第二步：加密情书

```bash
# 安装依赖（首次运行）
npm install

# 运行加密脚本
node scripts/encrypt-letters.mjs
```

脚本会读取 `raw-letters/` 中的所有 `.txt` 文件，加密后输出到 `public/letters/`。

## 第三步：构建网站

```bash
npm run build
```

构建产物在 `docs/` 文件夹中，包含：
- `docs/index.html` — 情书展示页面
- `docs/letters/` — 加密后的信件文件

## 第四步：推送到 GitHub

```bash
git add .
git commit -m "deploy: update letters"
git push origin main
```

**注意**：`docs/` 文件夹需要提交到 Git 仓库。`.gitignore` 中默认忽略了 `docs/`，如果你想通过提交 `docs/` 来部署，请从 `.gitignore` 中移除 `docs/` 这一行。

或者使用 GitHub Actions 自动构建（见下方"自动部署"章节）。

## 第五步：配置 GitHub Pages

1. 打开你的 GitHub 仓库页面
2. 点击 **Settings**（设置）
3. 左侧菜单找到 **Pages**
4. **Source** 选择 **Deploy from a branch**
5. **Branch** 选择 `main`，文件夹选择 `/docs`
6. 点击 **Save**

几分钟后，网站就会在以下地址上线：
```
https://<你的用户名>.github.io/love-letter/
```

## 第六步：分享链接

将以下格式的链接发给收信人：
```
https://<你的用户名>.github.io/love-letter/?l=<信件编号>&p=<密码>
```

例如：
```
https://username.github.io/love-letter/?l=my-letter&p=love2026
```

## 添加新情书

1. 在 `raw-letters/` 中新建 `.txt` 文件
2. 运行 `node scripts/encrypt-letters.mjs`
3. 运行 `npm run build`
4. 提交并推送
5. 分享新的链接给收信人

无需修改任何代码！

## 自定义仓库名称

如果你的仓库名不是 `love-letter`，需要修改 `vite.config.ts` 中的 `base` 路径：

```ts
base: command === 'serve' ? '/' : '/<你的仓库名>/',
```

## 自动部署（可选）

如果你不想每次都手动构建 `docs/`，可以使用 GitHub Actions：

1. 在仓库中创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: node scripts/encrypt-letters.mjs
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs
      - uses: actions/deploy-pages@v4
```

2. 在 GitHub 仓库 Settings → Pages 中，将 Source 改为 **GitHub Actions**
3. 此后每次推送到 main 分支都会自动构建部署

使用 GitHub Actions 时，可以保留 `.gitignore` 中的 `docs/` 忽略规则。

## 本地预览

```bash
npm run dev
```

- 情书页面：`http://localhost:5173/?l=demo&p=demo123`
