import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unzipSync, strFromU8 } from 'fflate';
import { readJsonObject } from '../lib/http.ts';
import { RateLimiter } from '../lib/rate-limit.ts';
import { SESSION_SECONDS, signSession, verifySession } from '../lib/admin-session.ts';
import { fetchAvatarImage } from '../lib/avatar.ts';
import { buildApplicationsWorkbook } from '../lib/application-export.ts';
import { validateApplication, validateEnquiry, validId } from '../remote/validation.js';
import { allowsRequestOrigin } from '../lib/request-origin.ts';
import { NextRequest } from 'next/server.js';

const valid = { full_name: 'Test Applicant', x_handle: '@test_member', telegram: '@test_member', email: 'test@example.com', country: 'Nigeria', role: 'scout', desks: ['DeFi'], links: 'https://example.com/research', context: '', why: 'I investigate user activity and explain findings using clear evidence.' };
const request = (body, type = 'application/json') => new Request('https://example.com/api/apply', { method: 'POST', headers: { 'content-type': type }, body });

test('same-origin browser posts survive Next loopback and internal hostname normalization', () => {
  const local = new NextRequest('http://127.0.0.1:3100/api/apply', { method: 'POST', headers: { host: '127.0.0.1:3100', origin: 'http://127.0.0.1:3100', 'sec-fetch-site': 'same-origin' } });
  assert.equal(new URL(local.url).hostname, 'localhost');
  assert.equal(allowsRequestOrigin(local), true);
  const proxied = new Request('https://internal.example/api/apply', { method: 'POST', headers: { host: 'example.com', origin: 'https://example.com' } });
  assert.equal(allowsRequestOrigin(proxied), true);
});
test('origin checks reject foreign, forged, malformed, and cross-site browser posts', () => {
  for (const headers of [
    { origin: 'https://attacker.example', 'x-forwarded-host': 'attacker.example' },
    { origin: 'http://example.com' },
    { origin: 'https://example.com:8443' },
    { origin: 'https://example.com/path' },
    { origin: 'null' },
    { origin: '' },
    { origin: 'https://example.com', 'sec-fetch-site': 'cross-site' },
    { origin: 'https://example.com', host: 'example.com/anything' },
  ]) {
    const req = new Request('https://example.com/api/admin/approve', { method: 'POST', headers: { host: 'example.com', ...headers } });
    assert.equal(allowsRequestOrigin(req), false, JSON.stringify(headers));
  }
  assert.equal(allowsRequestOrigin(new Request('https://example.com/api/apply', { method: 'POST' })), true);
});

for (const body of ['null', '[]', '"text"', 'false', '{broken']) {
  test(`reject malformed or non-object JSON: ${body}`, async () => {
    await assert.rejects(readJsonObject(request(body)), error => error.status === 400);
  });
}
test('reject JSON disguised as a form submission', async () => {
  await assert.rejects(readJsonObject(request('{}', 'text/plain')), error => error.status === 415);
});
test('reject oversized chunked bodies without trusting content-length', async () => {
  let cancelled = false;
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(40000)); }, cancel() { cancelled = true; } });
  const req = new Request('https://example.com', { method: 'POST', headers: { 'content-type': 'application/json' }, body: stream, duplex: 'half' });
  await assert.rejects(readJsonObject(req), error => error.status === 413);
  assert.equal(cancelled, true);
});
test('retain valid Unicode and reject field coercion, truncation, and forged desks', () => {
  assert.deepEqual(validateApplication({ ...valid, full_name: 'Ọlá Test' }).errors, []);
  for (const change of [{ full_name: {} }, { email: 42 }, { links: 'x'.repeat(4001) }, { desks: ['DeFi', 'fake'] }, { why: 'too short' }, { x_handle: 'https://x.com/test' }, { company: 'bot' }, { email: 'test@example.com\r\nBcc: other@example.com' }]) {
    assert.ok(validateApplication({ ...valid, ...change }).errors.length);
  }
  assert.deepEqual(validateApplication({ ...valid, desks: ['DeFi', 'DeFi'] }).app.desks, ['DeFi']);
  assert.ok(validateEnquiry({ name: 'Test', email: 'test@example.com', question: {}, company: '' }).errors.length);
});
test('database IDs cannot be coerced or overflow the serial column', () => {
  for (const value of ['1', true, null, 1.5, 0, -1, 2147483648]) assert.equal(validId(value), false);
  assert.equal(validId(1), true);
});
test('applications accept the three current research desks and reject retired choices', () => {
  const desks = ['Consumer apps', 'DeFi', 'Protocols'];
  assert.deepEqual(validateApplication({ ...valid, role: 'partnership', desks }).errors, []);
  for (const desk of ['RWA', 'Infrastructure', 'Market intel']) {
    assert.ok(validateApplication({ ...valid, desks: [desk] }).errors.length);
  }
});
test('reject weak, tampered, expired, extended, and malformed admin sessions', () => {
  const secret = 'test-only-admin-password-32-chars';
  const now = Date.now();
  const token = signSession(secret, now + 60000);
  assert.equal(verifySession(secret, token, now), true);
  assert.equal(verifySession(secret, token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a'), now), false);
  assert.equal(verifySession(secret, `${token}.extra`, now), false);
  assert.equal(verifySession(secret, signSession(secret, now - 1), now), false);
  assert.equal(verifySession(secret, signSession(secret, now + (SESSION_SECONDS + 1) * 1000), now), false);
  assert.equal(verifySession('short', signSession('short', now + 1000), now), false);
  assert.equal(verifySession('', signSession('', now + 1000), now), false);
});
test('rate-limit capacity never evicts active limits to admit new keys', () => {
  const limiter = new RateLimiter(2);
  assert.equal(limiter.retryAfter('a', 1, 1000, 100), 0);
  assert.equal(limiter.retryAfter('b', 1, 1000, 100), 0);
  assert.ok(limiter.retryAfter('c', 1, 1000, 100) > 0);
  assert.ok(limiter.retryAfter('a', 1, 1000, 100) > 0);
  assert.equal(limiter.retryAfter('c', 1, 1000, 1100), 0);
});
test('never serve active SVG or HTML from the avatar endpoint', async () => {
  for (const type of ['image/svg+xml', 'image/png', 'text/html']) {
    const result = await fetchAvatarImage('test_member', async () => new Response('<svg onload="alert(1)"/>', { headers: { 'content-type': type } }));
    assert.equal(result.status, 415);
  }
});
test('block avatar redirects into private networks or unapproved hosts', async () => {
  for (const location of ['https://127.0.0.1/private', 'http://pbs.twimg.com/file', 'https://pbs.twimg.com:8443/file', 'https://attacker.example/file']) {
    let calls = 0;
    const result = await fetchAvatarImage('test_member', async () => { calls++; return new Response(null, { status: 302, headers: { location } }); });
    assert.equal(result.status, 502);
    assert.equal(calls, 1);
  }
});
test('bound avatar response size even with no content-length', async () => {
  let cancelled = false;
  const result = await fetchAvatarImage('test_member', async () => new Response(new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(2 * 1024 * 1024 + 1)); }, cancel() { cancelled = true; } }), { headers: { 'content-type': 'image/png' } }));
  assert.equal(result.status, 413);
  assert.equal(cancelled, true);
});
test('serve checked raster avatars after an approved CDN redirect', async () => {
  let calls = 0;
  const result = await fetchAvatarImage('test_member', async () => {
    if (++calls === 1) return new Response(null, { status: 302, headers: { location: 'https://pbs.twimg.com/avatar.png' } });
    return new Response(new Uint8Array([137,80,78,71,13,10,26,10]), { headers: { 'content-type': 'image/png' } });
  });
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('x-content-type-options'), 'nosniff');
  assert.match(result.headers.get('content-security-policy'), /sandbox/);
});
test('Excel keeps applicant content as text, freezes headers, and preserves filters', async () => {
  const buffer = await buildApplicationsWorkbook([{ ...valid, id: 1, created_at: 'invalid-date', full_name: '=HYPERLINK("https://attacker.example")', status: 'pending', tier: null, claim_token: null, serial: 'IFG-2026-001' }]);
  const zip = unzipSync(buffer);
  const sheet = strFromU8(zip['xl/worksheets/sheet1.xml']);
  const strings = zip['xl/sharedStrings.xml'] ? strFromU8(zip['xl/sharedStrings.xml']) : sheet;
  assert.match(strings, /HYPERLINK/);
  assert.doesNotMatch(sheet, /<f[ >]/);
  assert.match(sheet, /autoFilter ref="A1:N2"/);
  assert.match(sheet, /state="frozen"/);
  assert.ok((await buildApplicationsWorkbook([])).length > 0);
});
