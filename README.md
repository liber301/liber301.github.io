# liber 的个人博客

网站：[liber301.github.io](https://liber301.github.io/)

本地目录：`/Users/mmmlq/codeProject/github_liber_com`。已作为“liber 个人博客”加入 `ai-coding-workspace/ai-coding.code-workspace`。

中文个人博客，使用 Markdown 写文章，GitHub Pages 托管。包含前端登录界面、分类、搜索、归档、标签、文章目录、代码复制、深浅主题、RSS 和 404 页面，无需数据库或后端服务器。

## 账号和密码怎么改

已配置 `admin`、`liber`、`liber301`、`zyf` 四个账号，密码按用户指定设置，源码只保存各账号独立的盐值和密码摘要。四个账号均用于阅读博客；`admin` 只是账号名，没有额外管理权限。

在项目目录运行：

```sh
cd /Users/mmmlq/codeProject/github_liber_com
npm run set-password
# 也可以指定要修改的账号，例如：
npm run set-password -- admin
```

按提示选择账号并输入两次新密码（输入密码时不回显）。命令只新增或修改选中的账号，保留其他账号。配置位于 `login.config.json` 的 `accounts` 数组，每项包含 `username`、`salt` 和 `passwordHash`。可以直接编辑账号名，或删除对应数组项以移除账号；账号名必须唯一，不要把明文密码写入 `passwordHash`。密码区分大小写、空格和全角/半角符号，按输入原样校验。

配置随代码管理，重新构建、提交并推送后在线生效。修改账号或密码会使旧会话失效。登录在当前标签页保持，刷新和站内跳转不会要求再次登录；关闭标签页后需重新登录，也可以点击顶部“退出”。浏览器恢复已关闭标签页时可能恢复其会话。

**这是前端界面登录，不是服务端鉴权。** 网站和 GitHub 源码仓库仍为公开；查看源码、修改浏览器会话、直接请求 HTML、RSS 或搜索索引均可能绕过登录。密码摘要仅避免直接存放明文，不构成内容加密。请勿在这里发布需要保密的文章或复用其他服务的密码。`noindex` 只是请求搜索引擎不收录，不提供访问控制。

## 本地运行

需要 Node.js 20 或更高版本。

```sh
npm ci
npm run build
npm run check
npm run preview
```

浏览器打开 `http://127.0.0.1:4321`，本地也会显示登录页。修改内容后重新构建，刷新查看。

## 在网站上写作和发布

登录后打开 [写作台](https://liber301.github.io/write/)。阅读登录账号与 GitHub 发布权限是两件事：四个博客账号都能阅读，只有持有此仓库写权限的 GitHub 授权才能发布。

首次发布，展开“连接 GitHub”，在 GitHub 创建一个 fine-grained personal access token：

1. Resource owner 选择 `liber301`。
2. Repository access 选择 **Only select repositories**，只勾选 `liber301.github.io`。
3. Repository permissions 中只需 **Contents → Read and write**，Metadata 的只读权限由 GitHub 自动附带；不需要账户管理、工作流文件或其他仓库权限。
4. 设置合适的有效期，生成后仅粘贴到博客写作台的令牌输入框，再点击“连接仓库”。不要把令牌写进代码、文章、聊天或截图。

令牌只在当前页面内存中使用，不写入 localStorage、IndexedDB、Git 仓库或 URL；刷新、退出或断开连接后需要重新填写。发布请求直接发送给 `api.github.com`，没有额外代理服务器。GitHub 可能会要求你重新登录或验证身份。

写作台提供三种内容：

| 类型 | 使用方法 | 阅读入口 |
| --- | --- | --- |
| 长文章 | 标题和 Markdown 正文，使用工具栏插入标题、加粗、引用、列表或多张图片 | `/articles/` |
| 短文 | 可以不写标题，自动从正文提取；短文按日期排列，也可插图 | `/notes/` |
| 图片 | 添加 1–12 张 JPG、PNG、WebP 图片，填写标题、说明和可选正文 | `/photos/` |

图片选择后会缩放至最长边不超过 2400 像素并重新编码压缩，单张原图上限 20 MB，整组压缩图片合计约 10 MB。图片说明可编辑；图文正文里的图片 Markdown 引用可以移动到任意段落之间。正文从 `##` 二级标题开始，页面标题由上方标题栏提供。

草稿与待上传图片自动保存到当前浏览器的 IndexedDB，可点击“保存草稿”手动保存。草稿不会跨设备同步，清除浏览器数据会删除草稿；请勿在发布中途关闭页面。

点击“发布这条记录”后，正文和图片原子提交到 GitHub，页面分别提示“已提交”和“部署完成”。部署失败时，内容仍已在 GitHub 中保存，应查看部署日志，避免重复发布。新记录的链接名必须唯一；发布下一条请点击“新建记录”。目前写作台用于新增内容，修改或删除已发布内容请在本地 Markdown 或 GitHub 文件编辑器中进行。

从网页发布后，本地修改前先在项目目录执行 `git pull --ff-only`，把新文章和图片拉回电脑。

## 在本地写文章

仍可在 `content/posts/` 新增 `.md` 文件，`kind` 默认是 `article`：

```yaml
---
title: "文章标题"
slug: "my-new-post"
date: "2026-11-01"
kind: "article"
category: "开发笔记"
tags: ["学习", "记录"]
excerpt: "一到两句文章摘要。"
---
```

短文使用 `kind: "note"`；相册使用 `kind: "photo"`，并添加图片数组：

```yaml
images:
  - src: "/assets/我的图片.jpg"
    alt: "图片说明"
```

正文中插图：`![图片说明](/assets/我的图片.jpg)`。文章支持可选的 `cover: "/assets/封面.jpg"`。`slug` 必须唯一，`draft: true` 隐藏草稿，`sample: true` 标记示例。现有长文链接继续使用 `/posts/<slug>/`。

首版的短文和相册含明确标记的排版示例；相册中是原创矢量插画，并非作者的实拍照片，可自由替换或删除。

## 上传并自动发布

确认本地效果后，在项目目录执行：

```sh
npm run build
npm run check
git add .
git commit -m "更新博客"
git push origin main
```

推送后，GitHub Actions 的 `Deploy blog to GitHub Pages` 工作流自动构建、检查并发布。等仓库 Actions 显示成功，刷新原网址查看。Pages 设置使用 GitHub Actions 作为发布源。

## 修改哪些文件

| 文件或目录 | 用途 |
| --- | --- |
| `login.config.json` | 登录账号、盐值和密码摘要 |
| `scripts/set-password.mjs` | 本地修改账号和密码 |
| `assets/auth.js` | 登录校验、会话、退出和跳转 |
| `site.config.json` | 博客名称、简介、网址 |
| `content/posts/` | Markdown 文章 |
| `content/about.md` | 关于页 |
| `src/templates.mjs` | 页面结构，包括登录页 |
| `assets/style.css` | 样式和响应式布局 |
| `assets/app.js` | 搜索、筛选、主题、图片放大与阅读交互 |
| `assets/writer.js` | 网页写作、图片压缩、浏览器草稿与发布状态 |
| `assets/publisher.js` | GitHub API 发布，正文与图片一次提交 |
| `content-index.json` | 构建生成的源码索引，随内容一起提交，用于链接名检查 |
| `scripts/build.mjs` | 生成网页和搜索索引等资源 |
| `.github/workflows/deploy.yml` | GitHub Pages 自动部署 |

`dist/`、`node_modules/`、`.local/` 和环境文件不提交 Git。搜索在浏览器内完成，网站没有追踪脚本。

## 排版参考

借鉴 [PaperMod](https://github.com/adityatelange/hugo-PaperMod) 的阅读宽度与文章目录、[Memos](https://github.com/usememos/memos) 的短文时间流，以及 [Hugo Gallery](https://github.com/nicokaiser/hugo-theme-gallery) 的相册网格与大图查看。页面代码和插画为本项目实现，没有移植这些主题的源码。浏览器 Markdown 预览使用项目已依赖的 Markdown-it，构建会一并复制其 MIT 许可证。
