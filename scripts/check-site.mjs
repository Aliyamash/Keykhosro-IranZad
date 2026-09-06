import assert from 'node:assert/strict';
// Isolate local Workerd test connections (no pooled HTTP sessions).
const nativeFetch = globalThis.fetch;
const fetch = async (url, options={}) => {
  // Give local Workerd's request teardown time before the next mutation.
  await new Promise(resolve=>setTimeout(resolve,250));
  let response=await nativeFetch(url, {...options, headers:{...options.headers, Connection:'close'}});
  if(response.status===503 && (await response.clone().text()).includes('worker restarted mid-request')) {
    // Local Miniflare explicitly requests retry after its isolate restarts.
    console.log('Local Workerd restart: retrying once',url);
    await new Promise(resolve=>setTimeout(resolve,500));
    response=await nativeFetch(url, {...options, headers:{...options.headers, Connection:'close'}});
  }
  const body=await response.arrayBuffer();
  return new Response(body,{status:response.status,headers:response.headers});
};
const base = process.env.TEST_BASE || 'http://localhost:4173';
const identity = {
  'oai-authenticated-user-id': 'local-test-admin',
  'oai-authenticated-user-email': 'seedy@sites.test',
};
for (const path of ['/', '/works', '/studio']) {
  const r = await fetch(base + path);
  assert.equal(r.status, 200, path);
  const html = await r.text();
  assert.ok(html.includes('کیخسرو'), path);
}
assert.equal((await fetch(base + '/api/admin/inquiries')).status, 403);
assert.equal(
  (
    await fetch(base + '/api/admin/inquiries', {
      headers: {
        ...identity,
        'oai-authenticated-user-email': 'intruder@example.com',
      },
    })
  ).status,
  403,
);
assert.equal(
  (
    await fetch(base + '/api/inquiries', {
      method: 'POST',
      headers: {
        Origin: 'https://example.org',
        'Content-Type': 'application/json',
      },
      body: '{}',
    })
  ).status,
  403,
);
assert.equal(
  (
    await fetch(base + '/api/inquiries', {
      method: 'POST',
      headers: { Origin: base, 'Content-Type': 'application/json' },
      body: '{}',
    })
  ).status,
  400,
);
const fixture = {
  name: 'Local integration test',
  email: 'local-check-' + Date.now() + '@example.com',
  phone: '',
  service: 'editorial',
  message: 'Local test request for database verification.',
  language: 'en',
  website: '',
};
const r = await fetch(base + '/api/inquiries', {
  method: 'POST',
  headers: { Origin: base, 'Content-Type': 'application/json' },
  body: JSON.stringify(fixture),
});
assert.equal(r.status, 201, await r.clone().text());
const created = await r.json();
assert.match(created.reference, /^KI-/);
const list = await fetch(base + '/api/admin/inquiries', { headers: identity });
assert.equal(list.status, 200, await list.clone().text());
const data = await list.json();
const item = data.items.find((i) => i.reference === created.reference);
assert.ok(item, 'Persisted inquiry exists');
assert.equal(
  (
    await fetch(base + '/api/admin/inquiries/' + item.id, {
      method: 'PATCH',
      headers: { Origin: base, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed', note: 'Unauthorized' }),
    })
  ).status,
  403,
);
const update = await fetch(base + '/api/admin/inquiries/' + item.id, {
  method: 'PATCH',
  headers: { ...identity, Origin: base, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'reviewing',
    note: 'Local verification passed',
  }),
});
assert.equal(update.status, 200, await update.clone().text());
const final = await (
  await fetch(base + '/api/admin/inquiries?status=reviewing', {
    headers: identity,
  })
).json();
assert.equal(
  final.items.find((i) => i.id === item.id)?.note,
  'Local verification passed',
);
assert.equal((await fetch(base + '/admin', { headers: identity })).status, 200);
console.log(
  JSON.stringify({
    ok: true,
    checks:
      '3 public routes, authorization, origin checks, validation, persistence, status and notes',
    testId: item.id,
  }),
);
