import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import MarkdownIt from 'markdown-it';
import matter from 'gray-matter';
import * as templates from '../src/templates.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const site = JSON.parse(await fs.readFile(path.join(root, 'site.config.json'), 'utf8'));
if (new URL(site.url).protocol !== 'https:') throw new Error('site.url must use HTTPS');
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
const defaultHeading = md.renderer.rules.heading_open;
md.renderer.rules.heading_open = (tokens, index, options, env, self) => {
  const token = tokens[index];
  const level = Number(token.tag.slice(1));
  const text = tokens[index + 1]?.children?.map(child => child.content).join('') || '';
  const base = text.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'section';
  const count = (env.ids[base] || 0) + 1;
  env.ids[base] = count;
  const id = count === 1 ? base : `${base}-${count}`;
  token.attrSet('id', id);
  if (level === 2 || level === 3) env.toc.push({ id, text, level });
  return defaultHeading ? defaultHeading(tokens, index, options, env, self) : self.renderToken(tokens, index, options);
};
function renderMarkdown(content) {
  const env = { ids: {}, toc: [] };
  return { html: md.render(content, env), toc: env.toc };
}
function plainText(content) {
  return content.replace(/^---[\s\S]*?---/m, '').replace(/```[\s\S]*?```/g, ' ').replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[>#*`|_]/g, ' ').replace(/\s+/g, ' ').trim();
}
const filenames = (await fs.readdir(path.join(root, 'content/posts'))).filter(name => name.endsWith('.md'));
const posts = [];
for (const filename of filenames) {
  const raw = await fs.readFile(path.join(root, 'content/posts', filename), 'utf8');
  const { data, content } = matter(raw);
  if (data.draft === true) continue;
  for (const field of ['title', 'slug', 'date', 'category', 'excerpt']) {
    if (typeof data[field] !== 'string' || !data[field].trim()) throw new Error(`${filename}: ${field} must be a nonempty string. Quote dates in front matter.`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) throw new Error(`${filename}: use a lowercase URL slug`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(Date.parse(data.date))) throw new Error(`${filename}: invalid date`);
  if (!Array.isArray(data.tags) || data.tags.some(tag => typeof tag !== 'string' || !tag.trim() || ['.', '..'].includes(tag) || /[\/\\\u0000-\u001f]/.test(tag))) throw new Error(`${filename}: tags must be an array without path separators or dot path segments`);
  const text = plainText(content);
  posts.push({ ...data, ...renderMarkdown(content), text, minutes: Math.max(1, Math.ceil(text.length / 450)) });
}
posts.sort((a, b) => b.date.localeCompare(a.date) || Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.slug.localeCompare(b.slug));
if (!posts.length) throw new Error('Add at least one published article before building.');
if (new Set(posts.map(post => post.slug)).size !== posts.length) throw new Error('Duplicate article slug.');
const categories = [...new Set(posts.map(post => post.category))];
const tagCounts = new Map();
posts.forEach(post => [...new Set(post.tags)].forEach(tag => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)));
const tags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'));
const assets = await Promise.all(['style.css', 'app.js'].map(filename => fs.readFile(path.join(root, 'assets', filename))));
const assetVersion = createHash('sha256').update(Buffer.concat(assets)).digest('hex').slice(0, 10);

// dist is generated output owned by this build; content and source files are never removed.
await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
await fs.cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
const pages = [];
async function write(relative, content) {
  const filename = path.join(output, relative);
  await fs.mkdir(path.dirname(filename), { recursive: true });
  await fs.writeFile(filename, content, 'utf8');
}
async function page(url, title, content, metadata = {}) {
  const filename = url === '/404.html' ? '404.html' : `${decodeURIComponent(url.slice(1))}index.html`;
  await write(filename, templates.layout({ site, title, content, path: url, assetVersion, ...metadata }));
  if (url !== '/404.html') pages.push(url);
}
await page('/', site.title, templates.home({ site, posts, categories, tags }));
await page('/archives/', '文章归档', templates.archives({ posts }));
await page('/search/', '搜索文章', templates.search());
const aboutFile = matter(await fs.readFile(path.join(root, 'content/about.md'), 'utf8'));
await page('/about/', aboutFile.data.title, templates.about(renderMarkdown(aboutFile.content)));
for (const post of posts) {
  await page(templates.postUrl(post), post.title, templates.postPage({ site, post, related: posts.filter(other => other.slug !== post.slug).slice(0, 2) }), { type: 'article', description: post.excerpt, date: post.date });
}
for (const [tag] of tags) await page(`/tags/${encodeURIComponent(tag)}/`, `标签：${tag}`, templates.tagPage({ tag, posts: posts.filter(post => post.tags.includes(tag)) }));
await page('/404.html', '没有找到这一页', templates.notFound());
await write('search-index.json', JSON.stringify(posts.map(post => ({ title: post.title, url: templates.postUrl(post), date: post.date, category: post.category, tags: post.tags, excerpt: post.excerpt, minutes: post.minutes, text: post.text }))));
const xmlEscape = value => String(value).replace(/[<>&"']/g, character => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[character]));
const latestDate = new Date(`${posts[0].date}T00:00:00+08:00`).toUTCString();
await write('feed.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xmlEscape(site.title)}</title><link>${site.url}/</link><description>${xmlEscape(site.description)}</description><language>zh-cn</language><lastBuildDate>${latestDate}</lastBuildDate><atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml"/>${posts.map(post => `<item><title>${xmlEscape(post.title)}</title><link>${site.url}${templates.postUrl(post)}</link><guid isPermaLink="true">${site.url}${templates.postUrl(post)}</guid><description>${xmlEscape(post.excerpt)}</description><pubDate>${new Date(`${post.date}T00:00:00+08:00`).toUTCString()}</pubDate>${post.tags.map(tag => `<category>${xmlEscape(tag)}</category>`).join('')}</item>`).join('')}</channel></rss>\n`);
await write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.filter(url => url !== '/search/').map(url => `<url><loc>${xmlEscape(`${site.url}${url}`)}</loc></url>`).join('')}</urlset>\n`);
await write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
await write('.nojekyll', '');
console.log(`Built ${pages.length + 1} HTML pages from ${posts.length} posts into dist/.`);
