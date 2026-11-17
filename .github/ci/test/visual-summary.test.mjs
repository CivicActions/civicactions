import test from 'node:test';
import assert from 'node:assert/strict';
import { PNG } from 'pngjs';
import { classifyResult, diffImagePaths, formatVisualMarkdownTable } from '../../../tests/e2e/lib/visual-summary.mjs';
import { composeSideBySide } from '../vrt-diff-links.mjs';

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

test('diffImagePaths: finds expected/actual/diff relative to test-results', () => {
  const dir = '/__w/repo/repo/tests/e2e/test-results/visual-home--desktop-retry1';
  assert.deepEqual(
    diffImagePaths([
      { name: 'home-expected.png', path: '/__w/repo/repo/tests/e2e/.snapshots/desktop/home.png' },
      { name: 'home-actual.png', path: `${dir}/home-actual.png` },
      { name: 'home-diff.png', path: `${dir}/home-diff.png` },
    ]),
    {
      expected: 'visual-home--desktop-retry1/home-expected.png',
      actual: 'visual-home--desktop-retry1/home-actual.png',
      diff: 'visual-home--desktop-retry1/home-diff.png',
    },
  );
  assert.equal(diffImagePaths([{ name: 'screenshot', path: `${dir}/test-failed-1.png` }]), null);
});

test('formatVisualMarkdownTable: links statuses that have an image URL', () => {
  const table = formatVisualMarkdownTable(
    [
      { pageId: 'home', project: 'desktop', status: 'diff' },
      { pageId: 'home', project: 'mobile', status: 'match' },
    ],
    { 'home:desktop': 'https://example.test/artifacts/1' },
  );
  assert.match(table, /\| `home` \| \[⚠️ Difference\]\(https:\/\/example\.test\/artifacts\/1\) \| ✓ Match \|/);
});

test('composeSideBySide: places images left to right with a gap', () => {
  const solid = (width, height, value) => {
    const png = new PNG({ width, height });
    png.data.fill(value);
    return PNG.sync.write(png);
  };
  const out = PNG.sync.read(composeSideBySide([solid(10, 20, 0), solid(5, 8, 100)]));
  assert.equal(out.width, 10 + 24 + 5);
  assert.equal(out.height, 20);
  const pixel = (x, y) => out.data[(y * out.width + x) * 4];
  assert.equal(pixel(0, 0), 0);
  assert.equal(pixel(10, 0), 0xcc);
  assert.equal(pixel(34, 0), 100);
  assert.equal(pixel(34, 15), 255);
});
