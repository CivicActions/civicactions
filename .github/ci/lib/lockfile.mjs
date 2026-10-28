import { getVersionChangeType } from './semver.mjs';

/**
 * Extracts a map of packageName -> { version, dev } from composer.lock JSON string or object
 */
export function parseComposerLock(content) {
  const data = typeof content === 'string' ? JSON.parse(content) : content;
  const packages = new Map();

  for (const pkg of data.packages || []) {
    packages.set(pkg.name, { version: pkg.version, dev: false });
  }
  for (const pkg of data['packages-dev'] || []) {
    packages.set(pkg.name, { version: pkg.version, dev: true });
  }

  return packages;
}

/**
 * Extracts a map of packageName -> { version, dev } from package-lock.json (v3) JSON string or object
 */
export function parseNpmLock(content) {
  const data = typeof content === 'string' ? JSON.parse(content) : content;
  const packages = new Map();

  if (data.packages) {
    for (const [key, pkg] of Object.entries(data.packages)) {
      if (!key) continue; // skip root entry ""
      const name = key.replace(/^node_modules\//, '');
      if (pkg.version) {
        packages.set(name, { version: pkg.version, dev: !!pkg.dev });
      }
    }
  }

  return packages;
}

/**
 * @typedef {Object} PackageDiff
 * @property {string} name
 * @property {string|null} from
 * @property {string|null} to
 * @property {'patch'|'minor'|'major'|'added'|'removed'|'unknown'} change
 * @property {boolean} dev
 */

/**
 * Diffs two lockfile maps (base -> head)
 */
export function diffPackageMaps(baseMap, headMap) {
  const diffs = [];
  const allNames = new Set([...baseMap.keys(), ...headMap.keys()]);

  for (const name of allNames) {
    const basePkg = baseMap.get(name);
    const headPkg = headMap.get(name);

    if (!basePkg && headPkg) {
      diffs.push({
        name,
        from: null,
        to: headPkg.version,
        change: 'added',
        dev: headPkg.dev,
      });
    } else if (basePkg && !headPkg) {
      diffs.push({
        name,
        from: basePkg.version,
        to: null,
        change: 'removed',
        dev: basePkg.dev,
      });
    } else if (basePkg && headPkg && basePkg.version !== headPkg.version) {
      diffs.push({
        name,
        from: basePkg.version,
        to: headPkg.version,
        change: getVersionChangeType(basePkg.version, headPkg.version),
        dev: headPkg.dev,
      });
    }
  }

  return diffs;
}
