// Decides the ci/visual status from the visual comparison results, and records
// and finds /approve-visual approvals. Approvals are keyed to the head commit's
// git tree, so they survive commits that change no files (recreate, content
// refresh) and reset when the code changes.
//
// CLI (used by pr-review-env.yml and review-env-commands.yml):
//   node visual-status.mjs decide --results <results.json> [--approval <json>] [--content-stale]
//   node visual-status.mjs marker --tree <sha> --head <sha> --by <login>
//   gh api --paginate --slurp repos/<repo>/issues/<pr>/comments \
//     | node visual-status.mjs find-approval --tree <sha> --bot <login>
import fs from 'node:fs';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { parseVisualResults } from '../../tests/e2e/lib/visual-summary.mjs';

const MARKER = 'ci:visual-approval';

export function countResults(items) {
  const counts = { total: items.length, diff: 0, unavailable: 0 };
  for (const item of items) {
    if (item.status === 'diff') counts.diff++;
    if (item.status === 'reference_unavailable' || item.status === 'error') counts.unavailable++;
  }
  return counts;
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * @param items Parsed visual results (parseVisualResults).
 * @param approval Approval for this code ({ by }), or null.
 * @param contentStale Whether the environment's content predates dev's.
 * @returns {{ state: string, description: string }} for the ci/visual status.
 */
export function decideVisualStatus({ items, approval = null, contentStale = false }) {
  const { total, diff, unavailable } = countResults(items);
  if (total === 0) {
    return { state: 'error', description: 'No visual results: comment /rerun-review-env' };
  }
  if (diff === 0 && unavailable === 0) {
    return { state: 'success', description: `No visual differences (${plural(total, 'screenshot')})` };
  }
  if (approval) {
    return { state: 'success', description: `Approved by @${approval.by} for this code (${plural(diff, 'difference')})` };
  }
  if (diff === 0) {
    return {
      state: 'error',
      description: `${plural(unavailable, 'screenshot')} not compared (dev unavailable?): comment /rerun-review-env`,
    };
  }
  const differ = `${plural(diff, 'screenshot')} ${diff === 1 ? 'differs' : 'differ'}`;
  if (contentStale) {
    return { state: 'failure', description: `${differ}; content older than dev: /refresh-content or /approve-visual` };
  }
  return { state: 'failure', description: `${differ}: if expected, comment /approve-visual` };
}

export function approvalMarker({ tree, head, by }) {
  return `<!-- ${MARKER} ${JSON.stringify({ tree, head, by })} -->`;
}

/**
 * Returns the latest approval for a tree from comments the CI app posted, or
 * null. Markers in anyone else's comments are ignored.
 */
export function findApproval(comments, { tree, botLogin }) {
  const pattern = new RegExp(`<!-- ${MARKER} (\\{.*?\\}) -->`);
  let found = null;
  for (const comment of comments) {
    if (comment.user?.login !== botLogin) continue;
    const match = pattern.exec(comment.body || '');
    if (!match) continue;
    let approval;
    try {
      approval = JSON.parse(match[1]);
    } catch {
      continue;
    }
    if (approval.tree === tree) found = approval;
  }
  return found;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, ...rest] = process.argv.slice(2);
  const { values } = parseArgs({
    args: rest,
    options: {
      results: { type: 'string' },
      approval: { type: 'string' },
      'content-stale': { type: 'boolean', default: false },
      tree: { type: 'string' },
      head: { type: 'string' },
      by: { type: 'string' },
      bot: { type: 'string' },
    },
  });
  if (command === 'decide') {
    const items = parseVisualResults(values.results);
    const approval = values.approval ? JSON.parse(values.approval) : null;
    console.log(JSON.stringify(decideVisualStatus({ items, approval, contentStale: values['content-stale'] })));
  } else if (command === 'marker') {
    console.log(approvalMarker({ tree: values.tree, head: values.head, by: values.by }));
  } else if (command === 'find-approval') {
    // `gh api --paginate --slurp` gives an array of pages.
    const comments = JSON.parse(fs.readFileSync(0, 'utf8')).flat();
    const approval = findApproval(comments, { tree: values.tree, botLogin: values.bot });
    if (approval) console.log(JSON.stringify(approval));
  } else {
    console.error('Usage: visual-status.mjs decide|marker|find-approval ...');
    process.exit(2);
  }
}
