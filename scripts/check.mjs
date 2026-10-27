import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const site = JSON.parse(await fs.readFile(path.join(root, 'site.config.json'), 'utf8'));
async function walk(folder) {
  const entries = await fs.readdir(folder, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(folder, entry.name)) : path.join(folder, entry.name)))).flat();
}
const files = await walk(output);
const htmlFiles = files.filter(filename => filename.endsWith('.html'));
let checkedLinks = 0;
const failures = [];
for (const filename of htmlFiles) {
  const html = await fs.readFile(filename, 'utf8');
  const route = '/' + path.relative(output, filename).replaceAll(path.sep, '/');
  if (!/<html lang="zh-CN"(?:\s[^>]*)?>/.test(html) || !/<meta name="viewport"/.test(html) || !/<title>[^<]+<\/title>/.test(html)) failures.push(`${route}: missing document metadata`);
  const h1s = html.match(/<h1(?:\s[^>]*)?>/g) || [];
  if (h1s.length !== 1) failures.push(`${route}: expected exactly one h1, found ${h1s.length}`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  if (ids.length !== new Set(ids).size) failures.push(`${route}: duplicate element IDs`);
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    if (/^(?:mailto:|tel:|data:)/.test(href)) continue;
    const url = new URL(href, site.url + route);
    if (url.origin !== new URL(site.url).origin) continue;
    let target = path.resolve(output, '.' + decodeURIComponent(url.pathname));
    if (!target.startsWith(output + path.sep) && target !== output) { failures.push(`${route}: path outside output`); continue; }
    try {
      const stat = await fs.stat(target);
      if (stat.isDirectory()) target = path.join(target, 'index.html');
      const content = await fs.readFile(target, 'utf8');
      if (url.hash && target.endsWith('.html') && !content.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)) failures.push(`${route}: missing anchor ${href}`);
      checkedLinks += 1;
    } catch { failures.push(`${route}: missing local target ${href}`); }
  }
}
const index = JSON.parse(await fs.readFile(path.join(output, 'search-index.json'), 'utf8'));
if (!index.length || index.some(post => !post.title || !post.text || !post.url)) failures.push('Invalid search index');
if (new Set(index.map(post => post.url)).size !== index.length) failures.push('Duplicate search URLs');
for (const required of ['feed.xml', 'sitemap.xml', 'robots.txt', '.nojekyll', '404.html']) {
  try { await fs.access(path.join(output, required)); } catch { failures.push(`Missing ${required}`); }
}
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`Checked ${htmlFiles.length} HTML pages, ${checkedLinks} local links and ${index.length} searchable posts. No broken local links or duplicate IDs.`);
