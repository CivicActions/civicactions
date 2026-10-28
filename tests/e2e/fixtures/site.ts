import { test as base, Page } from '@playwright/test';

const BLOCKED_HOST_PATTERNS = [
  'googletagmanager.com',
  'google-analytics.com',
  'analytics.google.com',
  'hotjar.com',
  'clarity.ms',
  'friendlycaptcha.com',
];

export async function settle(page: Page): Promise<void> {
  // 1. Wait for document fonts to load
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  });

  // 2. Scroll to bottom and back to trigger lazy-loaded images/components
  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight / 2);
    await new Promise((r) => setTimeout(r, 100));
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 100));
    window.scrollTo(0, 0);
  });

  // 3. Brief wait for DOM transitions and animations
  await page.waitForTimeout(300);
}

export interface SiteFixtures {
  sitePage: Page;
  pageErrors: Error[];
}

export const test = base.extend<SiteFixtures>({
  pageErrors: async ({}, use) => {
    const errors: Error[] = [];
    await use(errors);
  },
  sitePage: async ({ page, pageErrors, context, baseURL }, use) => {
    // 1. Block analytics and third-party trackers
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (BLOCKED_HOST_PATTERNS.some((pattern) => url.includes(pattern))) {
        return route.abort();
      }
      return route.continue();
    });

    // 2. Pre-set Klaro consent cookie if baseURL is available
    if (baseURL) {
      try {
        const parsed = new URL(baseURL);
        await context.addCookies([
          {
            name: 'klaro',
            value: encodeURIComponent(JSON.stringify({ default: true, analytics: false })),
            domain: parsed.hostname,
            path: '/',
          },
        ]);
      } catch {
        // Ignore invalid URL
      }
    }

    // 3. Catch console errors / uncaught page errors
    page.on('pageerror', (err) => {
      // Ignore benign external or font errors
      pageErrors.push(err);
    });

    await use(page);
  },
});

export { expect } from '@playwright/test';
