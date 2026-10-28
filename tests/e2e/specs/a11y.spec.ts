import { test, expect, settle } from '../fixtures/site.js';
import { getPages } from '../lib/pages.js';
import { loadKnownA11yIssues, filterAxeViolations, GLOBAL_A11Y_EXCLUDES } from '../lib/a11y.js';
import AxeBuilder from '@axe-core/playwright';

const pages = getPages();
const knownIssues = loadKnownA11yIssues();

for (const pageEntry of pages) {
  // Only test accessibility on 200 pages
  if (pageEntry.expect_status && pageEntry.expect_status !== 200) {
    continue;
  }

  test(`[@a11y] check accessibility on ${pageEntry.id} (${pageEntry.path})`, async ({
    sitePage,
  }, testInfo) => {
    await sitePage.goto(pageEntry.path, { waitUntil: 'domcontentloaded' });
    await settle(sitePage);

    let builder = new AxeBuilder({ page: sitePage })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']);

    for (const excludeSel of GLOBAL_A11Y_EXCLUDES) {
      builder = builder.exclude(excludeSel);
    }

    if (pageEntry.a11y_exclude) {
      for (const sel of pageEntry.a11y_exclude) {
        builder = builder.exclude(sel);
      }
    }

    const results = await builder.analyze();

    // Filter to serious and critical violations
    const seriousOrCritical = results.violations.filter((v) =>
      ['serious', 'critical'].includes(v.impact || '')
    );

    const unexpectedViolations = filterAxeViolations(seriousOrCritical, knownIssues);

    if (unexpectedViolations.length > 0) {
      await testInfo.attach('axe-violations.json', {
        body: JSON.stringify(unexpectedViolations, null, 2),
        contentType: 'application/json',
      });
    }

    expect(unexpectedViolations, `Found serious/critical a11y violations on ${pageEntry.path}`).toEqual([]);
  });
}
