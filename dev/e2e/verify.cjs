/* Run with NODE_PATH pointing at a Playwright installation. Credentials stay in a local 0600 file. */
const fs = require('fs');
const assert = require('assert');
const { chromium } = require('playwright');
const fixture = JSON.parse(fs.readFileSync(process.env.CIVICSIGNAL_FIXTURE || '/tmp/civicsignal-frontend-fixture.json'));
const apps = ['explorer', 'sources', 'topics', 'tools'];
const origin = name => `http://${name}.civicsignal.localhost:8083`;
(async () => {
  const browser = await chromium.launch({channel: 'chrome', headless: true});
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin('explorer') + '/#/login', {waitUntil: 'networkidle'});
    await page.locator('input[name=email]').fill(fixture.email);
    await page.locator('input[name=password]').fill(fixture.password);
    const login = page.waitForResponse(response => response.url().endsWith('/api/login'));
    await page.locator('form.login-form button[type=submit]').click();
    assert.strictEqual((await login).status(), 200);
    console.log('PASS browser login through frontend to real backend');
    const request = async (app, path, form) => {
      const response = form ? await context.request.post(origin(app) + path, {form}) : await context.request.get(origin(app) + path);
      assert.strictEqual(response.status(), 200, `${app} ${path}: HTTP ${response.status()}`);
      return response.json();
    };
    for (const name of apps) {
      const health = await request(name, '/healthz');
      assert.strictEqual(health.app, name);
      const session = await request(name, '/api/login-with-cookie');
      assert.strictEqual(session.profile.email, fixture.email);
      await page.goto(origin(name) + '/#/home', {waitUntil: 'networkidle'});
      const text = await page.locator('body').innerText();
      assert(text.length > 150 && !text.includes('Page Not Found'), `${name} React page failed to render`);
      const config = await page.evaluate(() => document.appConfig.toolUrls);
      for (const other of apps) assert.strictEqual(config[other], origin(other));
      console.log(`PASS ${name}: hostname routing, React page, shared Redis session, local navigation`);
    }
    const media = await request('explorer', '/api/explorer/sources/list?sources[]=' + fixture.media_id);
    assert(media.results.some(item => Number(item.media_id) === Number(fixture.media_id)));
    await request('sources', '/api/sources/list?src[]=' + fixture.media_id);
    await request('topics', '/api/topics/search?searchStr=frontend-e2e');
    const sample = await request('explorer', '/api/explorer/stories/sample', {q: 'stories_id:' + fixture.stories_id, sources: String(fixture.media_id), collections: '', searches: '', startDate: '2000-01-01', endDate: '2100-01-01'});
    assert(sample.results.some(item => Number(item.stories_id) === Number(fixture.stories_id)));
    console.log('PASS Explorer, Sources and Topics call the real backend API, including indexed story search');
    const timestamp = String(Date.now());
    if (!process.env.CIVICSIGNAL_VERIFY_PERSISTENCE) {
      await request('explorer', '/api/explorer/save-searches', {queryName: 'Docker E2E search', timestamp, queries: JSON.stringify([{q: 'stories_id:' + fixture.stories_id, sources: [fixture.media_id], collections: []}])});
    }
    const searches = await request('explorer', '/api/explorer/load-user-searches');
    assert(searches.list.some(item => item.queryName === 'Docker E2E search'));
    console.log('PASS saved Explorer search persists in MongoDB');
    assert.deepStrictEqual(errors, [], 'Browser JavaScript errors');
    await page.screenshot({path: '/tmp/civicsignal-tools-e2e.png', fullPage: true});
    console.log('PASS no browser JavaScript exceptions');
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exit(1); });
