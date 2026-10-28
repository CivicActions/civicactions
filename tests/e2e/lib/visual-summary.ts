import fs from 'node:fs';
import path from 'node:path';

export interface TestResultItem {
  pageId: string;
  project: string; // desktop | mobile
  status: 'match' | 'diff' | 'reference_unavailable' | 'stale';
  diffPixels?: number;
}

export function parseVisualResults(jsonPath: string): TestResultItem[] {
  if (!fs.existsSync(jsonPath)) {
    return [];
  }

  const raw = fs.readFileSync(jsonPath, 'utf8');
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }

  const items: TestResultItem[] = [];

  function traverseSuites(suite: any) {
    if (!suite) return;
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const projectName = test.projectName || 'default';
        const pageIdMatch = spec.title.match(/visual regression for ([\w-]+)/);
        const pageId = pageIdMatch ? pageIdMatch[1] : spec.title;

        const result = (test.results && test.results[0]) || {};
        let status: TestResultItem['status'] = 'match';

        if (result.status === 'skipped') {
          status = 'stale';
        } else if (result.status !== 'passed') {
          const errorMsg = (result.errors || []).map((e: any) => e.message || '').join(' ');
          if (errorMsg.includes('Snapshot comparison failed') || errorMsg.includes('Screenshot comparison failed')) {
            status = 'diff';
          } else {
            status = 'reference_unavailable';
          }
        }

        items.push({
          pageId,
          project: projectName,
          status,
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

export function formatVisualMarkdownTable(items: TestResultItem[]): string {
  if (items.length === 0) {
    return 'No visual regression comparisons were executed.';
  }

  const pagesMap = new Map<string, Record<string, string>>();
  for (const item of items) {
    if (!pagesMap.has(item.pageId)) {
      pagesMap.set(item.pageId, {});
    }
    pagesMap.get(item.pageId)![item.project] = item.status;
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

function formatStatus(status?: string): string {
  switch (status) {
    case 'match':
      return '✓ Match';
    case 'diff':
      return '⚠️ Difference';
    case 'reference_unavailable':
      return '❓ Reference Unavailable';
    case 'stale':
      return 'ℹ️ Stale (Reference 404)';
    default:
      return '-';
  }
}
