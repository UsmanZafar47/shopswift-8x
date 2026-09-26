const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const passed = [];
const errors = [];
const pass = (n) => {
  passed.push(n);
  console.log('PASS', n);
};
(async () => {
  fs.mkdirSync('test-results', { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);
  const goto = async (path) => {
    await page.goto(base + path, { waitUntil: 'networkidle', timeout: 60000 });
  };
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  try {
    await goto('/');
    await page.getByRole('heading', { name: 'Make room for good things.' }).waitFor();
    await page.screenshot({ path: 'test-results/orbit-home-desktop.png', fullPage: true });
    assert.equal(await page.evaluate(() => localStorage.length), 0);
    pass('Original homepage loads PostgreSQL products through API without localStorage');
    await page.getByRole('combobox', { name: 'Search products' }).fill('headphones');
    await page.getByRole('listbox').waitFor();
    await page.getByRole('combobox').press('ArrowDown');
    await page.getByRole('combobox').press('Enter');
    await page.waitForURL('**/product/airpods-max');
    pass('Keyboard search suggestions');
    await goto('/search?q=zzznomatch');
    await page.getByRole('heading', { name: 'No finds just yet.' }).waitFor();
    await goto('/search?category=Home&sort=price-desc');
    assert.equal(await page.locator('.search-grid .product-card').count(), 4);
    assert.match(await page.locator('.search-grid .product-title').first().innerText(), /blender/i);
    await page.screenshot({ path: 'test-results/orbit-search-desktop.png', fullPage: true });
    pass('Search empty state, category filters, and sorting');
    const catalog = await (
      await context.request.get(base + '/api/products?category=Home&sort=price-asc')
    ).json();
    assert.equal(catalog.products.length, 4);
    assert(catalog.products[0].price <= catalog.products[1].price);
    assert.equal((await context.request.get(base + '/api/products/not-real')).status(), 404);
    pass('Product API filtering, sorting, and missing-product status');
    await goto('/product/puma-trainers');
    await page.getByRole('button', { name: 'US 9', exact: true }).click();
    await page.getByRole('button', { name: 'Add to cart', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Added to your bag' }).waitFor();
    await page.screenshot({ path: 'test-results/orbit-product-desktop.png', fullPage: true });
    await goto('/cart');
    let cart = await (await context.request.get(base + '/api/cart')).json();
    assert.equal(cart.cart.length, 1);
    const itemId = cart.cart[0].id;
    await page
      .getByRole('button', { name: 'Increase Puma Future Rider trainers quantity' })
      .click();
    await page.waitForResponse(
      (r) => r.url().includes('/api/cart/') && r.request().method() === 'PATCH',
    );
    await page.reload({ waitUntil: 'networkidle' });
    cart = await (await context.request.get(base + '/api/cart')).json();
    assert.equal(cart.cart[0].quantity, 2);
    pass('Database cart addition and quantity persist after refresh');
    await page.getByRole('button', { name: 'Remove', exact: true }).click();
    await page.getByRole('heading', { name: 'Your next good find is waiting.' }).waitFor();
    cart = await (await context.request.get(base + '/api/cart')).json();
    assert.equal(cart.cart.length, 0);
    pass('Remove updates PostgreSQL and leaves an empty cart');
    await context.request.post(base + '/api/cart', {
      data: { productId: 'puma-trainers', variant: 'US 9', quantity: 2 },
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Save for later', exact: true }).click();
    await page.getByRole('button', { name: 'Move to cart' }).waitFor();
    await page.getByRole('button', { name: 'Move to cart' }).click();
    await page.getByRole('link', { name: 'Proceed to checkout' }).waitFor();
    await page.screenshot({ path: 'test-results/orbit-cart-desktop.png', fullPage: true });
    pass('Database save-for-later and restore');
    const isolated = await browser.newContext();
    await isolated.request.get(base + '/api/cart');
    assert.equal((await isolated.request.delete(base + '/api/cart/' + itemId)).status(), 404);
    assert.equal(
      (await (await isolated.request.get(base + '/api/orders')).json()).orders.length,
      0,
    );
    await isolated.close();
    assert.equal(
      (
        await context.request.patch(base + '/api/cart/' + itemId, { data: { quantity: 0 } })
      ).status(),
      400,
    );
    assert.equal(
      (
        await context.request.post(base + '/api/cart', {
          data: { productId: 'puma-trainers', variant: 'fake', quantity: 1 },
        })
      ).status(),
      409,
    );
    pass('Guest isolation and API input validation');
    await page.getByRole('link', { name: 'Proceed to checkout' }).click();
    await page.getByRole('button', { name: 'Continue as demo user' }).click();
    await page.getByRole('button', { name: 'Use demo address' }).click();
    await page.getByLabel('ZIP / postal code').fill('abc');
    await page.getByRole('button', { name: 'Save & continue' }).click();
    await page.getByRole('alert').filter({ hasText: '5-digit' }).waitFor();
    await page.getByLabel('ZIP / postal code').fill('97201');
    await page.screenshot({ path: 'test-results/orbit-checkout-desktop.png', fullPage: true });
    await page.getByRole('button', { name: 'Save & continue' }).click();
    await page.getByRole('radio', { name: /Express delivery/ }).click();
    await page.getByRole('button', { name: 'Review your order', exact: true }).click();
    await page.getByRole('button', { name: /Place demo order/ }).click();
    await page.waitForURL('**/order-confirmation/**');
    await page.getByRole('heading', { name: 'Good finds. Great choice.' }).waitFor();
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Good finds. Great choice.' }).waitFor();
    await page.screenshot({ path: 'test-results/orbit-confirmation-desktop.png', fullPage: true });
    const orders = await (await context.request.get(base + '/api/orders')).json();
    assert.equal(orders.orders[0].total, 137.99);
    assert.equal(orders.orders[0].items[0].quantity, 2);
    assert.equal((await (await context.request.get(base + '/api/cart')).json()).cart.length, 0);
    pass(
      'Validated checkout creates database order and line items, accurate total, clears cart, survives refresh',
    );
    await goto('/orders');
    await page.getByRole('heading', { name: 'Demo order confirmed' }).waitFor();
    pass('Order history reads created database order');
    await context.request.post(base + '/api/cart', {
      data: { productId: 'plant-pot', variant: 'Natural', quantity: 1 },
    });
    cart = await (await context.request.get(base + '/api/cart')).json();
    assert.equal(cart.cart.length, 1);
    {
      await context.request.delete(base + '/api/cart/' + cart.cart[0].id);
      assert.equal((await (await context.request.get(base + '/api/cart')).json()).cart.length, 0);
    }
    pass('API cart removal');
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 950 });
      for (const route of ['/', '/search', '/cart', '/signin', '/account', '/about', '/orders']) {
        await goto(route);
        assert(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${width} overflow: ${route}`,
        );
      }
      if (width === 360) {
        await goto('/');
        await page.screenshot({ path: 'test-results/orbit-home-mobile.png', fullPage: true });
      }
    }
    pass('Responsive routes at 360, 768, and 1440 pixels');
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const m = await mobile.newPage();
    await m.goto(base + '/product/plant-pot', { waitUntil: 'networkidle' });
    await m.getByRole('button', { name: 'Buy now', exact: true }).click();
    await m.waitForURL('**/checkout');
    await m.getByRole('button', { name: 'Continue as demo user' }).click();
    await m.getByRole('button', { name: 'Use demo address' }).click();
    await m.getByRole('button', { name: 'Save & continue' }).click();
    await m.getByRole('button', { name: 'Review your order', exact: true }).click();
    await m.getByRole('button', { name: /Place demo order/ }).click();
    await m.waitForURL('**/order-confirmation/**');
    await m.getByRole('heading', { name: 'Good finds. Great choice.' }).waitFor();
    await m.evaluate(() => {
      window.scrollTo(0, 0);
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });
    await m.screenshot({ path: 'test-results/orbit-confirmation-mobile.png', fullPage: true });
    const mo = await (await mobile.request.get(base + '/api/orders')).json();
    assert.equal(mo.orders[0].total, 28.99);
    await mobile.close();
    pass('Fresh mobile guest completes buy-now and standard-shipping checkout');
    assert.deepEqual(errors, []);
    pass('No browser runtime errors');
    fs.writeFileSync(
      'test-results/orbit-browser-results.json',
      JSON.stringify({ base, verifiedAt: new Date().toISOString(), passed, errors }, null, 2),
    );
    console.log('ALL', passed.length, 'CHECKS PASSED');
  } catch (e) {
    await page
      .screenshot({ path: 'test-results/orbit-failure.png', fullPage: true })
      .catch(() => {});
    console.error(e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
