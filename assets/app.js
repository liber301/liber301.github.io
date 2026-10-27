const themeButton = document.querySelector('.theme-toggle');
const syncThemeLabel = () => themeButton?.setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
syncThemeLabel();
themeButton?.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('liber-theme', theme); } catch {}
  syncThemeLabel();
});

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const closeMenu = () => { nav?.classList.remove('is-open'); menuButton?.setAttribute('aria-expanded', 'false'); menuButton?.setAttribute('aria-label', '展开导航'); };
menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(expanded));
  menuButton.setAttribute('aria-label', expanded ? '收起导航' : '展开导航');
  nav?.classList.toggle('is-open', expanded);
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
  const editing = event.target instanceof Element && event.target.closest('input,textarea,[contenteditable="true"]');
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !editing) {
    event.preventDefault();
    const input = document.querySelector('#site-search');
    if (input) input.focus(); else location.href = '/search/';
  }
});

document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(item => {
    const selected = item === button;
    item.classList.toggle('is-active', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  let visibleCount = 0;
  document.querySelectorAll('.post-list [data-category]').forEach(card => {
    const visible = button.dataset.filter === 'all' || card.dataset.category === button.dataset.filter;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });
  const status = document.querySelector('.filter-status');
  if (status) status.textContent = `${button.textContent}，共 ${visibleCount} 篇文章`;
  const empty = document.querySelector('.filter-empty');
  if (empty) empty.hidden = visibleCount !== 0;
}));

document.querySelectorAll('.prose pre').forEach(pre => {
  const code = pre.querySelector('code');
  if (!code) return;
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'copy-code'; button.textContent = '复制';
  button.setAttribute('aria-label', '复制这段代码');
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code.textContent);
      button.textContent = '已复制';
    } catch { button.textContent = '请选择代码复制'; }
    window.setTimeout(() => { button.textContent = '复制'; }, 2200);
  });
  pre.append(button);
});

const articleBody = document.querySelector('.article-body');
const progress = document.querySelector('.reading-progress');
if (articleBody && progress) {
  const updateProgress = () => {
    const rect = articleBody.getBoundingClientRect();
    const distance = Math.max(articleBody.offsetHeight - innerHeight + 160, 1);
    const fraction = Math.max(0, Math.min(1, (110 - rect.top) / distance));
    progress.style.width = `${fraction * 100}%`;
  };
  addEventListener('scroll', updateProgress, { passive: true });
  addEventListener('resize', updateProgress);
  updateProgress();
  if ('IntersectionObserver' in window) {
    const links = [...document.querySelectorAll('.article-toc a')];
    const observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach(entry => {
        links.forEach(link => {
          const active = decodeURIComponent(link.hash.slice(1)) === entry.target.id;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-100px 0px -65% 0px' });
    articleBody.querySelectorAll('h2,h3').forEach(heading => observer.observe(heading));
  }
}

const searchInput = document.querySelector('#site-search');
if (searchInput) {
  const results = document.querySelector('.search-results');
  const status = document.querySelector('.search-status');
  let indexPromise;
  let queryNumber = 0;
  const index = () => indexPromise ??= fetch('/search-index.json').then(response => {
    if (!response.ok) throw new Error('Search index unavailable');
    return response.json();
  }).catch(error => { indexPromise = undefined; throw error; });
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase();
  const runSearch = async () => {
    const currentQuery = ++queryNumber;
    const query = searchInput.value.trim();
    results.replaceChildren();
    if (!query) { status.textContent = '输入关键词，开始寻找。'; return; }
    status.textContent = '正在寻找……';
    try {
      const posts = await index();
      if (currentQuery !== queryNumber) return;
      const terms = normalize(query).split(/\s+/).filter(Boolean);
      const matches = posts.filter(post => terms.every(term => normalize(`${post.title} ${post.category} ${post.tags.join(' ')} ${post.text}`).includes(term))).sort((a, b) => Number(normalize(b.title).includes(normalize(query))) - Number(normalize(a.title).includes(normalize(query))));
      status.textContent = matches.length ? `找到 ${matches.length} 篇与「${query}」相关的记录。` : `没有找到「${query}」。换一个关键词，或试试「博客」「Markdown」。`;
      matches.forEach(post => {
        const article = document.createElement('article'); article.className = 'search-result';
        const link = document.createElement('a'); link.href = post.url;
        const meta = document.createElement('div'); meta.className = 'post-meta'; meta.textContent = `${post.category} / ${post.date.replaceAll('-', '.')} · ${post.minutes} 分钟阅读`;
        const title = document.createElement('h2'); title.textContent = post.title;
        const paragraph = document.createElement('p');
        const offset = Math.max(0, normalize(post.text).indexOf(terms[0]) - 35);
        paragraph.textContent = `${offset ? '…' : ''}${post.text.slice(offset, offset + 150)}${post.text.length > offset + 150 ? '…' : ''}`;
        link.append(meta, title, paragraph); article.append(link); results.append(article);
      });
    } catch {
      if (currentQuery === queryNumber) status.textContent = '搜索索引暂时未能加载，请重试，或从归档页浏览文章。';
    }
  };
  searchInput.value = new URLSearchParams(location.search).get('q') ?? '';
  searchInput.addEventListener('input', runSearch);
  document.querySelector('.search-form').addEventListener('submit', event => {
    event.preventDefault();
    const url = new URL(location.href);
    if (searchInput.value.trim()) url.searchParams.set('q', searchInput.value.trim()); else url.searchParams.delete('q');
    history.replaceState(null, '', url);
    runSearch();
  });
  runSearch();
  searchInput.focus({ preventScroll: true });
}
