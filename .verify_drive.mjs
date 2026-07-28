import puppeteer from 'puppeteer-core';

const BASE = 'http://localhost:3001';
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-first-run'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

// --- Sign in ---
await page.goto(`${BASE}/sign-in`, { waitUntil: 'networkidle2' });
await page.type('#email', 'claude.verify.tester@lightbearers.local');
await page.type('#password', 'Verify-Test-2026!');
await Promise.all([
  page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
  page.click('button[type="submit"]'),
]);
console.log('after sign-in, url:', page.url());

// --- Prayer wall: before state ---
await page.goto(`${BASE}/prayer-wall`, { waitUntil: 'networkidle2' });
const btnSel = 'button ::-p-text(I prayed for this)';
await page.waitForSelector(btnSel, { timeout: 15000 });
const before = await page.$eval(btnSel, (b) => ({ text: b.textContent, disabled: b.disabled }));
console.log('BEFORE click:', JSON.stringify(before));
await page.screenshot({ path: '.verify_shots/1-before-click.png' });

// --- Click ---
await page.click(btnSel);
await new Promise((r) => setTimeout(r, 2500));
const after = await page.$eval(btnSel, (b) => ({ text: b.textContent, disabled: b.disabled }));
console.log('AFTER click:', JSON.stringify(after));
await page.screenshot({ path: '.verify_shots/2-after-click.png' });

// --- Reload: does the state persist? ---
await page.reload({ waitUntil: 'networkidle2' });
await page.waitForSelector(btnSel, { timeout: 15000 });
const reloaded = await page.$eval(btnSel, (b) => ({ text: b.textContent, disabled: b.disabled }));
console.log('AFTER reload:', JSON.stringify(reloaded));
await page.screenshot({ path: '.verify_shots/3-after-reload.png' });

// --- Probe: click again after reload (same user, already prayed) ---
if (!reloaded.disabled) {
  await page.click(btnSel);
  await new Promise((r) => setTimeout(r, 2500));
  const second = await page.$eval(btnSel, (b) => ({ text: b.textContent, disabled: b.disabled }));
  console.log('AFTER 2nd click (same user):', JSON.stringify(second));
  await page.screenshot({ path: '.verify_shots/4-second-click.png' });
}

// --- Probe: signed-out click ---
const ctx = await browser.createBrowserContext();
const anon = await ctx.newPage();
await anon.setViewport({ width: 1280, height: 900 });
await anon.goto(`${BASE}/prayer-wall`, { waitUntil: 'networkidle2' });
await anon.waitForSelector(btnSel, { timeout: 15000 });
await anon.click(btnSel);
await new Promise((r) => setTimeout(r, 4000));
console.log('signed-out click, url now:', anon.url());
const anonBtn = await anon.$(btnSel);
if (anonBtn) {
  console.log('signed-out button state:', JSON.stringify(await anon.$eval(btnSel, (b) => ({ text: b.textContent, disabled: b.disabled }))));
}
await anon.screenshot({ path: '.verify_shots/5-signed-out-click.png' });

await browser.close();
