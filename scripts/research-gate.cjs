const { chromium } = require('playwright');
const fs = require('node:fs');
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const capture = async (n) => {
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `research/amazon-${n}.png` });
    console.log(n, (await p.locator('body').innerText()).slice(0, 5500));
  };
  try {
    await p.goto('https://www.amazon.com/s?k=sony+wh+ch520', { waitUntil: 'domcontentloaded' });
    const add = p.getByRole('button', { name: 'Add to cart', exact: true }).first();
    if (await add.count()) {
      await add.click();
      await p.waitForTimeout(2500);
      await p.goto('https://www.amazon.com/gp/cart/view.html', { waitUntil: 'domcontentloaded' });
      await capture('filled-cart');
      const proceed = p.locator('[name="proceedToRetailCheckout"]');
      if (await proceed.count()) {
        await proceed.click();
        await capture('checkout-gate');
      }
    }
    await p.goto('https://www.amazon.com/', { waitUntil: 'domcontentloaded' });
    await p.locator('#nav-link-accountList').click();
    await capture('signin-form');
  } catch (e) {
    console.log(e.message);
  } finally {
    await b.close();
  }
})();
