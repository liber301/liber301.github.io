# liber 的个人博客

私有站点：https://liber301-private-journal.ffzyhvbkbn.chatgpt.site/

本地目录：`/Users/mmmlq/codeProject/github_liber_com`。已作为“liber 个人博客”加入 `ai-coding-workspace/ai-coding.code-workspace`。

一个以中文阅读为主的私有个人博客。文章使用 Markdown，网站包含分类筛选、全文搜索、归档、标签页、文章目录、代码复制、深浅主题、RSS、站点地图与 404 页面。

## 登录和访问权限

生产站点由托管平台进行服务端访问控制，使用 ChatGPT 账号登录，默认仅站点所有者可访问。文章直链、搜索索引、RSS 和静态资源同样经过平台的访问控制。

当前没有独立的博客用户名、共享密码或自行管理的用户数据库。账号凭证由登录平台管理，源码不保存密码。新增读者需要单独授权。

源码保存在私有 GitHub 仓库 `liber301/liber301.github.io`，旧 GitHub Pages 公开发布流程已停用。

## 本地运行

构建需要 Node.js 20 或更高版本。上线的是生成后的静态网页，访问权限由托管平台处理。

```sh
npm ci
npm run build
npm run check
npm run preview
```

打开终端输出的本地地址，默认是 `http://127.0.0.1:4321`。修改内容后重新运行 `npm run build`，刷新页面即可查看。预览服务器只绑定本机，不模拟线上账号登录。

## 写一篇文章

在 `content/posts/` 下新增一个 `.md` 文件，可以复制已有文章，替换文件头与正文：

```yaml
---
title: "文章标题"
slug: "my-new-post"
date: "2026-10-27"
category: "开发笔记"
tags: ["学习", "记录"]
excerpt: "一到两句文章摘要。"
---
```

`slug` 使用小写英文字母、数字和连字符，并保持唯一。日期请保留引号。正文从二级标题 `##` 开始，目录会自动生成。`draft: true` 可以暂时隐藏草稿，`featured: true` 可以指定首页的开站推荐文章。`sample: true` 会在文章页显示“入门示例”。

首版包含一篇开站文章，以及两篇标注为入门示例的写作与发布指南，可按需修改或删除。

将图片放进 `assets/`，在文章中使用 `![图片说明](/assets/文件名.jpg)` 引用。上传前压缩图片，保持移动端访问轻快。

## 同步源码和发布站点

修改文章或代码后，先构建并检查，再同步到私有 GitHub 仓库：

```sh
npm run build
npm run check
git add .
git commit -m "发布新文章"
git push
```

`git push` 只同步源码到 GitHub，不再触发公开 Pages 发布。

更新私有网站时，在这个对话中要求“发布私有博客”。Codex 会构建和检查最新内容，通过 Sites 源码与打包流程保存版本，再使用私有部署操作发布。发布需要保持站点为所有者私有，不应切换成公开访问。

Sites 的源码同步不会替换 GitHub 的 `origin`。不要将 `dist/`、`node_modules/`、本地环境文件或短期发布凭据提交到 GitHub。

## 修改哪些文件

| 文件或目录 | 用途 |
| --- | --- |
| `site.config.json` | 博客名称、简介、网址、GitHub 链接 |
| `content/posts/` | Markdown 文章 |
| `content/about.md` | 关于页内容 |
| `src/templates.mjs` | 页面结构和首页文案 |
| `assets/style.css` | 页面样式和响应式布局 |
| `assets/app.js` | 搜索、筛选、主题与阅读交互 |
| `scripts/build.mjs` | 静态页面、搜索索引、RSS 和站点地图生成 |
| `.openai/hosting.json` | 私有托管的站点标识和静态目录 |
| `.github/workflows/deploy.yml` | 已停用的历史 Pages 工作流，不再用于生产发布 |

`npm run check` 会检查输出页面的内部链接、锚点、文档结构和搜索索引。搜索在浏览器内完成，不向外部服务发送查询内容。网站不包含访问统计或追踪脚本。
