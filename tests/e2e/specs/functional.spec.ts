import { test, expect, settle } from '../fixtures/site.js';
import { getPages } from '../lib/pages.js';

const pages = getPages();
const REF_URL = process.env.REF_URL || '';

for (const pageEntry of pages) {
  const tags = pageEntry.smoke ? ['@functional', '@smoke'] : ['@functional'];

  test(`[${tags.join(' ')}] verify ${pageEntry.id} (${pageEntry.path})`, async ({
    sitePage,
    pageErrors,
    request,
  }) => {
    const response = await sitePage.goto(pageEntry.path, {
      waitUntil: 'domcontentloaded',
    });

    const status = response ? response.status() : 0;
    const expectedStatus = pageEntry.expect_status ?? 200;

    // Check if status matches expected
    if (status !== expectedStatus) {
      // If reference URL is provided and target status is unexpected (e.g. 404),
      // check if reference URL also returns 404
      if (REF_URL && status === 404) {
        try {
          const refRes = await request.get(`${REF_URL}${pageEntry.path}`);
          if (refRes.status() === 404) {
            test.skip(true, `page list out of date: ${pageEntry.id} (${pageEntry.path} returns 404 on reference)`);
            return;
          }
        } catch {
          // Fall through to failure
        }
      }
      expect(status).toBe(expectedStatus);
    }

    if (expectedStatus === 200) {
      await settle(sitePage);

      // Verify essential page shell elements
      const mainContent = sitePage.locator('main, role=main, #main-content');
      await expect(mainContent.first()).toBeVisible();

      const header = sitePage.locator('header, role=banner, .header');
      await expect(header.first()).toBeVisible();

      const footer = sitePage.locator('footer, role=contentinfo, .footer');
      await expect(footer.first()).toBeVisible();

      // Heading / title present
      const heading = sitePage.locator('h1, .page-title, title');
      expect(await heading.count()).toBeGreaterThan(0);
    }

    // Verify no fatal page script errors
    expect(pageErrors).toEqual([]);
  });
}
