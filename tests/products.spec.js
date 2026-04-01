// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Wahoo's core product lines: KICKR, ELEMNT, TICKR, SYSTM.
 *
 * URL structure discovered from live site: /devices/[category]/[subcategory]/[slug]
 * e.g. /devices/indoor-cycling/smart-bikes/kickr-bike-pro-buy
 *
 * KICKR/ELEMNT/TICKR links live in a mega-menu flyout — visible in the DOM but
 * not on-screen without hovering. Discovery tests collect these hrefs from the DOM
 * and navigate to them directly rather than trying to interact with the flyout.
 */

const KICKR_PRODUCT_URL = '/devices/indoor-cycling/smart-bikes/kickr-bike-pro-buy';

test.describe('Product discovery via page links', () => {
  test('KICKR product links are present in the page DOM', async ({ page }) => {
    await page.goto('/');
    // Links exist in the mega-menu even when the flyout is closed
    const kickrLinks = page.locator('a[href*="kickr"]');
    await expect(kickrLinks.first()).toBeAttached();
    expect(await kickrLinks.count()).toBeGreaterThan(0);
  });

  test('ELEMNT product links are present in the page DOM', async ({ page }) => {
    await page.goto('/');
    const elemntLinks = page.locator('a[href*="elemnt"]');
    await expect(elemntLinks.first()).toBeAttached();
  });

  test('TICKR product links are present in the page DOM', async ({ page }) => {
    await page.goto('/');
    const tickrLinks = page.locator('a[href*="tickr"]');
    await expect(tickrLinks.first()).toBeAttached();
  });

  test('KICKR product page linked from homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    const kickrLink = page.locator('a[href*="kickr"]').first();
    const href = await kickrLink.getAttribute('href');
    expect(href).toBeTruthy();

    const url = href.startsWith('http') ? href : `https://www.wahoofitness.com${href}`;
    // Use domcontentloaded — Wahoo product pages have heavy JS that can delay networkidle
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('product listing page shows product images', async ({ page }) => {
    await page.goto('/');
    const kickrLink = page.locator('a[href*="kickr"]').first();
    const href = await kickrLink.getAttribute('href');
    await page.goto(href.startsWith('http') ? href : `https://www.wahoofitness.com${href}`);

    const productImage = page.locator('img').first();
    await expect(productImage).toBeVisible();
    const naturalWidth = await productImage.evaluate((el) => el.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });
});

test.describe('Product detail page', () => {
  test.beforeEach(async ({ page }) => {
    // domcontentloaded is faster and sufficient — Magento lazy-loads prices via JS
    await page.goto(KICKR_PRODUCT_URL, { waitUntil: 'domcontentloaded' });
  });

  test('product detail page has a heading', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('product detail page displays a price', async ({ page }) => {
    // Magento lazy-loads prices via JS — use getByText to find any visible price,
    // regardless of the class name or element type
    const price = page.getByText(/\$[\d,]+/).first();
    await expect(price).toBeVisible({ timeout: 15_000 });
    const text = await price.textContent();
    expect(text).toMatch(/\$[\d,]+/);
  });

  test('product detail page has at least one image', async ({ page }) => {
    // Images may live outside <main> in a gallery or slider component
    const productImage = page.locator('img').first();
    await expect(productImage).toBeVisible();
    const naturalWidth = await productImage.evaluate((el) => el.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test('product detail page has an add-to-cart or buy action', async ({ page }) => {
    // Magento: button.tocart or button[title*="Add to Cart"]
    // Wahoo may also use "Buy Now", "Find a Retailer", or similar CTAs
    const buyAction = page
      .locator('button.tocart, button[title*="Add to Cart"]')
      .or(page.getByRole('button', { name: /add to cart|buy now/i }))
      .or(page.getByRole('link', { name: /buy now|find a retailer|shop now/i }))
      .first();
    await expect(buyAction).toBeVisible();
  });

  test('product detail page has descriptive content', async ({ page }) => {
    // Find any visible paragraph with substantive text — product pages always have copy
    const description = page
      .locator('p, li')
      .filter({ hasText: /.{40,}/ })
      .first();
    await expect(description).toBeVisible();
  });
});
