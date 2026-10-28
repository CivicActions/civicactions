import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface PageEntry {
  id: string;
  path: string;
  kind: string;
  smoke?: boolean;
  visual?: boolean;
  expect_status?: number;
  masks?: string[];
  a11y_exclude?: string[];
}

export interface PagesFilter {
  smoke?: boolean;
  visual?: boolean;
}

export function loadPages(): PageEntry[] {
  const pagesFilePath = path.resolve(__dirname, '../pages.yml');
  const fileContent = fs.readFileSync(pagesFilePath, 'utf8');
  const data = YAML.parse(fileContent) as { pages: PageEntry[] };

  if (!data || !Array.isArray(data.pages)) {
    throw new Error('Invalid pages.yml structure: missing "pages" array');
  }

  const ids = new Set<string>();
  let hasSmoke = false;
  let hasSmokeFront = false;
  let hasSmokeNode = false;

  for (const page of data.pages) {
    if (!page.id || ids.has(page.id)) {
      throw new Error(`Duplicate or missing id in pages.yml: ${page.id}`);
    }
    ids.add(page.id);

    if (!page.path || !page.path.startsWith('/')) {
      throw new Error(`Invalid path for page ${page.id}: must start with "/"`);
    }

    page.expect_status = page.expect_status ?? 200;
    page.smoke = !!page.smoke;
    page.visual = page.visual !== false;
    page.masks = page.masks || [];
    page.a11y_exclude = page.a11y_exclude || [];

    if (page.smoke) {
      hasSmoke = true;
      if (page.kind === 'front') hasSmokeFront = true;
      if (page.kind.startsWith('node:')) hasSmokeNode = true;
    }
  }

  if (!hasSmoke || !hasSmokeFront || !hasSmokeNode) {
    console.warn('Warning: smoke page set should include front page and at least one node page');
  }

  return data.pages;
}

export function getPages(filter?: PagesFilter): PageEntry[] {
  const pages = loadPages();
  if (!filter) return pages;

  return pages.filter((page) => {
    if (filter.smoke !== undefined && page.smoke !== filter.smoke) {
      return false;
    }
    if (filter.visual !== undefined && page.visual !== filter.visual) {
      return false;
    }
    return true;
  });
}
