/**
 * Simple semantic version parser and comparator.
 * Zero external dependencies.
 */

export function parseSemver(v) {
  if (!v) return null;
  // Clean prefixes like v, ^, ~, dev-
  const cleaned = v.replace(/^[v~^]/, '').trim();
  const match = cleaned.match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?/);
  if (!match) return null;

  return {
    major: parseInt(match[1], 10),
    minor: match[2] !== undefined ? parseInt(match[2], 10) : 0,
    patch: match[3] !== undefined ? parseInt(match[3], 10) : 0,
    prerelease: match[4] || null,
    raw: v,
  };
}

/**
 * Determine change type: 'patch' | 'minor' | 'major' | 'unknown'
 * Note: For 0.x versions (initial development), a minor bump (0.1.0 -> 0.2.0) is considered major/breaking.
 */
export function getVersionChangeType(fromVersion, toVersion) {
  const v1 = parseSemver(fromVersion);
  const v2 = parseSemver(toVersion);

  if (!v1 || !v2) {
    return 'unknown';
  }

  // 0.x rule: in 0.x, minor changes can be breaking, so treat minor bumps as major
  if (v1.major === 0 || v2.major === 0) {
    if (v1.major !== v2.major || v1.minor !== v2.minor) {
      return 'major';
    }
    if (v1.patch !== v2.patch) {
      return 'patch';
    }
    return 'patch';
  }

  if (v1.major !== v2.major) {
    return 'major';
  }
  if (v1.minor !== v2.minor) {
    return 'minor';
  }
  if (v1.patch !== v2.patch) {
    return 'patch';
  }

  return 'patch';
}
