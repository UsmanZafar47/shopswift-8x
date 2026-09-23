const { chromium } = require('playwright');
const fs = require('node:fs');
(async () => {
  fs.mkdirSync('test-results', { recursive: true });
  const b = await chromium.launch({ channel: 'chrome' });
  const p = await b.newPage({ viewport: { width: 1440, height: 1050 } });
  p.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));
  await p.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 120000 });
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 450) {
      scrollTo(0, y);
      await new Promise(resolve => setTimeout(resolve, 120));
    }
    scrollTo(0, 0);
  });
  await p.waitForTimeout(1000);
  await p.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  console.log(await p.title());
  console.log(
    'overflow',
    await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
  );
  await p.setViewportSize({ width: 390, height: 844 });
  await p.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
  console.log(
    'mobile overflow',
    await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
  );
  await b.close();
})();
