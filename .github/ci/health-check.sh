#!/usr/bin/env bash
set -euo pipefail

# Health check runner for Drupal on Pantheon, built on Drush commands.
# Usage: ./health-check.sh <env> [--phase pre|post] [--since-wid <wid>]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=SCRIPTDIR/pantheon.sh
source "${SCRIPT_DIR}/pantheon.sh"

ENV="${1:-dev}"
PHASE="post"
SINCE_WID="0"

shift || true
while [[ $# -gt 0 ]]; do
  case "$1" in
    --phase)
      PHASE="$2"
      shift 2
      ;;
    --since-wid)
      SINCE_WID="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

WORK_DIR=$(mktemp -d)
trap 'rm -rf "${WORK_DIR}"' EXIT

# Run a Drush command and save stdout to ${WORK_DIR}/<name>.out. A failed call
# fails the whole check, so an unreachable site can never look healthy.
capture() {
  local name="$1"
  shift
  if ! drush "${ENV}" -- "$@" > "${WORK_DIR}/${name}.out" 2> "${WORK_DIR}/${name}.err"; then
    echo "::error::Health check could not run 'drush $*' on ${ENV}:" >&2
    grep -v "read-only Git mode" "${WORK_DIR}/${name}.err" >&2 || true
    exit 1
  fi
}

echo "Running Drupal health diagnostics on environment: ${ENV} (phase: ${PHASE})..."
capture requirements core:requirements --severity=2 --format=json
capture updates updatedb:status --format=json
capture config config:status --format=json
capture watchdog_latest watchdog:show --count=1 --format=json
if (( SINCE_WID > 0 )); then
  capture watchdog_errors watchdog:show --severity-min=Error --count=100 --format=json
fi

# automatic_updates may be uninstalled, in which case its config does not exist.
AUTO_UPDATES_STATE="unknown"
if drush "${ENV}" -- config:get automatic_updates.settings unattended.level --format=json \
    > "${WORK_DIR}/auto_updates.out" 2> "${WORK_DIR}/auto_updates.err"; then
  AUTO_UPDATES_STATE="configured"
elif grep -q "does not exist" "${WORK_DIR}/auto_updates.err"; then
  AUTO_UPDATES_STATE="absent"
else
  echo "::error::Health check could not read automatic_updates settings on ${ENV}." >&2
  exit 1
fi

export WORK_DIR SINCE_WID AUTO_UPDATES_STATE PHASE
python3 - <<'EOF'
import json, os, sys

work_dir = os.environ['WORK_DIR']
since_wid = int(os.environ['SINCE_WID'])


def load(name):
    """Return parsed JSON from Drush output, ignoring interleaved log lines.

    Over Pantheon SSH, Drush messages such as ' [warning] ...' share stdout
    with the JSON payload, and some commands print no JSON when empty.
    """
    path = os.path.join(work_dir, f'{name}.out')
    if not os.path.exists(path):
        return None
    raw = open(path).read()
    decoder = json.JSONDecoder()
    offset = 0
    for line in raw.splitlines(keepends=True):
        stripped = line.strip()
        if stripped.startswith('{') or stripped.startswith('[{') or stripped in ('[', '[]'):
            try:
                return decoder.raw_decode(raw, offset + (len(line) - len(line.lstrip())))[0]
            except json.JSONDecodeError:
                pass
        offset += len(line)
    return None


def entries(data):
    if not data:
        return []
    return list(data.values()) if isinstance(data, dict) else list(data)


failures = []

auto_state = os.environ['AUTO_UPDATES_STATE']
level = None
if auto_state == 'configured':
    level = (load('auto_updates') or {}).get('automatic_updates.settings:unattended.level')
auto_updates_disabled = auto_state == 'absent' or level == 'disable'

watchdog_latest = load('watchdog_latest') or {}
max_wid = max((int(k) for k in watchdog_latest), default=0) if isinstance(watchdog_latest, dict) else 0

print("### Drupal Health Check")
print(f"- **Phase**: {os.environ['PHASE']}")
print(f"- **Max Watchdog ID**: {max_wid}")
print(f"- **Automatic Updates Disabled**: {auto_updates_disabled}")

requirements = load('requirements') or {}
req_errors = {
    key: req for key, req in requirements.items()
    # Pantheon's code filesystem is always read-only, so automatic_updates
    # readiness checks cannot pass there. Irrelevant while unattended updates
    # are disabled.
    if not (auto_updates_disabled and key.startswith('automatic_updates_status'))
} if isinstance(requirements, dict) else {}
if req_errors:
    failures.append("Requirements Errors")
    print(f"\n#### Requirements Errors ({len(req_errors)})")
    for key, req in req_errors.items():
        description = ' '.join((req.get('description') or req.get('value') or '').split())
        print(f"- `{key}`: {req.get('title')} — {description[:300]}")

pending = entries(load('updates'))
if pending:
    failures.append("Pending Updates")
    print(f"\n#### Pending Database Updates ({len(pending)})")
    for u in pending:
        print(f"- `{u.get('module')}` {u.get('update_id')} ({u.get('type')})")

drift = entries(load('config'))
if drift:
    failures.append("Configuration Drift")
    print(f"\n#### Configuration Drift ({len(drift)})")
    for c in drift:
        print(f"- `{c.get('name')}`: {c.get('state')}")

if not auto_updates_disabled:
    failures.append("Automatic Updates Enabled")
    print(f"\n#### Automatic Updates Violation: unattended.level is '{level}'; it must be 'disable'.")

if since_wid > 0:
    new_errors = [e for e in entries(load('watchdog_errors')) if int(e.get('wid', 0)) > since_wid]
    if new_errors:
        failures.append("New Errors Logged")
        print(f"\n#### New Error-Level Log Entries since WID {since_wid} ({len(new_errors)})")
        for e in sorted(new_errors, key=lambda e: int(e['wid'])):
            print(f"- [WID {e.get('wid')}] [{e.get('type')}] {' '.join(str(e.get('message', '')).split())[:300]}")

if os.environ.get('GITHUB_OUTPUT'):
    with open(os.environ['GITHUB_OUTPUT'], 'a') as fh:
        fh.write(f"max_wid={max_wid}\n")

if failures:
    print(f"\n::error::Health check failed: {', '.join(failures)}")
    sys.exit(1)
print("\n✓ All health checks passed.")
EOF
