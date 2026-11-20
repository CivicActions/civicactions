import test from 'node:test';
import assert from 'node:assert/strict';
import { computeGate } from '../../actions/update-gate/gate.mjs';
import { approvalMarker, decideVisualStatus, findApproval } from '../visual-status.mjs';

const item = (status, pageId = 'home', project = 'desktop') => ({ pageId, project, status });

test('computeGate: success needs static, review-env and visual', () => {
  assert.equal(
    computeGate({ 'ci/static': 'success', 'ci/review-env': 'success', 'ci/visual': 'success' }).state,
    'success',
  );
  const waiting = computeGate({ 'ci/static': 'success', 'ci/review-env': 'success' });
  assert.equal(waiting.state, 'pending');
  assert.match(waiting.description, /visual: pending/);
});

test('computeGate: any failure or error fails the gate', () => {
  assert.equal(computeGate({ 'ci/static': 'success', 'ci/review-env': 'success', 'ci/visual': 'failure' }).state, 'failure');
  assert.equal(computeGate({ 'ci/static': 'error', 'ci/review-env': 'pending' }).state, 'failure');
});

test('decideVisualStatus: no differences passes', () => {
  assert.deepEqual(decideVisualStatus({ items: [item('match'), item('match', 'home', 'mobile')] }), {
    state: 'success',
    description: 'No visual differences (2 screenshots)',
  });
});

test('decideVisualStatus: differences fail until approved', () => {
  const items = [item('diff'), item('match', 'home', 'mobile')];
  const failed = decideVisualStatus({ items });
  assert.equal(failed.state, 'failure');
  assert.match(failed.description, /^1 screenshot differs:.*\/approve-visual/);
  const approved = decideVisualStatus({ items, approval: { by: 'octocat' } });
  assert.equal(approved.state, 'success');
  assert.match(approved.description, /@octocat/);
});

test('decideVisualStatus: stale content suggests /refresh-content', () => {
  const { state, description } = decideVisualStatus({ items: [item('diff')], contentStale: true });
  assert.equal(state, 'failure');
  assert.match(description, /\/refresh-content/);
});

test('decideVisualStatus: uncompared screenshots are an error, and no results too', () => {
  const unavailable = decideVisualStatus({ items: [item('reference_unavailable'), item('error', 'about')] });
  assert.equal(unavailable.state, 'error');
  assert.match(unavailable.description, /^2 screenshots not compared.*\/rerun-review-env/);
  assert.equal(decideVisualStatus({ items: [] }).state, 'error');
  // An approval doesn't cover a run with no results.
  assert.equal(decideVisualStatus({ items: [], approval: { by: 'octocat' } }).state, 'error');
});

test('descriptions fit the 140-character status limit', () => {
  const many = Array.from({ length: 300 }, (_, i) => item('diff', `page-${i}`));
  for (const contentStale of [false, true]) {
    assert.ok(decideVisualStatus({ items: many, contentStale }).description.length <= 140);
  }
  const approver = { by: 'a'.repeat(39) };
  assert.ok(decideVisualStatus({ items: many, approval: approver }).description.length <= 140);
});

test('findApproval: matches the tree in CI app comments only', () => {
  const bot = 'ci-app[bot]';
  const comments = [
    { user: { login: bot }, body: `Approved.\n${approvalMarker({ tree: 'aaa', head: 'h1', by: 'alice' })}` },
    { user: { login: 'mallory' }, body: approvalMarker({ tree: 'bbb', head: 'h2', by: 'mallory' }) },
    { user: { login: bot }, body: approvalMarker({ tree: 'aaa', head: 'h3', by: 'bob' }) },
    { user: { login: bot }, body: '<!-- ci:visual-approval {not json} -->' },
  ];
  assert.deepEqual(findApproval(comments, { tree: 'aaa', botLogin: bot }), { tree: 'aaa', head: 'h3', by: 'bob' });
  assert.equal(findApproval(comments, { tree: 'bbb', botLogin: bot }), null);
  assert.equal(findApproval(comments, { tree: 'ccc', botLogin: bot }), null);
});
