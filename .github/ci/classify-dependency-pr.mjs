import fs from 'node:fs';
import { parseComposerLock, parseNpmLock, diffPackageMaps } from './lib/lockfile.mjs';

/**
 * Classifies a Dependabot PR based on changed files, advisories, and lockfile diffs.
 */
export function classifyDependencyPr({ metadata, baseLockContent, headLockContent, changedFiles, ecosystem }) {
  const reasons = [];
  const advisories = metadata.advisories || metadata.alerts || [];

  // Allowed files by ecosystem
  const allowedFilePatterns = {
    composer: ['composer.json', 'composer.lock'],
    npm: ['web/themes/omnichannel/package.json', 'web/themes/omnichannel/package-lock.json'],
    'github-actions': ['.github/workflows/'],
  };

  const allowedPatterns = allowedFilePatterns[ecosystem] || [];
  for (const file of changedFiles || []) {
    const isAllowed = allowedPatterns.some((pattern) => file.startsWith(pattern) || file === pattern);
    if (!isAllowed) {
      reasons.push(`Changed file "${file}" is outside allowed lock/manifest files for ${ecosystem}`);
    }
  }

  // Parse lockfiles
  let diffs = [];
  if (ecosystem === 'composer' && baseLockContent && headLockContent) {
    const baseMap = parseComposerLock(baseLockContent);
    const headMap = parseComposerLock(headLockContent);
    diffs = diffPackageMaps(baseMap, headMap);
  } else if (ecosystem === 'npm' && baseLockContent && headLockContent) {
    const baseMap = parseNpmLock(baseLockContent);
    const headMap = parseNpmLock(headLockContent);
    diffs = diffPackageMaps(baseMap, headMap);
  }

  // Evaluate packages
  let hasMajor = false;
  let hasCoreNonPatch = false;

  for (const diff of diffs) {
    if (diff.change === 'major') {
      hasMajor = true;
      reasons.push(`Package "${diff.name}" upgraded with breaking/major change: ${diff.from} -> ${diff.to}`);
    }
    if (diff.name.startsWith('drupal/core') && diff.change !== 'patch') {
      hasCoreNonPatch = true;
      reasons.push(`Drupal core package "${diff.name}" changed with non-patch version: ${diff.from} -> ${diff.to}`);
    }
    if (diff.change === 'removed' && !diff.dev) {
      reasons.push(`Runtime package "${diff.name}" was removed`);
    }
  }

  let category = 'needs-review';

  if (reasons.length > 0) {
    category = 'needs-review';
  } else if (advisories.length > 0) {
    category = 'security-verified';
  } else if (ecosystem === 'npm' && diffs.length > 0 && diffs.every((d) => d.dev)) {
    category = 'tooling';
  } else {
    reasons.push('Version update without security advisory requires review');
    category = 'needs-review';
  }

  return {
    category,
    advisories,
    diffs,
    reasons,
    label: category === 'security-verified' ? 'deps:security-verified' : category === 'tooling' ? 'deps:tooling' : 'deps:needs-review',
  };
}

// CLI runner if executed directly
if (process.argv[1] && process.argv[1].endsWith('classify-dependency-pr.mjs')) {
  let metadataPath, baseLockPath, headLockPath, filesPath, ecosystem = 'composer';

  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--metadata') metadataPath = process.argv[++i];
    if (process.argv[i] === '--base-lock') baseLockPath = process.argv[++i];
    if (process.argv[i] === '--head-lock') headLockPath = process.argv[++i];
    if (process.argv[i] === '--files') filesPath = process.argv[++i];
    if (process.argv[i] === '--ecosystem') ecosystem = process.argv[++i];
  }

  const metadata = metadataPath ? JSON.parse(fs.readFileSync(metadataPath, 'utf8')) : {};
  const baseLockContent = baseLockPath ? fs.readFileSync(baseLockPath, 'utf8') : '';
  const headLockContent = headLockPath ? fs.readFileSync(headLockPath, 'utf8') : '';
  const changedFiles = filesPath ? JSON.parse(fs.readFileSync(filesPath, 'utf8')) : [];

  const result = classifyDependencyPr({ metadata, baseLockContent, headLockContent, changedFiles, ecosystem });
  console.log(JSON.stringify(result, null, 2));
}
