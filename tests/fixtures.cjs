const { test: base, expect } = require('@playwright/test');
const { createServer } = require('node:http');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

// Hosted SwiftShader can need 12-17s to prepare all high-detail models.
const modelSettle = { timeout: 30_000 };

const test = base.extend({
  artifactURL: [async ({}, use) => {
    const html = readFileSync(resolve(__dirname, '..', 'public', 'index.html'));
    const art = readFileSync(resolve(__dirname, '..', 'public', 'art.js'));
    const server = createServer((req, res) => {
      if (req.url === '/art.js') {
        res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' }).end(art);
        return;
      }
      if (req.url !== '/' && req.url !== '/index.html') {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(html);
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try { await use(`http://127.0.0.1:${server.address().port}`); }
    finally { await new Promise(resolve => server.close(resolve)); }
  }, { scope: 'worker' }],
  openGame: async ({ browser, artifactURL }, use, testInfo) => {
    const contexts = [];
    const unexpected = new Set();
    const saveErrorChecks = [];
    await use(async (saves = {}, expectedSaveErrors = [], { direct = false } = {}) => {
      for (const context of contexts) if (context.pages().length) await context.close();
      const gameURL = direct ? pathToFileURL(resolve(__dirname, '..', 'public', 'index.html')).href : artifactURL;
      const context = await browser.newContext({
        ...testInfo.project.use,
        ...(direct ? {} : { storageState: { cookies: [], origins: [{
          origin: artifactURL,
          localStorage: Object.entries(saves).map(([name, value]) => ({ name, value: typeof value === 'string' ? value : JSON.stringify(value) }))
        }] } })
      });
      contexts.push(context);
      context.on('weberror', error => unexpected.add(error.error().message));
      const seenSaveErrors = new Set();
      saveErrorChecks.push({ expectedSaveErrors, seenSaveErrors });
      context.on('console', message => {
        const text = message.text();
        // Observed Chromium/SwiftShader diagnostic, not a GL correctness failure.
        if (message.type() === 'warning' && /^\[\.WebGL-0x[0-9a-f]+\]GL Driver Message \(OpenGL, Performance, GL_CLOSE_PATH_NV, High\): GPU stall due to ReadPixels(?: \(this message will no longer repeat\))?$/.test(text)) return;
        const expectedKey = expectedSaveErrors.find(key => text.startsWith(`Could not save/load ${key} `));
        if (message.type() === 'error' && expectedKey) seenSaveErrors.add(expectedKey);
        else if (['error', 'warning'].includes(message.type())) unexpected.add(`${message.type()}: ${text}`);
      });
      await context.route('**/*', route => {
        const url = new URL(route.request().url());
        if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) return route.fulfill({ status: 200, body: '' });
        const localFile = direct && [gameURL, new URL('art.js', gameURL).href].includes(url.href);
        if (direct ? !localFile : url.origin !== artifactURL) {
          unexpected.add(`Unexpected external request: ${url.href}`);
          return route.abort();
        }
        return route.continue();
      });
      await context.addInitScript(() => {
        let seed = 123456789;
        Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
        window.QLOCK = 3;
        addEventListener('unhandledrejection', event => console.error('Unhandled rejection', event.reason));
      });
      const page = await context.newPage();
      await page.goto(gameURL, { waitUntil: 'domcontentloaded' });
      await expect.poll(() => page.evaluate(() => typeof PS2C !== 'undefined' && PS2C.ready && !!gl && !gl.isContextLost() && menuT > 0), modelSettle).toBe(true);
      return page;
    });
    for (const context of contexts) await context.close();
    expect([...unexpected], 'Unhandled browser/render/graphics failures').toEqual([]);
    for (const { expectedSaveErrors, seenSaveErrors } of saveErrorChecks) {
      for (const key of expectedSaveErrors) expect(seenSaveErrors.has(key), `Expected logged failure for ${key}`).toBe(true);
    }
  }
});

async function progressing(page) {
  const before = await page.evaluate(() => menuT);
  await expect.poll(() => page.evaluate(() => menuT)).toBeGreaterThan(before + 0.1);
  expect(await page.evaluate(() => !!gl && !gl.isContextLost())).toBe(true);
}

module.exports = { test, expect, progressing, modelSettle };
