import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyResult } from '../../../tests/e2e/lib/visual-summary.mjs';

const failed = (message) => ({ status: 'failed', errors: [{ message }] });

test('classifyResult: current Playwright screenshot mismatch is a diff', () => {
  assert.equal(
    classifyResult(failed('Error: expect(page).toHaveScreenshot(expected) failed\n\n  Expected an image 1440px by 3589px, received 1440px by 2600px.')),
    'diff',
  );
});

test('classifyResult: legacy comparison message is a diff', () => {
  assert.equal(classifyResult(failed('Screenshot comparison failed: 120 pixels different')), 'diff');
});

test('classifyResult: missing reference snapshot is reference_unavailable', () => {
  assert.equal(
    classifyResult(failed("A snapshot doesn't exist at /e2e/.snapshots/desktop/home.png, writing actual.")),
    'reference_unavailable',
  );
});

test('classifyResult: other failures are errors, not diffs', () => {
  assert.equal(classifyResult(failed('page.goto: Timeout 30000ms exceeded.')), 'error');
});

test('classifyResult: passed and skipped', () => {
  assert.equal(classifyResult({ status: 'passed' }), 'match');
  assert.equal(classifyResult({ status: 'skipped' }), 'stale');
});
