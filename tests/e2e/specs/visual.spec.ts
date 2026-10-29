import { test, expect, settle } from '../fixtures/site.js';
import { getPages } from '../lib/pages.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const visualHideCssPath = path.resolve(__dirname, '../visual-hide.css');

const visualPages = getPages({ visual: true });

for (const pageEntry of visualPages) {
  test(`[@visual] visual regression for ${pageEntry.id} (${pageEntry.path})`, async ({
    sitePage,
  }) => {
    await sitePage.goto(pageEntry.path, { waitUntil: 'domcontentloaded' });
    await settle(sitePage);

    // Locate masks specified in pages.yml
    const maskLocators = (pageEntry.masks || []).map((selector) =>
      sitePage.locator(selector)
    );

    await expect(sitePage).toHaveScreenshot(`${pageEntry.id}.png`, {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.001,
      stylePath: visualHideCssPath,
      mask: maskLocators,
    });
  });
}
