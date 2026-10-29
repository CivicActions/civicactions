import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyDependencyPr } from '../classify-dependency-pr.mjs';

test('classifyDependencyPr: patch security update is security-verified', () => {
  const baseLock = { packages: [{ name: 'drupal/token', version: '1.16.0' }] };
  const headLock = { packages: [{ name: 'drupal/token', version: '1.17.0' }] };

  const result = classifyDependencyPr({
    metadata: { advisories: [{ ghsa_id: 'GHSA-1234' }] },
    baseLockContent: baseLock,
    headLockContent: headLock,
    changedFiles: ['composer.json', 'composer.lock'],
    ecosystem: 'composer',
  });

  assert.equal(result.category, 'security-verified');
  assert.equal(result.label, 'deps:security-verified');
  assert.equal(result.reasons.length, 0);
});

test('classifyDependencyPr: major version update is needs-review', () => {
  const baseLock = { packages: [{ name: 'drupal/token', version: '1.16.0' }] };
  const headLock = { packages: [{ name: 'drupal/token', version: '2.0.0' }] };

  const result = classifyDependencyPr({
    metadata: { advisories: [{ ghsa_id: 'GHSA-1234' }] },
    baseLockContent: baseLock,
    headLockContent: headLock,
    changedFiles: ['composer.json', 'composer.lock'],
    ecosystem: 'composer',
  });

  assert.equal(result.category, 'needs-review');
  assert.equal(result.label, 'deps:needs-review');
  assert.ok(result.reasons.some((r) => r.includes('breaking/major')));
});

test('classifyDependencyPr: Drupal core minor update is needs-review', () => {
  const baseLock = { packages: [{ name: 'drupal/core', version: '11.3.10' }] };
  const headLock = { packages: [{ name: 'drupal/core', version: '11.4.0' }] };

  const result = classifyDependencyPr({
    metadata: { advisories: [{ ghsa_id: 'GHSA-1234' }] },
    baseLockContent: baseLock,
    headLockContent: headLock,
    changedFiles: ['composer.json', 'composer.lock'],
    ecosystem: 'composer',
  });

  assert.equal(result.category, 'needs-review');
  assert.ok(result.reasons.some((r) => r.includes('Drupal core')));
});

test('classifyDependencyPr: Drupal core patch security update is security-verified', () => {
  const baseLock = { packages: [{ name: 'drupal/core', version: '11.3.10' }] };
  const headLock = { packages: [{ name: 'drupal/core', version: '11.3.11' }] };

  const result = classifyDependencyPr({
    metadata: { advisories: [{ ghsa_id: 'GHSA-1234' }] },
    baseLockContent: baseLock,
    headLockContent: headLock,
    changedFiles: ['composer.json', 'composer.lock'],
    ecosystem: 'composer',
  });

  assert.equal(result.category, 'security-verified');
});

test('classifyDependencyPr: 0.x minor bump is treated as breaking/needs-review', () => {
  const baseLock = { packages: [{ name: 'vendor/lib', version: '0.1.2' }] };
  const headLock = { packages: [{ name: 'vendor/lib', version: '0.2.0' }] };

  const result = classifyDependencyPr({
    metadata: { advisories: [{ ghsa_id: 'GHSA-1234' }] },
    baseLockContent: baseLock,
    headLockContent: headLock,
    changedFiles: ['composer.json', 'composer.lock'],
    ecosystem: 'composer',
  });

  assert.equal(result.category, 'needs-review');
  assert.ok(result.reasons.some((r) => r.includes('breaking/major')));
});

test('classifyDependencyPr: transitive major update is needs-review', () => {
  const baseLock = {
    packages: [
      { name: 'drupal/token', version: '1.16.0' },
      { name: 'guzzlehttp/psr7', version: '1.9.0' },
    ],
  };
  const headLock = {
    packages: [
      { name: 'drupal/token', version: '1.16.1' },
      { name: 'guzzlehttp/psr7', version: '2.0.0' },
    ],
  };

  const result = classifyDependencyPr({
    metadata: { advisories: [{ ghsa_id: 'GHSA-1234' }] },
    baseLockContent: baseLock,
    headLockContent: headLock,
    changedFiles: ['composer.json', 'composer.lock'],
    ecosystem: 'composer',
  });

  assert.equal(result.category, 'needs-review');
  assert.ok(result.reasons.some((r) => r.includes('guzzlehttp/psr7')));
});

test('classifyDependencyPr: extra file touched is needs-review', () => {
  const baseLock = { packages: [{ name: 'drupal/token', version: '1.16.0' }] };
  const headLock = { packages: [{ name: 'drupal/token', version: '1.16.1' }] };

  const result = classifyDependencyPr({
    metadata: { advisories: [{ ghsa_id: 'GHSA-1234' }] },
    baseLockContent: baseLock,
    headLockContent: headLock,
    changedFiles: ['composer.json', 'composer.lock', 'README.md'],
    ecosystem: 'composer',
  });

  assert.equal(result.category, 'needs-review');
  assert.ok(result.reasons.some((r) => r.includes('outside allowed lock/manifest')));
});

test('classifyDependencyPr: theme npm tooling update without advisory is tooling', () => {
  const baseLock = { packages: { 'node_modules/vite': { version: '7.3.6', dev: true } } };
  const headLock = { packages: { 'node_modules/vite': { version: '7.3.7', dev: true } } };

  const result = classifyDependencyPr({
    metadata: { advisories: [] },
    baseLockContent: baseLock,
    headLockContent: headLock,
    changedFiles: ['web/themes/omnichannel/package.json', 'web/themes/omnichannel/package-lock.json'],
    ecosystem: 'npm',
  });

  assert.equal(result.category, 'tooling');
  assert.equal(result.label, 'deps:tooling');
});

test('classifyDependencyPr: version update without advisory is needs-review', () => {
  const baseLock = { packages: [{ name: 'drupal/token', version: '1.16.0' }] };
  const headLock = { packages: [{ name: 'drupal/token', version: '1.17.0' }] };

  const result = classifyDependencyPr({
    metadata: { advisories: [] },
    baseLockContent: baseLock,
    headLockContent: headLock,
    changedFiles: ['composer.json', 'composer.lock'],
    ecosystem: 'composer',
  });

  assert.equal(result.category, 'needs-review');
  assert.equal(result.label, 'deps:needs-review');
});
