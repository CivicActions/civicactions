import { test as base, Page } from '@playwright/test';

const BLOCKED_HOST_PATTERNS = [
  'googletagmanager.com',
  'google-analytics.com',
  'analytics.google.com',
  'hotjar.com',
  'clarity.ms',
  'friendlycaptcha.com',
];

const BOT_BYPASS_TOKEN = process.env.PANTHEON_BOT_BYPASS_TOKEN || '';

/**
 * Returns the Pantheon bot bypass header for platform-domain URLs.
 *
 * Pantheon's Cloudflare-based Global CDN challenges headless browsers on
 * *.pantheonsite.io. The token is only sent to Pantheon hosts, never to
 * third parties.
 */
export function pantheonHeaders(url: string): Record<string, string> {
  if (!BOT_BYPASS_TOKEN) {
    return {};
  }
  try {
    return new URL(url).hostname.endsWith('.pantheonsite.io')
      ? { 'x-pantheon-bot-bypass': BOT_BYPASS_TOKEN }
      : {};
  } catch {
    return {};
  }
}

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
    // 1. Block analytics and third-party trackers; add the bot bypass header
    // for Pantheon hosts.
    await page.route('**/*', (route) => {
      const request = route.request();
      const url = request.url();
      if (BLOCKED_HOST_PATTERNS.some((pattern) => url.includes(pattern))) {
        return route.abort();
      }
      const extraHeaders = pantheonHeaders(url);
      if (Object.keys(extraHeaders).length) {
        return route.continue({ headers: { ...request.headers(), ...extraHeaders } });
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
          // Skips Pantheon's "Sandbox Environment Notice" interstitial, which
          // sets this cookie when a visitor clicks Continue.
          {
            name: 'Deterrence-Bypass',
            value: '1',
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
