import fs from 'node:fs';
import path from 'node:path';

// Trailer that marks commits made by the review environment config sync.
export const SYNC_TRAILER = 'Config-Sync:';

const STATES = new Set(['Different', 'Only in DB', 'Only in sync dir']);
const CONFIG_NAME = /^[A-Za-z0-9_][A-Za-z0-9_.-]*$/;

export class RoundTripError extends Error {}

/**
 * Parses `drush config:status --format=json` output into [{ name, state }].
 *
 * Over Pantheon SSH, Drush log lines can share stdout with the JSON, and
 * Drush prints no JSON at all when nothing differs.
 */
export function parseConfigStatus(raw) {
  const lines = raw.split('\n');
  // Drush log lines start with "[notice]" etc., so only these count as JSON.
  const start = lines.findIndex((line) => /^\s*(\{|\[\s*(\{|\]|$))/.test(line));
  if (start === -1) {
    return [];
  }
  let candidate = lines.slice(start).join('\n');
  let data;
  while (candidate) {
    try {
      data = JSON.parse(candidate);
      break;
    } catch {
      // Drop trailing log output back to the previous closing bracket.
      const end = Math.max(candidate.lastIndexOf('}', candidate.length - 2), candidate.lastIndexOf(']', candidate.length - 2));
      candidate = end === -1 ? '' : candidate.slice(0, end + 1);
    }
  }
  if (data === undefined) {
    throw new Error('Could not parse drush config:status output as JSON.');
  }
  const items = Array.isArray(data) ? data : Object.values(data);
  return items.map(({ name, state }) => {
    if (!CONFIG_NAME.test(name ?? '')) {
      throw new Error(`Unexpected config name in drush config:status output: ${JSON.stringify(name)}`);
    }
    if (!STATES.has(state)) {
      throw new Error(`Unsupported config:status state "${state}" for ${name}.`);
    }
    return { name, state };
  });
}

/**
 * Returns TRUE if a commit message carries the config sync trailer.
 */
export function isSyncCommit(message) {
  return message.split('\n').some((line) => line.startsWith(SYNC_TRAILER));
}

/**
 * Copies the drifted config items from a full `drush cex` export into a
 * config directory, and deletes items that are only in the config directory.
 *
 * Only drifted items are touched: the rest of the export may differ from the
 * committed files in formatting alone, which config:status does not report.
 *
 * @returns {{ name: string, state: string }[]} The items whose files changed.
 * @throws {RoundTripError} If there is drift but no file changed, so the
 *   drift cannot be fixed by committing the export.
 */
export function applyDrift({ drift, exportDir, configDir }) {
  if (!fs.existsSync(path.join(exportDir, 'core.extension.yml'))) {
    throw new Error(`The export in ${exportDir} is incomplete: core.extension.yml is missing.`);
  }
  const changed = [];
  for (const { name, state } of drift) {
    const exported = path.join(exportDir, `${name}.yml`);
    const committed = path.join(configDir, `${name}.yml`);
    if (state === 'Only in sync dir') {
      if (fs.existsSync(exported)) {
        throw new Error(`${name} is reported as only in the sync directory, but the export contains it.`);
      }
      if (fs.existsSync(committed)) {
        fs.unlinkSync(committed);
        changed.push({ name, state });
      }
      continue;
    }
    if (!fs.existsSync(exported)) {
      throw new Error(`${name} is reported as "${state}", but the export does not contain it.`);
    }
    const content = fs.readFileSync(exported);
    if (fs.existsSync(committed) && content.equals(fs.readFileSync(committed))) {
      continue;
    }
    fs.writeFileSync(committed, content);
    changed.push({ name, state });
  }
  if (drift.length > 0 && changed.length === 0) {
    throw new RoundTripError('Configuration differs on the site, but exporting it changes no files, so it does not round-trip.');
  }
  return changed;
}

function option(args, flag) {
  const index = args.indexOf(flag);
  if (index === -1 || index + 1 >= args.length) {
    throw new Error(`Missing ${flag}.`);
  }
  return args[index + 1];
}

// CLI runner if executed directly. Names and states only, never values.
//   drift --status <file>                          Print drifted names, one per line.
//   apply --status <file> --export <dir> --config <dir>
//                                                  Print {"drift": [...], "changed": [...]}.
//                                                  Exits 3 if the drift does not round-trip.
//   is-sync-commit                                 Exit 0 if stdin is a sync commit message.
if (process.argv[1] && process.argv[1].endsWith('config-sync.mjs')) {
  const [command, ...args] = process.argv.slice(2);
  try {
    if (command === 'drift') {
      const drift = parseConfigStatus(fs.readFileSync(option(args, '--status'), 'utf8'));
      for (const { name } of drift) {
        console.log(name);
      }
    } else if (command === 'apply') {
      const drift = parseConfigStatus(fs.readFileSync(option(args, '--status'), 'utf8'));
      let changed = [];
      let exitCode = 0;
      try {
        changed = applyDrift({ drift, exportDir: option(args, '--export'), configDir: option(args, '--config') });
      } catch (error) {
        if (!(error instanceof RoundTripError)) {
          throw error;
        }
        console.error(`::error::${error.message}`);
        exitCode = 3;
      }
      console.log(JSON.stringify({ drift, changed }, null, 2));
      process.exitCode = exitCode;
    } else if (command === 'is-sync-commit') {
      process.exitCode = isSyncCommit(fs.readFileSync(0, 'utf8')) ? 0 : 1;
    } else {
      throw new Error(`Unknown command "${command}". Use drift, apply or is-sync-commit.`);
    }
  } catch (error) {
    console.error(`::error::${error.message}`);
    process.exitCode = 1;
  }
}
