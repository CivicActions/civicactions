#!/usr/bin/env bash
set -euo pipefail

# GitHub Deployment recorder for Pantheon live deployments
# Usage:
#   ./deployment-record.sh create --sha <sha> --from-sha <sha> --trigger <manual:user|auto> --backup <id> [--gate <json>]
#   ./deployment-record.sh status --id <deployment_id> --state <in_progress|success|failure> [--desc <text>]
#   ./deployment-record.sh count-manual

REPO="${GITHUB_REPOSITORY:-CivicActions/civicactions}"
ACTION="${1:-}"
shift || true

if [[ "${ACTION}" == "create" ]]; then
  SHA=""
  FROM_SHA=""
  TRIGGER=""
  BACKUP=""
  GATE_JSON="{}"

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --sha) SHA="$2"; shift 2 ;;
      --from-sha) FROM_SHA="$2"; shift 2 ;;
      --trigger) TRIGGER="$2"; shift 2 ;;
      --backup) BACKUP="$2"; shift 2 ;;
      --gate) GATE_JSON="$2"; shift 2 ;;
      *) shift ;;
    esac
  done

  PAYLOAD=$(python3 -c "
import json, sys
data = {
    'from_sha': '${FROM_SHA}',
    'trigger': '${TRIGGER}',
    'backup': '${BACKUP}',
    'gate': json.loads('${GATE_JSON}' or '{}')
}
print(json.dumps(data))
")

  DEP_JSON=$(gh api "repos/${REPO}/deployments" \
    -f ref="${SHA}" \
    -f environment="live" \
    -f required_contexts="[]" \
    -f description="Deployment to live triggered by ${TRIGGER}" \
    -f payload="${PAYLOAD}")

  DEP_ID=$(echo "${DEP_JSON}" | jq -r .id)
  echo "${DEP_ID}"

elif [[ "${ACTION}" == "status" ]]; then
  DEP_ID=""
  STATE="in_progress"
  DESC=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --id) DEP_ID="$2"; shift 2 ;;
      --state) STATE="$2"; shift 2 ;;
      --desc) DESC="$2"; shift 2 ;;
      *) shift ;;
    esac
  done

  gh api "repos/${REPO}/deployments/${DEP_ID}/statuses" \
    -f state="${STATE}" \
    -f description="${DESC}" >/dev/null
  echo "Updated deployment ${DEP_ID} to ${STATE}."

elif [[ "${ACTION}" == "count-manual" ]]; then
  # Count successful deployments where trigger starts with manual:
  python3 -c "
import sys, json, subprocess
repo = '${REPO}'
try:
    res = subprocess.run(['gh', 'api', f'repos/{repo}/deployments?environment=live&per_page=100'], capture_output=True, text=True, check=True)
    deps = json.loads(res.stdout)
    count = 0
    for d in deps:
        payload = d.get('payload') or {}
        if isinstance(payload, str):
            try: payload = json.loads(payload)
            except: payload = {}
        trigger = payload.get('trigger', '')
        if trigger.startswith('manual:'):
            # Check status
            st_res = subprocess.run(['gh', 'api', f'repos/{repo}/deployments/{d[\"id\"]}/statuses?per_page=1'], capture_output=True, text=True)
            if st_res.returncode == 0:
                statuses = json.loads(st_res.stdout)
                if statuses and statuses[0].get('state') == 'success':
                    count += 1
    print(count)
except Exception as e:
    print('0')
"
fi
