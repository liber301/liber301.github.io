import {createClient, publishEntry, repository} from './publisher.js';
const $ = selector => document.querySelector(selector);
const form = $('#writer-form');
const markdown = window.markdownit({html:false,linkify:true,typographer:true});
let images = [], request = null, connectedToken = '', busy = false, preparingImages = false, published = false, saveTimer, pollTimer;
let revision = 0;
const draftStatus = $('#draft-status');
const escape = text => String(text).replace(/[&<>"']/g, char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const today = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const newSlug = () => 'entry-'+Date.now().toString(36);
function fields() {
  const data = new FormData(form);
  const body = data.get('body') || '';
  return {kind:data.get('kind'),title:data.get('title').trim() || (data.get('kind')==='note' ? body.replace(/[#*`>\[\]]/g,'').trim().slice(0,24) : ''),body,date:data.get('date'),category:data.get('category'),tags:data.get('tags').split(/[,，]/).map(tag=>tag.trim()).filter(Boolean),slug:data.get('slug').trim(),excerpt:data.get('excerpt'),images};
}
let database;
function db() {
  return database ??= new Promise((resolve,reject)=>{
    const opening = indexedDB.open('liber-writing-drafts',1);
    opening.onupgradeneeded=()=>opening.result.createObjectStore('drafts');
    opening.onsuccess=()=>resolve(opening.result);
    opening.onerror=()=>reject(opening.error);
  });
}
async function draftOperation(mode, action) {
  const connection = await db();
  return new Promise((resolve,reject)=>{
    const transaction=connection.transaction('drafts',mode);
    const result=action(transaction.objectStore('drafts'));
    transaction.oncomplete=()=>resolve(result.result);
    transaction.onerror=()=>reject(transaction.error);
    transaction.onabort=()=>reject(transaction.error);
  });
}
async function saveDraft() {
  clearTimeout(saveTimer);
  const snapshot=fields();
  const savedRevision=revision;
  try {
    await draftOperation('readwrite',store=>store.put({...snapshot,published},'current'));
    if (savedRevision === revision) draftStatus.textContent=published?'已提交到 GitHub':'草稿已保存 · 仅此设备';
    return true;
  } catch { draftStatus.textContent='草稿未能保存，请勿关闭本页'; return false; }
}
function render() {
  const entry=fields();
  $('#title-label').textContent=entry.kind==='note'?'标题（可选）':'标题';
  $('#add-image-button').textContent=entry.kind==='photo'?'＋ 添加照片':'＋ 插入图片';
  $('#word-count').textContent=`${entry.body.replace(/\s/g,'').length} 字`;
  let body=entry.body;
  for (const image of images) body=body.replaceAll(image.path,image.dataUrl);
  let html=entry.title?`<h2>${escape(entry.title)}</h2>`:'';
  html+=markdown.render(body || (entry.kind==='photo'?'为照片写几句说明，或直接添加图片。':'写下第一句话，预览会出现在这里。'));
  if(entry.kind==='photo') html+=`<div class="image-grid">${images.map(image=>`<figure><img src="${image.dataUrl}" alt="${escape(image.alt)}"><figcaption>${escape(image.alt)}</figcaption></figure>`).join('')}</div>`;
  $('#entry-preview').innerHTML=html;
}
function changed() { revision++; if(published){clearTimeout(pollTimer);$('#publish-status').textContent='上条记录已提交，继续发布请新建记录或更换链接名。';} published=false; $('#publish-result').hidden=true; draftStatus.textContent='草稿有更新……'; render(); clearTimeout(saveTimer); saveTimer=setTimeout(saveDraft,600); }
function renderAttachments() {
  const container=$('#image-attachments'); container.replaceChildren();
  images.forEach((image,index)=>{
    const card=document.createElement('div'); card.className='attachment';
    const thumbnail=document.createElement('img'); thumbnail.src=image.dataUrl; thumbnail.alt=image.alt;
    const label=document.createElement('label'); label.textContent=`图片 ${index+1} 说明`;
    const caption=document.createElement('input'); caption.value=image.alt; caption.maxLength=200; caption.placeholder='给图片写一句说明';
    caption.addEventListener('input',()=>{const escaped=image.path.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');$('#entry-body').value=$('#entry-body').value.replace(new RegExp(`!\\[[^\\]]*\\]\\(${escaped}\\)`,'g'),`![${caption.value.replace(/[\[\]\\]/g,'')}](${image.path})`);image.alt=caption.value;changed();}); label.append(caption);
    const remove=document.createElement('button'); remove.type='button'; remove.textContent='移除'; remove.setAttribute('aria-label',`移除图片 ${index+1}`);
    remove.addEventListener('click',()=>{
      // Remove the Markdown reference as well, keeping no broken local image path.
      const escaped=image.path.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      $('#entry-body').value=$('#entry-body').value.replace(new RegExp(`!\\[[^\\]]*\\]\\(${escaped}\\)\\n?`,'g'),'');
      images.splice(index,1); renderAttachments(); changed();
    });
    card.append(thumbnail,label,remove);container.append(card);
  });
}
async function prepareImage(file) {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('请使用 JPG、PNG 或 WebP 图片。');
  if(file.size>20*1024*1024) throw new Error('单张原图请小于 20 MB。');
  const bitmap=await createImageBitmap(file);
  if(bitmap.width*bitmap.height>60000000){bitmap.close();throw new Error('图片尺寸过大，请缩小后添加。');}
  const ratio=Math.min(1,2400/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*ratio);canvas.height=Math.round(bitmap.height*ratio);
  canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.86));
  if(!blob || blob.size>4*1024*1024) throw new Error('压缩后的图片仍过大，请换一张较小的图片。');
  const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});
  return {path:`/assets/uploads/${crypto.randomUUID()}.${blob.type==='image/webp'?'webp':'png'}`,dataUrl,alt:file.name.replace(/\.[^.]+$/,'')};
}
$('#add-image-button').addEventListener('click',()=>$('#image-files').click());
$('#image-files').addEventListener('change',async event=>{
  const files=[...event.target.files];const button=$('#add-image-button');button.disabled=true;preparingImages=true;
  $('#image-message').textContent='正在处理图片……';
  try {
    if(images.length+files.length>12) throw new Error('每条记录最多添加 12 张图片。');
    for(const file of files){const image=await prepareImage(file); if(images.reduce((size,item)=>size+item.dataUrl.length,0)+image.dataUrl.length>14*1024*1024) throw new Error('这一组图片较大，请减少图片数量。'); images.push(image);if(fields().kind!=='photo') $('#entry-body').value+=`\n\n![${image.alt.replace(/[\[\]\\]/g,'')}](${image.path})\n`;}
    renderAttachments();changed();$('#image-message').textContent=`已添加 ${images.length} 张图片。`;
  } catch(error){renderAttachments();changed();$('#image-message').textContent=error.message;}
  finally {button.disabled=false;preparingImages=false;event.target.value='';}
});
form.addEventListener('input',event=>{if(event.target.closest('.image-attachments'))return;changed();});
function adaptImagesToKind() {
  for(const image of images){
    if(fields().kind==='photo'){
      const escaped=image.path.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      $('#entry-body').value=$('#entry-body').value.replace(new RegExp(`!\\[[^\\]]*\\]\\(${escaped}\\)\\n?`,'g'),'');
    }else if(!$('#entry-body').value.includes(image.path))$('#entry-body').value+=`\n\n![${image.alt.replace(/[\[\]\\]/g,'')}](${image.path})\n`;
  }
}
form.addEventListener('change',event=>{if(event.target.name==='kind'){adaptImagesToKind();changed();}});

document.querySelectorAll('[data-insert]').forEach(button=>button.addEventListener('click',()=>{
  const area=$('#entry-body'),start=area.selectionStart,end=area.selectionEnd,selected=area.value.slice(start,end);
  const snippets={heading:`\n## ${selected||'小标题'}\n`,bold:`**${selected||'重点文字'}**`,quote:`\n> ${selected||'一段引用'}\n`,list:`\n- ${selected||'第一项'}\n- 第二项\n`};
  area.setRangeText(snippets[button.dataset.insert],start,end,'end');area.focus();changed();
}));
$('#save-draft').addEventListener('click',saveDraft);
$('#new-entry').addEventListener('click',async()=>{
  if((fields().body||images.length||$('#entry-title').value) && !confirm('新建会替换当前设备上的草稿，是否继续？'))return;
  clearTimeout(pollTimer);form.reset();images=[];published=false;$('#entry-date').value=today();$('#entry-slug').value=newSlug();renderAttachments();changed();$('#publish-status').textContent='';$('#published-link').hidden=true;
});
function disconnect() {connectedToken='';request=null;$('#github-token').value='';$('#connection-label').textContent='连接 GitHub，发布到博客';$('#github-panel').classList.remove('is-connected');$('#disconnect-github').hidden=true;}
$('#disconnect-github').addEventListener('click',()=>{if(busy)return;disconnect();$('#connection-message').textContent='已断开连接。';});
$('#github-connect-form').addEventListener('submit',async event=>{
  event.preventDefault();const button=event.target.querySelector('[type=submit]');button.disabled=true;
  try{
    const candidate=$('#github-token').value.trim();if(!candidate)throw new Error('请填写 GitHub 发布令牌。');
    const client=createClient(candidate);await client('git/ref/heads/main');connectedToken=candidate;request=client;$('#github-token').value='';$('#connection-label').textContent='已连接博客仓库';$('#github-panel').classList.add('is-connected');$('#connection-message').textContent='连接成功，可以发布记录。';$('#disconnect-github').hidden=false;$('#github-panel').open=false;
  }catch(error){disconnect();$('#connection-message').textContent=error.message;}
  finally{button.disabled=false;}
});
async function watchDeployment(sha,url) {
  let checks=0;
  const check=async()=>{
    try {
      const response=await fetch(`https://api.github.com/repos/${repository}/actions/runs?head_sha=${sha}&event=push`);
      if(!response.ok)throw new Error();
      const data=await response.json();const run=data.workflow_runs?.find(run=>run.name==='Deploy blog to GitHub Pages');
      if(run?.status==='completed'){
        if(run.conclusion==='success'){$('#publish-status').textContent='发布完成，博客已更新。';$('#published-link').href=url;$('#published-link').hidden=false;}
        else $('#publish-status').textContent='内容已保存到 GitHub，但部署未成功，请查看部署进度；不要重复提交。';
        return;
      }
    }catch{}
    if(++checks<18)pollTimer=setTimeout(check,10000);else $('#publish-status').textContent='内容已提交，部署仍待确认。可在 GitHub 查看进度，无需重复发布。';
  };pollTimer=setTimeout(check,5000);
}
form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;
  if(preparingImages){$('#publish-status').textContent='图片仍在处理中，请稍后再发布。';return;}
  if(published){$('#publish-status').textContent='这条记录已经提交，请新建记录后继续。';return;}
  if(!request){$('#github-panel').open=true;$('#github-token').focus();$('#publish-status').textContent='请先连接 GitHub 仓库。草稿会保留。';return;}
  if(!form.reportValidity())return;
  busy=true;await saveDraft();
  const snapshot=structuredClone(fields());
  form.querySelectorAll('input,textarea,button').forEach(element=>element.disabled=true);
  try {
    const result=await publishEntry(snapshot,request,status=>$('#publish-status').textContent=status);
    published=true;$('#publish-status').textContent='内容已提交到 GitHub，正在等待自动部署……';
    $('#publish-result').hidden=false;$('#commit-link').href=result.url;$('#deployment-link').href=`https://github.com/${repository}/actions`;
    const route={article:'posts',note:'notes',photo:'photos'}[snapshot.kind];
    watchDeployment(result.sha,`/${route}/${snapshot.slug}/`);
  } catch(error){$('#publish-status').textContent=error.message;}
  finally {form.querySelectorAll('input,textarea,button').forEach(element=>element.disabled=false);busy=false;await saveDraft();}
});
addEventListener('beforeunload',event=>{if(busy){event.preventDefault();event.returnValue='';}});
document.querySelector('[data-logout]')?.addEventListener('click',disconnect);
addEventListener('pagehide',()=>{disconnect();clearTimeout(pollTimer);});
async function initialize() {
  $('#entry-date').value=today();$('#entry-slug').value=newSlug();
  try {
    const saved=await draftOperation('readonly',store=>store.get('current'));
    if(saved){for(const key of ['title','body','date','category','slug','excerpt'])form.elements[key].value=saved[key]||'';form.elements.tags.value=(saved.tags||[]).join(', ');form.elements.kind.value=saved.kind;images=saved.images||[];published=Boolean(saved.published);draftStatus.textContent=published?'上次记录已提交，可新建记录':'已恢复这台设备上的草稿';}
    else {const kind=new URLSearchParams(location.search).get('type');if(['article','note','photo'].includes(kind))form.elements.kind.value=kind;draftStatus.textContent='新草稿 · 仅此设备';}
  }catch{draftStatus.textContent='浏览器草稿不可用，请保持本页打开直到发布完成';}
  if(fields().kind==='photo')adaptImagesToKind();
  renderAttachments();render();
}
await initialize();
