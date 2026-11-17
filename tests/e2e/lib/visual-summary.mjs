import fs from 'node:fs';
import path from 'node:path';

export function parseVisualResults(jsonPath) {
  if (!fs.existsSync(jsonPath)) {
    return [];
  }

  const raw = fs.readFileSync(jsonPath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }

  const items = [];

  function traverseSuites(suite) {
    if (!suite) return;
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const projectName = test.projectName || 'default';
        const pageIdMatch = spec.title.match(/visual regression for ([\w-]+)/);
        if (!pageIdMatch) {
          // results.json may hold functional/a11y results if visual tests didn't run.
          continue;
        }
        const pageId = pageIdMatch[1];

        // With retries, the last attempt is the outcome.
        const results = test.results || [];
        const result = results[results.length - 1] || {};

        items.push({
          pageId,
          project: projectName,
          status: classifyResult(result),
        });
      }
    }

    for (const childSuite of suite.suites || []) {
      traverseSuites(childSuite);
    }
  }

  for (const rootSuite of data.suites || []) {
    traverseSuites(rootSuite);
  }

  return items;
}

export function classifyResult(result) {
  if (result.status === 'passed') {
    return 'match';
  }
  if (result.status === 'skipped') {
    return 'stale';
  }
  const errorMsg = (result.errors || []).map((e) => e.message || '').join(' ');
  if (/snapshot doesn't exist/i.test(errorMsg)) {
    return 'reference_unavailable';
  }
  // Current Playwright reports "expect(page).toHaveScreenshot(expected) failed";
  // older versions said "Screenshot comparison failed".
  if (/toHaveScreenshot|screenshot comparison failed|snapshot comparison failed/i.test(errorMsg)) {
    return 'diff';
  }
  return 'error';
}

export function formatVisualMarkdownTable(items) {
  if (items.length === 0) {
    return 'No visual regression comparisons were executed.';
  }

  const pagesMap = new Map();
  for (const item of items) {
    if (!pagesMap.has(item.pageId)) {
      pagesMap.set(item.pageId, {});
    }
    pagesMap.get(item.pageId)[item.project] = item.status;
  }

  let table = '| Page | Desktop (1440px) | Mobile (390px) |\n';
  table += '|------|------------------|----------------|\n';

  for (const [pageId, statuses] of pagesMap.entries()) {
    const desktopStatus = formatStatus(statuses['desktop']);
    const mobileStatus = formatStatus(statuses['mobile']);
    table += `| \`${pageId}\` | ${desktopStatus} | ${mobileStatus} |\n`;
  }

  return table;
}

function formatStatus(status) {
  switch (status) {
    case 'match':
      return '✓ Match';
    case 'diff':
      return '⚠️ Difference';
    case 'reference_unavailable':
      return '❓ Reference Unavailable';
    case 'error':
      return '❌ Error';
    case 'stale':
      return 'ℹ️ Stale (Reference 404)';
    default:
      return '-';
  }
}
