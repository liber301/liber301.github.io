export const repository = 'liber301/liber301.github.io';
export const branch = 'main';
export function serializeEntry(entry) {
  if (!['article', 'note', 'photo'].includes(entry.kind)) throw new Error('请选择内容类型。');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug)) throw new Error('链接名只支持小写字母、数字和连字符。');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || Number.isNaN(Date.parse(entry.date))) throw new Error('请选择有效日期。');
  if (!entry.title.trim()) throw new Error('请填写标题。');
  if (entry.kind === 'photo' && !entry.images.length) throw new Error('请至少添加一张图片。');
  if (entry.kind !== 'photo' && !entry.body.trim()) throw new Error('请先写一点内容。');
  if (/^#\s/m.test(entry.body)) throw new Error('正文请从二级标题（##）开始，主标题填写在上方标题栏。');
  if (entry.tags.some(tag => !tag.trim() || ['.', '..'].includes(tag) || /[\/\\\u0000-\u001f]/.test(tag))) throw new Error('标签不能包含路径符号。');
  const fields = { title:entry.title.trim(),slug:entry.slug,date:entry.date,kind:entry.kind,category:entry.category.trim() || {article:'开发笔记',note:'日常短文',photo:'光影记录'}[entry.kind],tags:entry.tags,excerpt:entry.excerpt.trim() || entry.body.replace(/[#*`>\[\]]/g,'').slice(0,110).trim() || '一组图片记录。' };
  if (entry.kind === 'photo') fields.images = entry.images.map(image=>({src:image.path,alt:image.alt}));
  return '---\n'+Object.entries(fields).map(([key,value])=>`${key}: ${JSON.stringify(value)}`).join('\n')+'\n---\n\n'+entry.body.trim()+'\n';
}
export function createClient(token, transport = fetch) {
  return async function request(route, method = 'GET', data) {
    const response = await transport(`https://api.github.com/repos/${repository}/${route}`, {method,signal:AbortSignal.timeout(30000),headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','Content-Type':'application/json','X-GitHub-Api-Version':'2026-03-10'},...(data === undefined ? {} : {body:JSON.stringify(data)})});
    if (!response.ok) {
      const messages = {401:'GitHub 授权已失效，请重新连接。',403:'GitHub 拒绝了请求，请确认令牌可读写这个仓库的 Contents，或稍后再试。',404:'找不到仓库或文件，请检查令牌选择的仓库。',409:'仓库已有新提交，草稿已保留，请重试。',422:'提交未完成，可能有新的仓库修改或链接名冲突，草稿已保留。'};
      const error = new Error(messages[response.status] || `GitHub 请求失败（${response.status}），草稿已保留。`);
      error.status = response.status;
      throw error;
    }
    return response.status === 204 ? {} : response.json();
  };
}
export async function publishEntry(entry, request, onProgress = () => {}) {
  const content = serializeEntry(entry);
  const filename = `content/posts/${entry.date}-${entry.slug}.md`;
  onProgress('检查仓库与链接名……');
  const ref = await request(`git/ref/heads/${branch}`);
  const parent = await request(`git/commits/${ref.object.sha}`);
  const existing = await request(`git/trees/${parent.tree.sha}?recursive=1`);
  if (existing.truncated) throw new Error('仓库目录过大，暂时不能安全检查链接名。');
  // Slugs are globally unique, including legacy files whose filename differs from their slug.
  const manifest = await request(`contents/content-index.json?ref=${ref.object.sha}`).catch(error => { if (error.status === 404) return null; throw error; });
  if (manifest?.content) {
    const records = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(manifest.content.replace(/\s/g,'')), c=>c.charCodeAt(0))));
    if (records.some(item => item.slug === entry.slug)) throw new Error('这个链接名已经被使用，请换一个链接名。');
  }
  if (existing.tree.some(item => item.path === filename)) throw new Error('这条记录已存在，请更换链接名后发布。');
  const uploads = entry.images.filter(image => image.dataUrl && (entry.kind === 'photo' || entry.body.includes(image.path)));
  const tree = [{path:filename,mode:'100644',type:'blob',content}];
  for (let index=0; index<uploads.length; index++) {
    const image=uploads[index];
    if (!/^\/assets\/uploads\/[a-z0-9-]+\.(?:webp|jpg|png)$/.test(image.path) || !/^data:image\/(?:webp|jpeg|png);base64,/.test(image.dataUrl)) throw new Error('图片格式无效，请重新添加。');
    onProgress(`上传图片 ${index+1} / ${uploads.length}……`);
    const blob=await request('git/blobs','POST',{content:image.dataUrl.split(',')[1],encoding:'base64'});
    tree.push({path:image.path.slice(1),mode:'100644',type:'blob',sha:blob.sha});
  }
  // Keep a small source manifest in the same commit to prevent duplicate slugs before the next deployment.
  const records=manifest?.content ? JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(manifest.content.replace(/\s/g,'')),c=>c.charCodeAt(0)))) : [];
  tree.push({path:'content-index.json',mode:'100644',type:'blob',content:JSON.stringify([...records,{slug:entry.slug,kind:entry.kind,path:filename}])+'\n'});
  onProgress('保存文章与图片……');
  const nextTree=await request('git/trees','POST',{base_tree:parent.tree.sha,tree});
  const commit=await request('git/commits','POST',{message:`Publish ${entry.kind}: ${entry.title}`,tree:nextTree.sha,parents:[ref.object.sha]});
  try { await request(`git/refs/heads/${branch}`,'PATCH',{sha:commit.sha,force:false}); }
  catch (error) {
    // A lost response must not be treated as an uncommitted draft without checking the branch.
    const current=await request(`git/ref/heads/${branch}`).catch(()=>null);
    if (current?.object.sha !== commit.sha) throw error;
  }
  return {sha:commit.sha,url:`https://github.com/${repository}/commit/${commit.sha}`,path:filename};
}
