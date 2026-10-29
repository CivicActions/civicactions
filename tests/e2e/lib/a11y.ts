import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import type { Result } from 'axe-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface KnownA11yIssue {
  id: string;
  rule: string;
  selector?: string;
  issue: string;
  expires: string; // YYYY-MM-DD
}

export const GLOBAL_A11Y_EXCLUDES = [
  '.klaro',
  '#klaro',
  'deep-chat',
  '.deep-chat',
  '#deep-chat',
];

export function loadKnownA11yIssues(): KnownA11yIssue[] {
  const filePath = path.resolve(__dirname, '../a11y-known-issues.yml');
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const data = YAML.parse(content) as { known_issues?: KnownA11yIssue[] };
  const issues = data?.known_issues || [];

  const today = new Date().toISOString().split('T')[0];
  for (const issue of issues) {
    if (issue.expires && issue.expires < today) {
      throw new Error(
        `Accessibility known-issue "${issue.id}" (${issue.rule}) expired on ${issue.expires} (ticket: ${issue.issue}). Must be resolved.`
      );
    }
  }

  return issues;
}

export function filterAxeViolations(violations: Result[], knownIssues: KnownA11yIssue[]): Result[] {
  return violations
    .map((v) => {
      const remainingNodes = v.nodes.filter((node) => {
        const isKnown = knownIssues.some((known) => {
          if (known.rule !== v.id) return false;
          if (!known.selector) return true;
          return node.target.some((target) => {
            const selectorStr = Array.isArray(target) ? target.join(' ') : String(target);
            return selectorStr.includes(known.selector!);
          });
        });
        return !isKnown;
      });

      return {
        ...v,
        nodes: remainingNodes,
      };
    })
    .filter((v) => v.nodes.length > 0);
}
