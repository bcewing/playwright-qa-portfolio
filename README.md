# Playwright QA Portfolio

A Playwright test suite targeting [wahoofitness.com](https://www.wahoofitness.com) as a portfolio demonstration of end-to-end QA automation techniques.

## Test coverage

| Suite | File | What it tests |
|---|---|---|
| Homepage | `tests/homepage.spec.js` | Page title, logo, nav, hero, footer, broken image detection |
| Navigation | `tests/navigation.spec.js` | Nav link visibility, click-through, 404 link scan, mobile hamburger menu |
| Products | `tests/products.spec.js` | KICKR/ELEMNT/TICKR collection pages, product detail (price, images, add-to-cart) |
| Support & Forms | `tests/support.spec.js` | Support page structure, help links, newsletter form validation |

## Prerequisites

- Node.js 18+
- Playwright browsers

```bash
npm install
npx playwright install
```

## Running tests

```bash
# Run all tests across all configured browsers (headless)
npm test

# Run only on Chromium (fastest for iteration)
npm run test:chromium

# Run with the browser visible
npm run test:headed

# Step through tests in the Playwright debugger
npm run test:debug

# Open the HTML report from the last run
npm run report
```

## Project structure

```
playwright-qa-portfolio/
├── playwright.config.js   # Browser projects, base URL, timeouts, reporters
└── tests/
    ├── homepage.spec.js
    ├── navigation.spec.js
    ├── products.spec.js
    └── support.spec.js
```

## Browser matrix

Tests run against three browser projects defined in `playwright.config.js`:

| Project | Device |
|---|---|
| `chromium` | Desktop Chrome |
| `firefox` | Desktop Firefox |
| `mobile-chrome` | Pixel 5 (390×844) |

## Key techniques demonstrated

- **Role-based selectors** (`getByRole`, `getByPlaceholder`) for resilient, accessibility-aligned locators
- **API-level assertions** alongside UI checks (e.g., the nav 404 scan uses `request.get()`)
- **Broken image detection** via `img.naturalWidth` evaluation
- **Conditional test logic** with `test.info().annotations` to annotate rather than hard-fail when optional elements are absent
- **Parallel execution** with `fullyParallel: true` and per-test isolation
- **Failure artifacts** — screenshots and videos are captured automatically on failure; traces are kept on retry

## Configuration

All settings live in `playwright.config.js`. Notable defaults:

| Setting | Value |
|---|---|
| Base URL | `https://www.wahoofitness.com` |
| Test timeout | 30 seconds |
| Assertion timeout | 10 seconds |
| Retries | 1 (CI-friendly) |
| Reporter | HTML + list |
