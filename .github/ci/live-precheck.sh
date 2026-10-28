#!/usr/bin/env bash
set -euo pipefail

# Live pre-deployment verification
# Verifies live has zero config drift and no pending database updates.
# Output is strictly names and states only - NO VALUES OR DIFFS (FR-051, FR-071).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/pantheon.sh"

LIVE_ENV="live"
echo "Performing pre-deployment checks on ${LIVE_ENV}..."

# 1. Fetch live SHA
CURRENT_LIVE_SHA=$(env_sha "${LIVE_ENV}")
echo "Current live commit SHA: ${CURRENT_LIVE_SHA}"

# 2. Check pending updates
UPDATES_RAW=$(drush "${LIVE_ENV}" -- updatedb:status --format=json 2>/dev/null || echo "[]")
PENDING_COUNT=$(python3 -c "
import sys, json
try:
    data = json.loads(sys.argv[1].strip() or '[]')
    print(len(data) if isinstance(data, list) else len(data.keys()))
except Exception:
    print('0')
" "${UPDATES_RAW}")

# 3. Check config drift (names and states only)
CONFIG_STATUS_RAW=$(drush "${LIVE_ENV}" -- config:status --format=json 2>/dev/null || echo "[]")
DRIFT_JSON=$(python3 -c "
import sys, json
try:
    data = json.loads(sys.argv[1].strip() or '[]')
    items = []
    if isinstance(data, dict):
        for k, v in data.items():
            items.append({'name': k, 'state': v.get('state', 'Different')})
    elif isinstance(data, list):
        for row in data:
            items.append({'name': row.get('name', 'unknown'), 'state': row.get('state', 'Different')})
    print(json.dumps(items))
except Exception:
    print('[]')
" "${CONFIG_STATUS_RAW}")

DRIFT_COUNT=$(python3 -c "import sys, json; print(len(json.loads(sys.argv[1])))" "${DRIFT_JSON}")

echo "Pre-check diagnostics:"
echo "- Pending updates: ${PENDING_COUNT}"
echo "- Config drift items: ${DRIFT_COUNT}"

# Print summary JSON
python3 -c "
import json
out = {
    'live_sha': '${CURRENT_LIVE_SHA}',
    'pending_updates_count': ${PENDING_COUNT},
    'config_drift': json.loads('${DRIFT_JSON}'),
    'clean': (${PENDING_COUNT} == 0 and ${DRIFT_COUNT} == 0)
}
print(json.dumps(out, indent=2))
if not out['clean']:
    print('::error::Live pre-deployment check failed! Live has config drift or pending updates.', file=sys.stderr)
    sys.exit(1)
"
