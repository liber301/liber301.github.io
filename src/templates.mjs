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
export const postUrl = (post) => `/posts/${post.slug}/`;
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
      <a href="/"${path === '/' ? ' aria-current="page"' : ''}>文章</a>
      <a href="/archives/"${active(path, '/archives')}>归档</a>
      <a href="/about/"${active(path, '/about')}>关于</a>
    </nav>` : '<span class="login-header-note">A PERSONAL JOURNAL</span>'}
    <div class="header-actions">${!loginPage ? `<a class="icon-button search-link" href="/search/" aria-label="搜索文章">${icons.search}<span class="search-word">搜索</span><kbd>/</kbd></a><span class="header-divider"></span><button class="logout-button" type="button" data-logout>退出</button>` : ''}<button class="icon-button theme-toggle" type="button" aria-label="切换到深色模式">${icons.moon}${icons.sun}</button>${!loginPage ? '<button class="menu-toggle icon-button" type="button" aria-label="展开导航" aria-controls="main-nav" aria-expanded="false"><span></span><span></span></button>' : ''}</div>
  </div></header>
  <main id="main">${content}</main>
  <footer class="site-footer"><div><a class="footer-wordmark" href="/">liber.</a><span>© ${site.started.slice(0, 4)} liber · 在文字里，慢慢积累。</span></div>${!loginPage ? `<nav aria-label="页脚导航"><a href="${site.github}" target="_blank" rel="noopener noreferrer">GitHub ${icons.diagonal}</a><a href="/feed.xml">RSS ${icons.rss}</a><a href="#top">回到顶部 ↑</a></nav>` : '<span class="login-footer-note">记录 · 思考 · 创造</span>'}</footer>
</body></html>`;
}

export function loginPage() {
  return `<section class="login-page page-width"><div class="login-intro"><div class="eyebrow"><span class="little-line"></span>WELCOME BACK</div><h1>翻开记录之前，<br>先打个<span>招呼。</span></h1><p>一些想法，一些日常。<br>登录后，继续读这里慢慢积累的文字。</p><div class="login-ornament" aria-hidden="true">l<span>.</span></div><span class="login-caption">a little space for thoughts.</span></div><div class="login-card"><div class="eyebrow">LIBER / JOURNAL</div><h2>登录博客</h2><p class="login-card-intro">很高兴，又在这里见到你。</p><form id="login-form"><label for="login-username">账号</label><input id="login-username" name="username" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" required placeholder="输入你的账号"><label for="login-password">密码</label><div class="password-field"><input id="login-password" name="password" type="password" autocomplete="current-password" required placeholder="输入你的密码"><button type="button" id="toggle-password" aria-label="显示密码" aria-pressed="false">显示</button></div><p id="login-message" class="login-message" role="status" aria-live="polite"></p><button class="login-submit" type="submit"><span>进入博客</span>${icons.arrow}</button><p class="login-session-note">在当前标签页保持登录，关闭后需要重新登录。</p></form></div></section>`;
}

export function postCard(post, index) {
  return `<article class="post-card" data-category="${escape(post.category)}"><a class="post-card-link" href="${postUrl(post)}"><div class="post-number">${String(index + 1).padStart(2, '0')}</div><div class="post-card-body"><div class="post-meta"><span class="category-dot"></span><span>${escape(post.category)}</span><span class="meta-separator">/</span><time datetime="${post.date}">${formattedDate(post.date)}</time></div><h3>${escape(post.title)}</h3><p>${escape(post.excerpt)}</p><div class="post-card-bottom"><span>${post.minutes} 分钟阅读</span><span class="post-tags">${post.tags.slice(0, 2).map(tag => `# ${escape(tag)}`).join('<span>·</span>')}</span></div></div><span class="post-arrow">${icons.diagonal}</span></a></article>`;
}

export function home({ site, posts, categories, tags }) {
  const featured = posts.find(post => post.featured) || posts[0];
  return `<section class="hero page-width"><div class="hero-copy"><div class="eyebrow"><span class="little-line"></span>A PERSONAL JOURNAL</div><h1>写下一些想法，<br>也留住<span class="hand-underline">一些日常<svg viewBox="0 0 280 15" aria-hidden="true"><path d="M4 10Q120 0 275 7"/></svg></span>。</h1><p>你好，我是 liber。<br>这里记录开发、学习，以及生活里值得留住的片段。</p><div class="hero-links"><a class="text-link" href="#articles">翻开最近的记录 ${icons.arrow}</a><span class="hero-note">慢慢写，也慢慢生长。</span></div></div><div class="hero-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><span class="art-star">✳</span><div class="journal-cover"><div class="journal-topline"><span>LIBER / NOTES</span><span>VOL. 01</span></div><span class="journal-letter">l<span>.</span></span><div class="journal-bottomline"><span>记录 · 思考 · 创造</span><span>EST. ${site.started.slice(0, 4)}</span></div></div><span class="art-caption">a little space for thoughts.</span><span class="art-dot"></span></div></section>
  <section class="featured page-width" aria-labelledby="featured-title"><div class="featured-label"><span class="eyebrow">START HERE</span><span class="tiny-star">✳</span><span>一页新的开始</span></div><a class="featured-content" href="${postUrl(featured)}"><div><div class="post-meta"><span>开站手记</span><span class="meta-separator">/</span><time datetime="${featured.date}">${formattedDate(featured.date)}</time></div><h2 id="featured-title">${escape(featured.title)}</h2><p>${escape(featured.excerpt)}</p></div><span class="round-arrow" aria-label="阅读文章">${icons.arrow}</span></a></section>
  <section class="content-grid page-width" id="articles"><div class="article-column"><div class="section-heading"><div><span class="eyebrow">LATEST ENTRIES</span><h2>最近的记录<span class="count-label">${String(posts.length).padStart(2, '0')}</span></h2></div><a class="quiet-link" href="/archives/">全部归档 ${icons.arrow}</a></div><div class="filter-bar" role="group" aria-label="按分类筛选文章"><button class="filter-button is-active" type="button" data-filter="all" aria-pressed="true">全部文章</button>${categories.map(category => `<button class="filter-button" type="button" data-filter="${escape(category)}" aria-pressed="false">${escape(category)}</button>`).join('')}</div><div class="post-list">${posts.map(postCard).join('')}</div><p class="filter-status visually-hidden" role="status" aria-live="polite"></p><p class="filter-empty" hidden>这个分类还没有文章，先看看其他记录吧。</p><div class="list-end"><span></span>写到这里，留待下次。<span></span></div></div><aside class="sidebar"><section class="about-card"><div class="sidebar-eyebrow">ABOUT ME</div><div class="avatar-monogram" aria-hidden="true">l<span>.</span></div><h2>你好，我是 liber<span class="wave">↗</span></h2><p>给想法留一点空间，<br>给日常留一点笔墨。</p><a class="text-link" href="/about/">关于这个小站 ${icons.arrow}</a><div class="social-links"><a href="${site.github}" target="_blank" rel="noopener noreferrer" aria-label="liber 的 GitHub">${icons.github}</a><a href="/feed.xml" aria-label="RSS 订阅">${icons.rss}</a></div></section><section class="topics-card"><div class="sidebar-eyebrow">EXPLORE TOPICS</div><h2>沿着兴趣，随意走走</h2><div class="topic-list">${tags.map(([tag, count]) => `<a href="/tags/${encodeURIComponent(tag)}/">${escape(tag)}<span>${count}</span></a>`).join('')}</div></section><section class="rss-note">${icons.rss}<div><h2>把更新送进阅读器</h2><p>通过 RSS 订阅，慢慢读。</p><a href="/feed.xml">订阅这个博客 ${icons.diagonal}</a></div></section></aside></section>`;
}

export function postPage({ site, post, related }) {
  return `<div class="reading-progress" aria-hidden="true"></div><div class="article-layout page-width"><article class="article-main"><a class="back-link" href="/">← 回到文章列表</a><header class="article-header"><div class="eyebrow">${escape(post.category)}</div><h1>${escape(post.title)}</h1><p class="article-deck">${escape(post.excerpt)}</p><div class="article-meta"><span class="mini-avatar" aria-hidden="true">l</span><span>${site.name}</span><span>·</span><time datetime="${post.date}">${formattedDate(post.date)}</time><span>·</span><span>${post.minutes} 分钟阅读</span>${post.sample ? '<span class="sample-label">入门示例</span>' : ''}</div></header><div class="prose article-body">${post.html}</div><footer class="article-ending"><div class="article-tags">${post.tags.map(tag => `<a href="/tags/${encodeURIComponent(tag)}/"># ${escape(tag)}</a>`).join('')}</div><span>谢谢你读到这里。</span></footer>${related.length ? `<section class="related-posts"><span class="eyebrow">KEEP READING</span><h2>也许你还想读</h2>${related.map((item, index) => postCard(item, index)).join('')}</section>` : ''}</article><aside class="article-aside"><span class="sidebar-eyebrow">ON THIS PAGE</span><h2>文章目录</h2><nav class="article-toc" aria-label="文章目录">${post.toc.map(item => `<a href="#${encodeURIComponent(item.id)}" class="toc-level-${item.level}">${escape(item.text)}</a>`).join('')}</nav><a class="toc-back" href="#top">回到开头 ↑</a></aside></div>`;
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
