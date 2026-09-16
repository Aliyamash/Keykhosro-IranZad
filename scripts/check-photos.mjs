import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const base = process.env.TEST_BASE || 'http://localhost:4174';
const adminPassword = process.env.TEST_ADMIN_PASSWORD;
assert.ok(adminPassword, 'Set TEST_ADMIN_PASSWORD for the local gallery check');
const call = async (path, options={}) => {
  await new Promise(r=>setTimeout(r,250));
  const response=await fetch(base+path,options);
  const bytes=await response.arrayBuffer();
  return new Response(bytes,{status:response.status,headers:response.headers});
};
assert.equal((await call('/api/admin/photos')).status,403);
assert.equal((await call('/api/admin/photos',{method:'POST'})).status,403);
const login=await call('/api/admin/session',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({password:adminPassword})});
assert.equal(login.status,200,await login.clone().text());
const cookie=login.headers.get('set-cookie')?.split(';',1)[0];
assert.ok(cookie?.startsWith('ki_admin_session='),'Admin session cookie issued');
const headers={Cookie:cookie,Origin:base};
assert.equal((await call('/api/admin/photos',{method:'POST',headers:{...headers,Origin:'https://invalid.example'}})).status,403);
const before=await (await call('/api/admin/photos',{headers})).json();
const bytes=await readFile(new URL('../public/images/studio.webp',import.meta.url));
const data=new FormData();
data.set('section','works');data.set('title_fa','تست موقت گالری');data.set('title_en','Temporary gallery test');data.set('file',new Blob([bytes],{type:'image/webp'}),'test.webp');
const invalid=new FormData();invalid.set('section','works');invalid.set('title_fa','تست');invalid.set('title_en','Test');invalid.set('file',new Blob(['not an image'],{type:'image/webp'}),'fake.webp');
assert.equal((await call('/api/admin/photos',{method:'POST',headers,body:invalid})).status,400);
const upload=await call('/api/admin/photos',{method:'POST',headers,body:data});
assert.equal(upload.status,201,await upload.clone().text());
const {id}=await upload.json();
try {
  const listed=await (await call('/api/admin/photos',{headers})).json();
  assert.equal(listed.items.length,before.items.length+1);
  assert.ok(listed.items.some(p=>p.id===id));
  const image=await call('/api/photos/'+id);assert.equal(image.status,200);assert.equal(image.headers.get('content-type'),'image/webp');assert.deepEqual(Buffer.from(await image.arrayBuffer()),bytes);
  const works=await call('/works');assert.equal(works.status,200);assert.ok((await works.text()).includes('/api/photos/'+id));
  const home=await call('/');assert.equal(home.status,200);assert.ok(!(await home.text()).includes('/api/photos/'+id));
  assert.equal((await call('/api/admin/photos/'+id,{method:'DELETE'})).status,403);
} finally {
  assert.equal((await call('/api/admin/photos/'+id,{method:'DELETE',headers})).status,200);
}
assert.equal((await call('/api/photos/'+id)).status,404);
const after=await (await call('/api/admin/photos',{headers})).json();assert.equal(after.items.length,before.items.length);
assert.equal((await call('/studio')).status,200);
console.log('PASS: authorization, origin protection, file validation, durable upload, image bytes, works rendering, unchanged homepage, deletion.');
