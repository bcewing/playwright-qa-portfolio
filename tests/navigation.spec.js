// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('clicking the logo returns to homepage', async ({ page }) => {
    await page.goto('/pages/support');
    const logo = page.locator('[class*="logo"] a, a[href="/"]').first();
    await logo.click();
    await expect(page).toHaveURL(/wahoofitness\.com\/?$|^\/?$/);
  });

  test('Products nav link is visible', async ({ page }) => {
    const productsLink = page
      .getByRole('navigation')
      .getByRole('link', { name: /products/i })
      .first();
    await expect(productsLink).toBeVisible();
  });

  test('clicking Products navigates to a products page', async ({ page }) => {
    const productsLink = page
      .getByRole('navigation')
      .getByRole('link', { name: /products/i })
      .first();
    await productsLink.click();
    await expect(page).not.toHaveURL('about:blank');
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('a support or help link exists somewhere on the page', async ({ page }) => {
    // Wahoo's support link may be in the footer or secondary nav rather than the primary nav
    const supportLink = page.getByRole('link', { name: /support|help/i }).first();
    await expect(supportLink).toBeVisible();
  });

  test('navigating to the support link reaches a support page', async ({ page }) => {
    const supportLink = page.getByRole('link', { name: /support|help/i }).first();
    const href = await supportLink.getAttribute('href');
    if (href) {
      const url = href.startsWith('http') ? href : `https://www.wahoofitness.com${href}`;
      const response = await page.goto(url);
      expect(response?.status()).toBeLessThan(400);
    }
  });

  test('internal nav links do not 404', async ({ page, request }) => {
    // Collect nav hrefs, check only internal wahoofitness.com links
    const navLinks = await page
      .getByRole('navigation')
      .getByRole('link')
      .all();

    const checked = new Set();
    const failures = [];
    const MAX_LINKS = 15; // cap to avoid test timeout on large nav sets

    for (const link of navLinks) {
      if (checked.size >= MAX_LINKS) break;

      const href = await link.getAttribute('href');
      if (!href || checked.has(href) || href.startsWith('#') || href.startsWith('mailto')) continue;

      // Skip links to other domains or Zendesk-hosted subdomains (bot protection returns 403)
      const isExternal = href.startsWith('http') && !href.includes('wahoofitness.com');
      const isZendesk = href.includes('support.wahoofitness.com');
      if (isExternal || isZendesk) continue;

      checked.add(href);
      const url = href.startsWith('http') ? href : `https://www.wahoofitness.com${href}`;

      try {
        const response = await request.get(url, { maxRedirects: 5, timeout: 8000 });
        if (response.status() >= 400) {
          failures.push(`${href} → HTTP ${response.status()}`);
        }
      } catch {
        // Network-level errors (timeout, DNS) are not counted as 404s
      }
    }

    expect(failures, `Broken nav links:\n${failures.join('\n')}`).toHaveLength(0);
  });

  test('mobile hamburger menu opens on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Look for a hamburger/menu toggle button
    const menuButton = page.getByRole('button', { name: /menu|nav|open/i }).first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      // After opening, at least one nav link should be visible
      const navLink = page.getByRole('navigation').getByRole('link').first();
      await expect(navLink).toBeVisible();
    } else {
      // Nav may already be visible at this viewport — just assert it exists
      const nav = page.getByRole('navigation').first();
      await expect(nav).toBeVisible();
    }
  });
});
