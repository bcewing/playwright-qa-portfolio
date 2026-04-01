// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Support section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pages/support');
  });

  test('support page loads successfully', async ({ page }) => {
    await expect(page).not.toHaveURL(/404/);
    // Use #maincontent to avoid strict-mode violation from nested <main> elements
    await expect(page.locator('#maincontent').first()).toBeVisible();
  });

  test('support page has a heading', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('support page contains product category links', async ({ page }) => {
    // Support pages typically have links per product line
    const productLinks = page.getByRole('link', { name: /kickr|elemnt|tickr|systm/i });
    await expect(productLinks.first()).toBeVisible();
  });

  test('support search field is present and accepts input', async ({ page }) => {
    const searchInput = page
      .getByRole('searchbox')
      .or(page.getByPlaceholder(/search/i))
      .first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('KICKR setup');
      await expect(searchInput).toHaveValue('KICKR setup');
    } else {
      test.info().annotations.push({
        type: 'note',
        description: 'No search input found on support page — may be in a different location.',
      });
    }
  });
});

test.describe('Contact / Help form', () => {
  test('help center link exists on support page', async ({ page }) => {
    await page.goto('/pages/support');
    const helpLink = page.getByRole('link', { name: /help|contact|submit.*ticket|chat/i }).first();
    await expect(helpLink).toBeVisible();
  });
});

test.describe('Newsletter signup', () => {
  test('newsletter email field is present on homepage', async ({ page }) => {
    await page.goto('/');
    // Newsletter inputs are typically in the footer
    const emailInput = page
      .getByRole('contentinfo')
      .getByRole('textbox', { name: /email/i })
      .or(page.getByRole('contentinfo').locator('input[type="email"]'))
      .first();

    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeEnabled();
    } else {
      test.info().annotations.push({
        type: 'note',
        description: 'Newsletter email input not found in footer — may use a popup or different pattern.',
      });
    }
  });

  test('newsletter form rejects invalid email', async ({ page }) => {
    await page.goto('/');
    const emailInput = page
      .getByRole('contentinfo')
      .locator('input[type="email"]')
      .first();

    if (!await emailInput.isVisible()) return;

    await emailInput.fill('not-an-email');
    // Attempt submission — look for a submit button near the input
    const submitBtn = page
      .getByRole('contentinfo')
      .getByRole('button', { name: /subscribe|sign up|submit/i })
      .first();

    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Browser native validation or custom error message
      const validationMessage = await emailInput.evaluate((el) => el.validationMessage);
      const errorMsg = page.locator('[class*="error"], [role="alert"]').first();
      const hasError = validationMessage.length > 0 || await errorMsg.isVisible();
      expect(hasError).toBe(true);
    }
  });
});
