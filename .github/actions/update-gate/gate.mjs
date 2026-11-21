// Computes the required ci/gate status from the PR checks it combines, and
// posts it. Usage: node gate.mjs <sha> (GH_TOKEN and REPO in the environment).
import { pathToFileURL } from 'node:url';

export const GATED_CONTEXTS = [
  ['ci/static', 'static'],
  ['ci/review-env', 'review-env'],
  ['ci/visual', 'visual'],
];

/**
 * @param statuses Map of status context to state (success, failure, error,
 *   pending); missing contexts count as pending.
 */
export function computeGate(statuses) {
  const states = GATED_CONTEXTS.map(([context, label]) => [label, statuses[context] || 'pending']);
  const summary = states.map(([label, state]) => `${label}: ${state}`).join(', ');
  if (states.every(([, state]) => state === 'success')) {
    return { state: 'success', description: states.map(([label]) => `${label} ✓`).join(' ') };
  }
  if (states.some(([, state]) => state === 'failure' || state === 'error')) {
    return { state: 'failure', description: summary };
  }
  return { state: 'pending', description: `Waiting: ${summary}` };
}

async function api(path, options = {}) {
  const response = await fetch(`https://api.github.com/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'civicactions-gate',
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API ${path}: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

export async function updateGate(repo, sha) {
  // The combined status lists the latest state of each context.
  const combined = await api(`repos/${repo}/commits/${sha}/status?per_page=100`);
  const statuses = Object.fromEntries(combined.statuses.map((s) => [s.context, s.state]));
  const gate = computeGate(statuses);
  await api(`repos/${repo}/statuses/${sha}`, {
    method: 'POST',
    body: JSON.stringify({ context: 'ci/gate', ...gate }),
  });
  console.log(`Updated ci/gate on ${sha.slice(0, 8)} to ${gate.state} (${gate.description})`);
  return gate;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const sha = process.argv[2];
  if (!sha || !process.env.REPO || !process.env.GH_TOKEN) {
    console.error('Usage: GH_TOKEN=... REPO=owner/name node gate.mjs <sha>');
    process.exit(2);
  }
  await updateGate(process.env.REPO, sha);
}
