const { chromium } = require('playwright');
const { default: AxeBuilder } = require('@axe-core/playwright');
const fs = require('node:fs');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const report = [];
  const audit = async (route) => {
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    report.push({
      route,
      violations: result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
    });
  };
  try {
    for (const route of ['/', '/search', '/product/puma-trainers', '/signin']) {
      await page.goto(base + route, { waitUntil: 'networkidle', timeout: 60000 });
      await audit(route);
    }
    await page.goto(base + '/product/plant-pot', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Add to cart', exact: true }).click();
    await page.goto(base + '/cart', { waitUntil: 'networkidle' });
    await audit('/cart (populated)');
    await page.getByRole('link', { name: 'Proceed to checkout' }).click();
    await page.getByRole('button', { name: 'Continue as demo user' }).click();
    await page.getByRole('button', { name: 'Use demo address' }).click();
    await audit('/checkout (address)');
    await page.getByRole('button', { name: 'Save & continue' }).click();
    await audit('/checkout (shipping and payment)');
    await page.getByRole('button', { name: 'Review your order', exact: true }).click();
    await audit('/checkout (review)');
    await page.getByRole('button', { name: 'Place demo order · $28.99', exact: true }).click();
    await page.waitForURL('**/order-confirmation/**');
    await page.getByRole('heading', { name: 'Good finds. Great choice.' }).waitFor();
    await audit('/order-confirmation (saved order)');
    for (const route of ['/orders', '/account', '/about']) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      await audit(route);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of ['/', '/search', '/product/puma-trainers', '/orders']) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      await audit(`${route} (mobile)`);
    }
    fs.mkdirSync('test-results', { recursive: true });
    fs.writeFileSync('test-results/accessibility.json', JSON.stringify(report, null, 2));
    console.log(
      JSON.stringify(
        report.map((r) => ({
          route: r.route,
          violations: r.violations.map((v) => ({ id: v.id, count: v.nodes.length })),
        })),
        null,
        2,
      ),
    );
    if (report.some((r) => r.violations.length)) process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
