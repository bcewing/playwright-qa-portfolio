// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page title contains Wahoo', async ({ page }) => {
    await expect(page).toHaveTitle(/Wahoo/i);
  });

  test('page loads with 200 status', async ({ page, request }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);
  });

  test('primary navigation is visible', async ({ page }) => {
    const nav = page.getByRole('navigation').first();
    await expect(nav).toBeVisible();
  });

  test('logo is visible and links to homepage', async ({ page }) => {
    // Wahoo/Magento wraps the logo in a .logo or [class*="logo"] anchor
    const logo = page.locator('[class*="logo"] a, a[href="/"]').first();
    await expect(logo).toBeVisible();
    const href = await logo.getAttribute('href');
    expect(href).toMatch(/wahoofitness\.com\/?$|^\/?$/);
  });

  test('hero section is visible', async ({ page }) => {
    // The first large section / banner on the page
    const hero = page.locator('main section').first();
    await expect(hero).toBeVisible();
  });

  test('page has at least one call-to-action button', async ({ page }) => {
    const cta = page.getByRole('link', { name: /shop|buy|learn more|explore|get started/i }).first();
    await expect(cta).toBeVisible();
  });

  test('footer is present', async ({ page }) => {
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
  });

  test('footer contains copyright text', async ({ page }) => {
    const footer = page.getByRole('contentinfo');
    await expect(footer).toContainText(/wahoo/i);
  });

  test('page has no broken images in viewport', async ({ page }) => {
    const images = await page.locator('img').all();
    for (const img of images) {
      const isVisible = await img.isVisible();
      if (!isVisible) continue;
      const naturalWidth = await img.evaluate((el) => el.naturalWidth);
      expect(naturalWidth, `Image ${await img.getAttribute('src')} failed to load`).toBeGreaterThan(0);
    }
  });
});
