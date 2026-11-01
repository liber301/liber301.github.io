import test from 'node:test';
import assert from 'node:assert/strict';
import matter from 'gray-matter';
import {serializeEntry,publishEntry,createClient} from '../assets/publisher.js';
const entry={kind:'article',title:'图文 "测试"\n第二行',slug:'writing-test',date:'2026-11-01',body:'## 小标题\n\n中文与 **加粗**。',category:'开发笔记',tags:['测试'],excerpt:'',images:[]};
function fixture({conflict=false,lostResponse=false,duplicate=false}={}){
  const calls=[];
  const request=async(route,method='GET',data)=>{
    calls.push({route,method,data});
    if(route==='git/ref/heads/main')return {object:{sha:lostResponse&&calls.filter(call=>call.route===route).length>1?'commit-new':'head-old'}};
    if(route==='git/commits/head-old')return {tree:{sha:'tree-old'}};
    if(route==='git/trees/tree-old?recursive=1')return {tree:[{path:'README.md',sha:'keep-this'}]};
    if(route.startsWith('contents/content-index.json'))return {content:Buffer.from(JSON.stringify(duplicate?[{slug:entry.slug,kind:'article',path:'old.md'}]:[{slug:'hello',kind:'article',path:'old.md'}])).toString('base64')};
    if(route==='git/blobs')return {sha:'image-blob'};
    if(route==='git/trees')return {sha:'tree-new'};
    if(route==='git/commits')return {sha:'commit-new'};
    if(route==='git/refs/heads/main') {if(conflict||lostResponse)throw new Error('connection or conflict');return {};}
    throw new Error('Unexpected request '+route);
  };return {calls,request};
}
test('all three kinds serialize to valid Markdown with exact Unicode, metadata and image references',()=>{
  for(const kind of ['article','note','photo']){
    const sample={...entry,kind,images:kind==='photo'?[{path:'/assets/uploads/test.webp',alt:'图片 "说明"'}]:[]};
    const parsed=matter(serializeEntry(sample));
    assert.equal(parsed.data.title,entry.title);assert.equal(parsed.data.kind,kind);assert.deepEqual(parsed.data.tags,['测试']);assert(parsed.content.includes('中文'));
    if(kind==='photo')assert.deepEqual(parsed.data.images,[{src:'/assets/uploads/test.webp',alt:'图片 "说明"'}]);
  }
});
test('images and content are committed atomically while preserving the existing tree and parent',async()=>{
  const f=fixture();
  const image={path:'/assets/uploads/test.webp',alt:'说明',dataUrl:'data:image/webp;base64,aGVsbG8='};
  const result=await publishEntry({...entry,kind:'photo',images:[image]},f.request);
  assert.equal(result.sha,'commit-new');
  const tree=f.calls.find(call=>call.route==='git/trees').data;
  assert.equal(tree.base_tree,'tree-old');assert.equal(tree.tree.length,3);assert.equal(tree.tree[1].sha,'image-blob');
  assert.deepEqual(f.calls.find(call=>call.route==='git/commits').data.parents,['head-old']);
  assert.deepEqual(f.calls.find(call=>call.route==='git/refs/heads/main').data,{sha:'commit-new',force:false});
  assert.equal(JSON.parse(tree.tree.at(-1).content)[0].slug,'hello');
});
test('existing URLs and concurrent changes are rejected without forcing or claiming success',async()=>{
  const duplicate=fixture({duplicate:true});await assert.rejects(publishEntry(entry,duplicate.request),/链接名/);assert(!duplicate.calls.some(call=>call.method==='POST'));
  const conflict=fixture({conflict:true});await assert.rejects(publishEntry(entry,conflict.request));assert.equal(conflict.calls.filter(call=>call.route==='git/refs/heads/main').length,1);
});
test('a lost reference-update response is reconciled using the actual branch',async()=>{const f=fixture({lostResponse:true});assert.equal((await publishEntry(entry,f.request)).sha,'commit-new');});
test('bad photos, tags and paths fail before any GitHub request',async()=>{
  for(const change of [{kind:'photo'},{slug:'../../bad'},{tags:['../bad']},{body:''},{body:'# A duplicate main title'}]){const f=fixture();await assert.rejects(publishEntry({...entry,...change},f.request));assert.equal(f.calls.length,0);}
});
test('credentials are sent only to the fixed GitHub repository and API failures remain failures',async()=>{
  const client=createClient('test-only-token',async(url,options)=>{assert(url.startsWith('https://api.github.com/repos/liber301/liber301.github.io/'));assert.equal(options.headers.Authorization,'Bearer test-only-token');return new Response('{}',{status:403});});
  await assert.rejects(client('git/ref/heads/main'),/Contents/);
});
