import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateDeployGate } from '../evaluate-deploy-gate.mjs';

function getValidState(overrides = {}) {
  return {
    live_sha: 'aaaaaaa1111111',
    master_sha: 'bbbbbbb2222222',
    dev_sha: 'bbbbbbb2222222',
    test_sha: 'aaaaaaa1111111',
    commits: [
      {
        sha: 'bbbbbbb2222222',
        pr: 101,
        labels: ['deps:security-verified'],
      },
    ],
    live_clean: true,
    in_window: true,
    auto_deploy_enabled: true,
    manual_track_record: 6,
    ...overrides,
  };
}

test('evaluateDeployGate: happy path deploys', () => {
  const result = evaluateDeployGate(getValidState());
  assert.equal(result.decision, 'deploy');
  assert.equal(result.reasons.length, 0);
  assert.equal(result.conditions.all_commits_security_verified, true);
});

test('evaluateDeployGate: human commit blocks deploy', () => {
  const state = getValidState({
    commits: [
      { sha: 'bbbbbbb2222222', pr: 101, labels: ['deps:security-verified'] },
      { sha: 'ccccccc3333333', pr: 102, labels: ['feat:theme'] },
    ],
  });
  const result = evaluateDeployGate(state);
  assert.equal(result.decision, 'blocked');
  assert.ok(result.reasons.some((r) => r.includes('not a verified security update')));
});

test('evaluateDeployGate: commit with no PR blocks deploy', () => {
  const state = getValidState({
    commits: [{ sha: 'bbbbbbb2222222', pr: null, labels: [] }],
  });
  const result = evaluateDeployGate(state);
  assert.equal(result.decision, 'blocked');
  assert.ok(result.reasons.some((r) => r.includes('has no associated PR')));
});

test('evaluateDeployGate: test environment ahead of live with unknown commit blocks deploy', () => {
  const state = getValidState({
    test_sha: 'xxxxxxx9999999',
  });
  const result = evaluateDeployGate(state);
  assert.equal(result.decision, 'blocked');
  assert.ok(result.reasons.some((r) => r.includes('Test environment')));
});

test('evaluateDeployGate: dev not at master blocks deploy', () => {
  const state = getValidState({
    dev_sha: 'yyyyyyy8888888',
  });
  const result = evaluateDeployGate(state);
  assert.equal(result.decision, 'blocked');
  assert.ok(result.reasons.some((r) => r.includes('Dev environment')));
});

test('evaluateDeployGate: live configuration drift blocks deploy', () => {
  const state = getValidState({
    live_clean: false,
  });
  const result = evaluateDeployGate(state);
  assert.equal(result.decision, 'blocked');
  assert.ok(result.reasons.some((r) => r.includes('configuration drift')));
});

test('evaluateDeployGate: outside window blocks deploy', () => {
  const state = getValidState({
    in_window: false,
  });
  const result = evaluateDeployGate(state);
  assert.equal(result.decision, 'blocked');
  assert.ok(result.reasons.some((r) => r.includes('outside the allowed deployment window')));
});

test('evaluateDeployGate: kill switch off blocks deploy', () => {
  const state = getValidState({
    auto_deploy_enabled: false,
  });
  const result = evaluateDeployGate(state);
  assert.equal(result.decision, 'blocked');
  assert.ok(result.reasons.some((r) => r.includes('kill switch is OFF')));
});

test('evaluateDeployGate: track record below 5 blocks deploy', () => {
  const state = getValidState({
    manual_track_record: 4,
  });
  const result = evaluateDeployGate(state);
  assert.equal(result.decision, 'blocked');
  assert.ok(result.reasons.some((r) => r.includes('track record (4) is below the required 5')));
});
