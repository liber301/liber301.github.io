# liber 的个人博客

网站：[liber301.github.io](https://liber301.github.io/)

本地目录：`/Users/mmmlq/codeProject/github_liber_com`。已作为“liber 个人博客”加入 `ai-coding-workspace/ai-coding.code-workspace`。

中文个人博客，使用 Markdown 写文章，GitHub Pages 托管。包含前端登录界面、分类、搜索、归档、标签、文章目录、代码复制、深浅主题、RSS 和 404 页面，无需数据库或后端服务器。

## 账号和密码怎么改

初始账号为 `liber301`。初始随机密码仅保存在本机 `.local/login-credentials.txt`，该目录不会提交 Git。

在项目目录运行：

```sh
cd /Users/mmmlq/codeProject/github_liber_com
npm run set-password
```

按提示输入账号和两次新密码（输入密码时不回显）。命令更新 `login.config.json` 中的 `username`、`salt` 和 `passwordHash`。如只改账号，也可以直接编辑 JSON 中的 `username`；不要把明文密码写入 `passwordHash`。

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

## 写文章

在 `content/posts/` 新增 `.md` 文件，可以复制已有文章：

```yaml
---
title: "文章标题"
slug: "my-new-post"
date: "2026-10-28"
category: "开发笔记"
tags: ["学习", "记录"]
excerpt: "一到两句文章摘要。"
---
```

`slug` 使用小写英文字母、数字和连字符，且不能重复；日期保留引号。正文从 `##` 二级标题开始。`draft: true` 隐藏草稿，`featured: true` 指定首页推荐，`sample: true` 标记入门示例。首版包含开站手记和两篇示例文章，可自由修改。

图片放在 `assets/`，用 `![说明](/assets/图片名.jpg)` 引用。

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
| `assets/app.js` | 搜索、筛选、主题与阅读交互 |
| `scripts/build.mjs` | 生成网页和搜索索引等资源 |
| `.github/workflows/deploy.yml` | GitHub Pages 自动部署 |

`dist/`、`node_modules/`、`.local/` 和环境文件不提交 Git。搜索在浏览器内完成，网站没有追踪脚本。
