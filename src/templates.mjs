export const escape = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
export const icons = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  diagonal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg>',
  sun: '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>',
  moon: '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 14A8.5 8.5 0 0 1 10 4 8.5 8.5 0 1 0 20 14Z"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.61-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.64-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.6 9.6 0 0 1 12 6.99c.85 0 1.7.11 2.5.34 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.69-4.57 4.94.36.31.68.92.68 1.86v2.58c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>',
  rss: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="5" cy="19" r="1.2" fill="currentColor"/><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/></svg>'
};
export const formattedDate = (date) => date.replaceAll('-', '.');
export const kindLabel = post => ({ article: "长文", note: "短文", photo: "图片" }[post.kind || "article"]);
export const postUrl = (post) => `/${({ article: "posts", note: "notes", photo: "photos" })[post.kind || "article"]}/${post.slug}/`;
const active = (path, prefix) => path.startsWith(prefix) ? ' aria-current="page"' : '';

export function layout({ site, title, description = site.description, path = '/', content, type = 'website', date, assetVersion, loginVersion, loginPage = false }) {
  const pageTitle = path === '/' ? site.title : `${title} · ${site.name}`;
  const canonical = `${site.url}${path}`;
  const schema = type === 'article' ? { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: title, description, datePublished: date, dateModified: date, author: { '@type': 'Person', name: site.name, url: site.github }, mainEntityOfPage: canonical } : { '@context': 'https://schema.org', '@type': 'Blog', name: site.title, description, url: site.url, inLanguage: site.language };
  return `<!doctype html>
<html lang="${site.language}" ${loginPage ? 'data-login-page="true"' : 'data-auth-required'}>
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escape(pageTitle)}</title><meta name="description" content="${escape(description)}">
  <meta name="theme-color" content="#f7f6f0"><meta name="color-scheme" content="light dark">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <link rel="canonical" href="${canonical}"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="alternate" type="application/rss+xml" title="${site.name} 的博客" href="/feed.xml">
  <meta property="og:locale" content="zh_CN"><meta property="og:site_name" content="${escape(site.title)}">
  <meta property="og:type" content="${type}"><meta property="og:title" content="${escape(pageTitle)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${canonical}">
  <meta name="twitter:card" content="summary">
  <script>document.documentElement.classList.add('js');try{if(localStorage.getItem('liber-theme')==='dark')document.documentElement.dataset.theme='dark'}catch{}</script>
  <style>html[data-auth-required] body{visibility:hidden}</style>
  <script src="/assets/login-config.js?v=${loginVersion}"></script>
  <script src="/assets/auth.js?v=${assetVersion}"></script>
  <noscript><style>html[data-auth-required] body{visibility:visible}.site-header,#main,.site-footer,.skip-link{display:none}</style></noscript>
  <link rel="stylesheet" href="/assets/style.css?v=${assetVersion}">
  <script src="/assets/app.js?v=${assetVersion}" defer></script>
  <script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>
</head>
<body id="top"${loginPage ? ' class="login-body"' : ''}>
  <noscript><p class="page-width">请启用 JavaScript 后登录博客。</p></noscript>
  <a class="skip-link" href="#main">跳到主要内容</a>
  <header class="site-header"><div class="header-inner">
    <a class="wordmark" href="/" aria-label="liber 博客首页">liber<span>.</span></a>
    ${!loginPage ? `<nav class="main-nav" id="main-nav" aria-label="主导航">
      <a href="/"${path === '/' ? ' aria-current="page"' : ''}>首页</a>
      <a href="/articles/"${active(path, "/articles")}>长文</a>
      <a href="/notes/"${active(path, "/notes")}>短文</a>
      <a href="/photos/"${active(path, "/photos")}>图片</a>
      <a class="write-nav" href="/write/"${active(path, "/write")}>＋ 写作</a>
      <a href="/about/"${active(path, '/about')}>关于</a>
    </nav>` : '<span class="login-header-note">A PERSONAL JOURNAL</span>'}
    <div class="header-actions">${!loginPage ? `<a class="icon-button search-link" href="/search/" aria-label="搜索文章">${icons.search}<span class="search-word">搜索</span><kbd>/</kbd></a><span class="header-divider"></span><button class="logout-button" type="button" data-logout>退出</button>` : ''}<button class="icon-button theme-toggle" type="button" aria-label="切换到深色模式">${icons.moon}${icons.sun}</button>${!loginPage ? '<button class="menu-toggle icon-button" type="button" aria-label="展开导航" aria-controls="main-nav" aria-expanded="false"><span></span><span></span></button>' : ''}</div>
  </div></header>
  <main id="main">${content}</main>
  <footer class="site-footer"><div><a class="footer-wordmark" href="/">liber.</a><span>© ${site.started.slice(0, 4)} liber · 在文字里，慢慢积累。</span></div>${!loginPage ? `<nav aria-label="页脚导航"><a href="/archives/">归档</a><a href="${site.github}" target="_blank" rel="noopener noreferrer">GitHub ${icons.diagonal}</a><a href="/feed.xml">RSS ${icons.rss}</a><a href="#top">回到顶部 ↑</a></nav>` : '<span class="login-footer-note">记录 · 思考 · 创造</span>'}</footer>
</body></html>`;
}

export function loginPage() {
  return `<section class="login-page page-width"><div class="login-intro"><div class="eyebrow"><span class="little-line"></span>WELCOME BACK</div><h1>翻开记录之前，<br>先打个<span>招呼。</span></h1><p>一些想法，一些日常。<br>登录后，继续读这里慢慢积累的文字。</p><div class="login-ornament" aria-hidden="true">l<span>.</span></div><span class="login-caption">a little space for thoughts.</span></div><div class="login-card"><div class="eyebrow">LIBER / JOURNAL</div><h2>登录博客</h2><p class="login-card-intro">很高兴，又在这里见到你。</p><form id="login-form"><label for="login-username">账号</label><input id="login-username" name="username" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" required placeholder="输入你的账号"><label for="login-password">密码</label><div class="password-field"><input id="login-password" name="password" type="password" autocomplete="current-password" required placeholder="输入你的密码"><button type="button" id="toggle-password" aria-label="显示密码" aria-pressed="false">显示</button></div><p id="login-message" class="login-message" role="status" aria-live="polite"></p><button class="login-submit" type="submit"><span>进入博客</span>${icons.arrow}</button><p class="login-session-note">在当前标签页保持登录，关闭后需要重新登录。</p></form></div></section>`;
}

export function postCard(post, index) {
  return `<article class="post-card" data-category="${escape(post.category)}"><a class="post-card-link" href="${postUrl(post)}"><div class="post-number">${String(index + 1).padStart(2, '0')}</div><div class="post-card-body"><div class="post-meta"><span class="category-dot"></span><span>${kindLabel(post)} · ${escape(post.category)}</span><span class="meta-separator">/</span><time datetime="${post.date}">${formattedDate(post.date)}</time></div><h3>${escape(post.title)}</h3><p>${escape(post.excerpt)}</p><div class="post-card-bottom"><span>${post.minutes} 分钟阅读</span><span class="post-tags">${post.tags.slice(0, 2).map(tag => `# ${escape(tag)}`).join('<span>·</span>')}</span></div></div><span class="post-arrow">${icons.diagonal}</span></a></article>`;
}

export function home({ site, posts, tags }) {
  const articles = posts.filter(post => post.kind === 'article');
  const notes = posts.filter(post => post.kind === 'note');
  const photos = posts.filter(post => post.kind === 'photo');
  return `<section class="journal-hero page-width"><div><div class="eyebrow"><span class="little-line"></span>LIBER / A PERSONAL JOURNAL</div><h1>长一点的思考，<br>短一点的<span>日常。</span></h1><p>用文章整理想法，用短文留下此刻，<br>也用照片，留住文字之外的片段。</p><a class="text-link" href="/write/">写下一条新记录 ${icons.arrow}</a></div><div class="journal-stamp" aria-hidden="true"><span>THOUGHTS & MOMENTS</span><b>l<span>.</span></b><small>记录 · 思考 · 创造</small></div></section>
  <nav class="content-doors page-width" aria-label="内容类型">${[['articles','01','长文','把一个想法，慢慢写完整',articles.length],['notes','02','短文','一句灵感，也值得留下',notes.length],['photos','03','图片','把日常，留在光影之间',photos.length]].map(([url,n,title,description,count])=>`<a href="/${url}/"><span class="door-number">${n} / ${String(count).padStart(2,'0')}</span><div><h2>${title}</h2><p>${description}</p></div>${icons.diagonal}</a>`).join('')}</nav>
  <div class="journal-columns page-width"><section><div class="section-heading"><div><span class="eyebrow">LONG READS</span><h2>坐下来，读一篇</h2></div><a class="quiet-link" href="/articles/">全部长文 ${icons.arrow}</a></div><div class="post-list">${articles.slice(0,3).map(postCard).join('')}</div></section><aside class="journal-notes"><div class="section-heading"><div><span class="eyebrow">SMALL MOMENTS</span><h2>最近的短文</h2></div><a class="quiet-link" href="/notes/">更多 ${icons.arrow}</a></div>${notes.length ? notes.slice(0,2).map(noteCard).join('') : emptyState('还没有短文。','一句想法，就可以是第一条记录。')}<div class="journal-topics"><span class="eyebrow">FOLLOW A THREAD</span><div class="topic-list">${tags.slice(0,6).map(([tag,count])=>`<a href="/tags/${encodeURIComponent(tag)}/">${escape(tag)}<span>${count}</span></a>`).join('')}</div></div></aside></div>
  <section class="home-photos page-width"><div class="section-heading"><div><span class="eyebrow">A VISUAL DIARY</span><h2>文字之外的片段</h2></div><a class="quiet-link" href="/photos/">打开相册 ${icons.arrow}</a></div>${photos.length ? `<div class="photo-grid">${photos.slice(0,3).map(photoCard).join('')}</div>` : emptyState('相册，等一张照片。','上传图片，为日常留一个画面。')}</section>`;
}

export const emptyState = (title, description) => `<div class="collection-empty"><span aria-hidden="true">✳</span><h2>${escape(title)}</h2><p>${escape(description)}</p><a class="text-link" href="/write/">开始记录 ${icons.arrow}</a></div>`;
export function noteCard(post) {
  return `<article class="note-card"><div class="note-top"><span class="mini-avatar" aria-hidden="true">l</span><span>liber</span><time datetime="${post.date}">${formattedDate(post.date)}</time>${post.sample ? '<span class="sample-label">示例</span>' : ''}</div><div class="prose note-copy">${post.html}</div>${imageGrid(post.images)}<a class="note-permalink" href="${postUrl(post)}">${escape(post.title)} ${icons.diagonal}</a></article>`;
}
export function photoCard(post) {
  return `<article class="photo-card"><a href="${postUrl(post)}"><div class="photo-frame"><img src="${escape(post.images[0].src)}" alt="${escape(post.images[0].alt)}" loading="lazy" decoding="async"><span>${post.images.length} 张${post.sample ? ' · 示例' : ''}</span></div><div class="photo-card-caption"><h2>${escape(post.title)}</h2><time datetime="${post.date}">${formattedDate(post.date)}</time>${icons.diagonal}</div></a></article>`;
}
export function imageGrid(images = []) {
  if (!images.length) return '';
  return `<div class="image-grid image-count-${Math.min(images.length,3)}">${images.map(image=>`<figure><a href="${escape(image.src)}" data-lightbox><img src="${escape(image.src)}" alt="${escape(image.alt)}" loading="lazy" decoding="async"></a>${image.alt ? `<figcaption>${escape(image.alt)}</figcaption>` : ''}</figure>`).join('')}</div>`;
}
export function collection({ kind, posts, categories }) {
  const details = {article:['LONG READS','长文','把零散的想法，整理成完整的篇章。'],note:['SMALL MOMENTS','短文','不用等到成篇，一句话也值得记录。'],photo:['A VISUAL DIARY','图片','把日常，留在光影之间。']}[kind];
  return `<section class="inner-page page-width collection-page"><div class="collection-heading"><div class="page-intro"><div class="eyebrow">${details[0]} / ${String(posts.length).padStart(2,'0')}</div><h1>${details[1]}<span class="title-dot">.</span></h1><p>${details[2]}</p></div><a class="primary-link" href="/write/?type=${kind}">＋ ${kind==='photo'?'发图片':`写${details[1]}`}</a></div>${kind==='article' && posts.length ? `<div class="filter-bar" role="group" aria-label="按分类筛选文章"><button class="filter-button is-active" data-filter="all" aria-pressed="true">全部文章</button>${categories.map(category=>`<button class="filter-button" data-filter="${escape(category)}" aria-pressed="false">${escape(category)}</button>`).join('')}</div>` : ''}<div class="${kind==='article'?'post-list collection-articles':kind==='note'?'note-timeline':'photo-grid'}">${posts.map(kind==='article'?postCard:kind==='note'?noteCard:photoCard).join('')}</div><p class="filter-status visually-hidden" role="status"></p><p class="filter-empty" hidden>这个分类还没有记录。</p>${!posts.length ? emptyState('从第一条记录开始。','文字和照片，都可以在这里慢慢积累。') : ''}</section>`;
}
export function momentPage({post}) {
  return `<section class="moment-page page-width"><a class="back-link" href="/${post.kind==='note'?'notes':'photos'}/">← 回到${post.kind==='note'?'短文':'图片'}</a><header class="article-header"><div class="eyebrow">${post.kind==='note'?'SMALL MOMENTS':'A VISUAL DIARY'}</div><h1>${escape(post.title)}</h1><div class="post-meta"><span>liber</span><time datetime="${post.date}">${formattedDate(post.date)}</time>${post.sample?'<span class="sample-label">入门示例</span>':''}</div></header><div class="prose">${post.html}</div>${imageGrid(post.images)}<div class="article-tags">${post.tags.map(tag=>`<a href="/tags/${encodeURIComponent(tag)}/"># ${escape(tag)}</a>`).join('')}</div></section>`;
}

export function postPage({ site, post, related }) {
  return `<div class="reading-progress" aria-hidden="true"></div><div class="article-layout page-width"><article class="article-main"><a class="back-link" href="/">← 回到文章列表</a><header class="article-header"><div class="eyebrow">${escape(post.category)}</div><h1>${escape(post.title)}</h1><p class="article-deck">${escape(post.excerpt)}</p><div class="article-meta"><span class="mini-avatar" aria-hidden="true">l</span><span>${site.name}</span><span>·</span><time datetime="${post.date}">${formattedDate(post.date)}</time><span>·</span><span>${post.minutes} 分钟阅读</span>${post.sample ? '<span class="sample-label">入门示例</span>' : ''}</div></header>${post.cover ? `<figure class="article-cover"><img src="${escape(post.cover)}" alt="${escape(post.title)}" loading="eager"></figure>` : ""}<div class="prose article-body">${post.html}</div><footer class="article-ending"><div class="article-tags">${post.tags.map(tag => `<a href="/tags/${encodeURIComponent(tag)}/"># ${escape(tag)}</a>`).join('')}</div><span>谢谢你读到这里。</span></footer>${related.length ? `<section class="related-posts"><span class="eyebrow">KEEP READING</span><h2>也许你还想读</h2>${related.map((item, index) => postCard(item, index)).join('')}</section>` : ''}</article><aside class="article-aside"><span class="sidebar-eyebrow">ON THIS PAGE</span><h2>文章目录</h2><nav class="article-toc" aria-label="文章目录">${post.toc.map(item => `<a href="#${encodeURIComponent(item.id)}" class="toc-level-${item.level}">${escape(item.text)}</a>`).join('')}</nav><a class="toc-back" href="#top">回到开头 ↑</a></aside></div>`;
}

export function archives({ posts }) {
  const years = [...new Set(posts.map(post => post.date.slice(0, 4)))];
  return `<section class="inner-page page-width"><div class="page-intro"><div class="eyebrow">THE ARCHIVE</div><h1>每一篇，都是一个脚印。</h1><p>按时间翻阅这里的 ${posts.length} 篇记录。</p></div><div class="archive-body">${years.map(year => `<section class="archive-year"><div class="archive-year-heading"><h2>${year}</h2><span>${posts.filter(post => post.date.startsWith(year)).length} 篇文章</span></div><div>${posts.filter(post => post.date.startsWith(year)).map(post => `<a class="archive-entry" href="${postUrl(post)}"><time datetime="${post.date}">${post.date.slice(5).replace('-', '.')}</time><span class="archive-entry-title">${escape(post.title)}</span><span class="archive-category">${escape(post.category)}</span>${icons.diagonal}</a>`).join('')}</div></section>`).join('')}</div></section>`;
}

export function tagPage({ tag, posts }) {
  return `<section class="inner-page page-width"><a class="back-link" href="/">← 回到首页</a><div class="page-intro"><div class="eyebrow">TOPIC / ${posts.length} ENTRIES</div><h1># ${escape(tag)}</h1><p>沿着「${escape(tag)}」这条线，继续读下去。</p></div><div class="narrow-list">${posts.map(postCard).join('')}</div></section>`;
}

export function about({ html }) {
  return `<section class="about-page page-width"><div class="about-heading"><span class="eyebrow">A LITTLE ABOUT THIS SPACE</span><h1>一处自己的角落。<br><span>一些慢慢积累的记录。</span></h1><div class="about-ornament" aria-hidden="true">l<span>.</span></div></div><div class="prose about-prose">${html}</div></section>`;
}

export function search() {
  return `<section class="inner-page search-page page-width"><div class="page-intro"><div class="eyebrow">FIND A THOUGHT</div><h1>找一段文字，<br>或一个有趣的想法。</h1><p>搜索文章标题、正文或标签。</p></div><form class="search-form" action="/search/" role="search"><label class="visually-hidden" for="site-search">搜索文章</label>${icons.search}<input id="site-search" name="q" type="search" placeholder="试试 Markdown、博客、记录……" autocomplete="off"><button class="search-submit" type="submit">搜索 ${icons.arrow}</button></form><p class="search-status" role="status" aria-live="polite">输入关键词，开始寻找。</p><div class="search-results"></div><noscript><p>搜索需要 JavaScript。你也可以从<a href="/archives/">文章归档</a>浏览所有内容。</p></noscript></section>`;
}

export function notFound() {
  return `<section class="not-found page-width"><span class="eyebrow">A LITTLE DETOUR</span><div class="error-number">404<span>.</span></div><h1>这一页，暂时还没有故事。</h1><p>可能是地址写错了，也可能是文章搬了家。<br>回到首页，继续翻翻其他记录吧。</p><a class="primary-link" href="/">回到首页 ${icons.arrow}</a><a class="quiet-link" href="/search/">搜索文章</a></section>`;
}

export function writer({assetVersion}) {
  return `<section class="writer-page page-width"><div class="writer-heading"><div><div class="eyebrow">THE WRITING DESK</div><h1>今天，想留下些什么？</h1><p>一篇长文，一句短文，或一组照片。</p></div><span id="draft-status" role="status">正在读取草稿……</span></div>
  <details class="github-connect" id="github-panel"><summary><span class="connection-dot"></span><span id="connection-label">连接 GitHub，发布到博客</span><span class="quiet-link">授权设置 ↓</span></summary><div class="connection-body"><div><h2>只授权这个博客仓库</h2><p>创建细粒度令牌，Repository access 选择 <strong>Only select repositories → liber301.github.io</strong>，权限只需 <strong>Contents: Read and write</strong>，建议设置有效期。</p><a class="text-link" href="https://github.com/settings/personal-access-tokens/new?name=liber-blog-writer&amp;description=Publish%20my%20blog&amp;target_name=liber301&amp;contents=write" target="_blank" rel="noopener noreferrer">在 GitHub 创建发布令牌 ↗</a><p class="connection-footnote">令牌仅在本页内存中使用，刷新或退出后需重新连接。博客阅读账号不等于 GitHub 发布权限。</p></div><form id="github-connect-form"><label for="github-token">GitHub 发布令牌</label><input id="github-token" type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_…" required><button class="primary-link" type="submit">连接仓库</button><button class="quiet-button" id="disconnect-github" type="button" hidden>断开连接</button><p id="connection-message" role="status"></p></form></div></details>
  <form id="writer-form"><fieldset class="writer-types"><legend class="visually-hidden">选择内容类型</legend>${[['article','01','长文章','图文并茂，慢慢展开'],['note','02','短文','随手写下此刻的想法'],['photo','03','发图片','一张照片，或一组画面']].map(([type,no,title,description])=>`<label><input type="radio" name="kind" value="${type}" ${type==='article'?'checked':''}><span><small>${no}</small><b>${title}</b><em>${description}</em></span></label>`).join('')}</fieldset>
  <div class="writer-workspace"><div class="writing-panel"><label for="entry-title" id="title-label">标题</label><input id="entry-title" name="title" placeholder="为这篇记录起个名字" maxlength="150"><div class="editor-toolbar" role="group" aria-label="编辑工具"><button type="button" data-insert="heading">标题</button><button type="button" data-insert="bold"><b>加粗</b></button><button type="button" data-insert="quote">引用</button><button type="button" data-insert="list">列表</button><button type="button" id="add-image-button">＋ 插入图片</button><input id="image-files" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden><span id="word-count">0 字</span></div><label class="visually-hidden" for="entry-body">正文</label><textarea id="entry-body" name="body" placeholder="从一句话开始。支持 Markdown，也可以用上方工具插入图片与格式。"></textarea><div class="upload-caption">支持 JPG、PNG、WebP；可一次选择多张。图片会压缩后上传，点击图片说明可以修改文字。</div><div id="image-attachments" class="image-attachments"></div><p id="image-message" class="form-message" role="status"></p><details class="entry-settings"><summary>日期、分类与链接设置</summary><div class="entry-setting-fields"><label>日期<input name="date" id="entry-date" type="date" required></label><label>分类<input name="category" id="entry-category" placeholder="日常记录" maxlength="60"></label><label>标签（用逗号分隔）<input name="tags" id="entry-tags" placeholder="学习, 生活" maxlength="200"></label><label>链接名<input name="slug" id="entry-slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" required></label><label class="full-field">摘要（可选）<input name="excerpt" id="entry-excerpt" maxlength="250" placeholder="不填写时从正文自动提取"></label></div></details></div>
  <aside class="preview-panel"><div class="preview-label"><span class="eyebrow">LIVE PREVIEW</span><span>阅读预览</span></div><div id="entry-preview" class="prose"><p>写下第一句话，预览会出现在这里。</p></div></aside></div>
  <div class="writer-bottom"><div class="writer-draft-actions"><button type="button" id="save-draft" class="quiet-button">保存草稿</button><button type="button" id="new-entry" class="quiet-button">新建记录</button></div><div><span class="publish-destination">发布到 liber301.github.io</span><button class="primary-link" id="publish-button" type="submit">发布这条记录 ${icons.arrow}</button></div></div><p id="publish-status" class="publish-status" role="status" aria-live="polite"></p><div id="publish-result" hidden><a id="commit-link" target="_blank" rel="noopener noreferrer">查看提交 ↗</a><a id="deployment-link" target="_blank" rel="noopener noreferrer">查看部署进度 ↗</a><a id="published-link" target="_blank" rel="noopener noreferrer" hidden>打开已发布内容 ↗</a></div></form>
  <p class="writer-help">草稿保存在这台设备的浏览器中。发布会提交到 GitHub 仓库，自动部署完成后才会出现在博客里。<a href="https://github.com/liber301/liber301.github.io" target="_blank" rel="noopener noreferrer">查看源码 ↗</a></p></section><script src="/assets/markdown-it.min.js"></script><script type="module" src="/assets/writer.js?v=${assetVersion}"></script>`;
}
