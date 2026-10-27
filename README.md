# liber 的个人博客

网站：https://liber301.github.io/

一个以中文阅读为主的静态个人博客。文章使用 Markdown，网站包含分类筛选、全文搜索、归档、标签页、文章目录、代码复制、深浅主题、RSS、站点地图与 404 页面。

## 本地运行

需要 Node.js 20 或更高版本。线上构建使用 Node.js 24。

```sh
npm ci
npm run build
npm run check
npm run preview
```

打开终端输出的本地地址，默认是 `http://127.0.0.1:4321`。修改内容后重新运行 `npm run build`，刷新页面即可查看。预览服务器只绑定本机。

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

## 更新和发布

```sh
npm run build
npm run check
git add .
git commit -m "发布新文章"
git push
```

推送到 `main` 后，GitHub Actions 会安装锁文件中的依赖，构建并检查网站，然后自动部署到 GitHub Pages。进度在仓库的 Actions 页面查看。文章源文件可以直接在 GitHub 上编辑并提交，也会触发自动发布。

Pages 设置使用 `GitHub Actions` 作为发布来源。不要将 `dist/` 或 `node_modules/` 提交到仓库。

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
| `.github/workflows/deploy.yml` | 自动构建与发布 |

`npm run check` 会检查输出页面的内部链接、锚点、文档结构和搜索索引。搜索在浏览器内完成，不向外部服务发送查询内容。网站不包含访问统计或追踪脚本。
