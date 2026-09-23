const { chromium } = require('playwright');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  for (const [name, url] of [
    ['home', 'https://www.amazon.com/'],
    ['search', 'https://www.amazon.com/s?k=wireless+headphones'],
    ['cart', 'https://www.amazon.com/gp/cart/view.html'],
    ['signin', 'https://www.amazon.com/ap/signin'],
  ]) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(1800);
      await page.screenshot({ path: `research/amazon-${name}.png`, fullPage: false });
      const text = await page.locator('body').innerText();
      fs.writeFileSync(`research/amazon-${name}.txt`, text);
      console.log(
        JSON.stringify({
          name,
          url: page.url(),
          title: await page.title(),
          text: text.slice(0, 9000),
        }),
      );
    } catch (error) {
      console.log(name, error.message);
    }
  }
  await browser.close();
})();
