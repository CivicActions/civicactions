#!/usr/bin/env bash
set -euo pipefail

# Health check runner for Drupal on Pantheon
# Usage: ./health-check.sh <env> [--phase pre|post] [--since-wid <wid>]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
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

PHP_FILE="${SCRIPT_DIR}/drupal/health.php"
if [[ ! -f "${PHP_FILE}" ]]; then
  echo "Health script not found: ${PHP_FILE}" >&2
  exit 1
fi

PHP_CODE=$(cat "${PHP_FILE}")

echo "Running Drupal health diagnostics on environment: ${ENV} (phase: ${PHASE})..."
RAW_OUTPUT=$(drush "${ENV}" -- php:eval "putenv('HEALTH_SINCE_WID=${SINCE_WID}'); ?>${PHP_CODE}" 2>/dev/null || true)

# Parse output with python
PYTHON_SCRIPT=$(cat <<'EOF'
import sys, json, os

raw = sys.stdin.read().strip()
start = raw.find('{')
end = raw.rfind('}')
if start == -1 or end == -1:
    print(f"::error::Failed to parse JSON output from health check:\n{raw}")
    sys.exit(1)

data = json.loads(raw[start:end+1])
status = data.get('status', 'FAIL')

print(f"### Drupal Health Check ({status})")
print(f"- **Timestamp**: {data.get('timestamp')}")
print(f"- **Max Watchdog ID**: {data.get('max_wid')}")
print(f"- **Automatic Updates Disabled**: {data.get('automatic_updates_disabled')}")

failures = []

req_errors = data.get('requirements_errors', [])
if req_errors:
    failures.append("Requirements Errors")
    print(f"\n#### Requirements Errors ({len(req_errors)})")
    for r in req_errors:
        print(f"- `{r.get('name')}`: {r.get('title')} ({r.get('value')})")

pending_up = data.get('pending_updates', [])
if pending_up:
    failures.append("Pending Updates")
    print(f"\n#### Pending Database Updates ({len(pending_up)})")
    for u in pending_up:
        print(f"- {u}")

config_diff = data.get('config_status', [])
if config_diff:
    failures.append("Configuration Drift")
    print(f"\n#### Configuration Drift ({len(config_diff)})")
    for c in config_diff:
        print(f"- `{c.get('name')}`: {c.get('state')}")

if not data.get('automatic_updates_disabled'):
    failures.append("Automatic Updates Enabled")
    print("\n#### Automatic Updates Violation: Unattended updates must be disabled!")

new_errs = data.get('new_errors', [])
if new_errs:
    failures.append("New Errors Logged")
    print(f"\n#### New Error-Level Log Entries ({len(new_errs)})")
    for e in new_errs:
        print(f"- [WID {e.get('wid')}] [{e.get('type')}] {e.get('message')}")

# Write outputs for GitHub Actions if available
if os.environ.get('GITHUB_OUTPUT'):
    with open(os.environ['GITHUB_OUTPUT'], 'a') as fh:
        fh.write(f"max_wid={data.get('max_wid')}\n")
if failures:
    print(f"\n::error::Health check failed: {', '.join(failures)}")
    sys.exit(1)
else:
    print("\n✓ All health checks passed.")
    sys.exit(0)
EOF
)

python3 -c "${PYTHON_SCRIPT}" <<< "${RAW_OUTPUT}"
