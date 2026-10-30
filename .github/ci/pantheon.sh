#!/usr/bin/env bash
# Pantheon CLI helper library for CivicActions homesite CI/CD
set -euo pipefail

SITE="${PANTHEON_SITE:-civicactions}"

env_url() {
  local env="$1"
  echo "https://${env}-${SITE}.pantheonsite.io"
}

# Fetch the deployed git commit SHA for dev, test, or live from code-log
env_sha() {
  local env="$1"
  terminus env:code-log "${SITE}.${env}" --format=json 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, dict):
        commits = list(data.values())
    elif isinstance(data, list):
        commits = data
    else:
        commits = []
    if commits:
        print(commits[0].get('hash', ''))
    else:
        print('')
except Exception:
    print('')
"
}

# Fetch PANTHEON_DEPLOYMENT_IDENTIFIER (7-character short SHA) via drush php:eval
deploy_id() {
  local env="$1"
  terminus drush "${SITE}.${env}" -- php:eval 'echo getenv("PANTHEON_DEPLOYMENT_IDENTIFIER") ?: "";' 2>/dev/null || true
}

# Check if a short SHA matches the beginning of a full SHA
sha_matches() {
  local short="$1"
  local full="$2"
  if [[ -z "${short}" || -z "${full}" ]]; then
    return 1
  fi
  if [[ "${full}" == "${short}"* ]]; then
    return 0
  else
    return 1
  fi
}

# Wait for active Pantheon workflows for an environment to complete, then fail
# if the most recent one failed. Code syncs include the Integrated Composer
# build, which regularly takes 8-10+ minutes, so the default timeout is 30m.
wait_workflows() {
  local env="$1"
  local timeout="${2:-1800}"
  local start_time
  start_time=$(date +%s)

  echo "Waiting for active workflows on ${SITE}.${env} (timeout: ${timeout}s)..."
  while true; do
    local state running last_status last_name
    state=$(terminus workflow:list "${SITE}" --format=json 2>/dev/null | python3 -c "
import sys, json
env_target = '${env}'
try:
    data = json.load(sys.stdin)
    items = list(data.values()) if isinstance(data, dict) else (data if isinstance(data, list) else [])
    env_items = [w for w in items if w.get('env') == env_target]
    active = [w for w in env_items if w.get('status') in ('running', 'queued')]
    latest = max(env_items, key=lambda w: w.get('started_at') or 0) if env_items else {}
    print(len(active), latest.get('status', 'none'), latest.get('workflow', ''), sep='\t')
except Exception:
    print('0', 'unknown', '', sep='\t')
")
    IFS=$'\t' read -r running last_status last_name <<< "${state}"

    if [[ "${running}" -eq 0 ]]; then
      if [[ "${last_status}" == "failed" ]]; then
        echo "Latest Pantheon workflow on ${SITE}.${env} failed: ${last_name}" >&2
        return 1
      fi
      echo "No running workflows on ${SITE}.${env} (latest: ${last_name:-none}, ${last_status})."
      return 0
    fi

    local current_time
    current_time=$(date +%s)
    if (( current_time - start_time > timeout )); then
      echo "Timed out waiting for workflows on ${SITE}.${env} after ${timeout}s." >&2
      return 1
    fi

    sleep 10
  done
}

# Run drush command with retries and suppressed SSH host key prompts
drush() {
  local env="$1"
  shift
  # Callers write `drush <env> -- <cmd>`; Terminus adds its own `--` separator,
  # and a second one would make remote Drush treat Terminus' appended -y as an argument.
  [[ "${1:-}" == "--" ]] && shift
  local max_attempts=3
  local attempt=1
  local exit_code=0

  while (( attempt <= max_attempts )); do
    if terminus drush "${SITE}.${env}" -- "$@"; then
      return 0
    else
      exit_code=$?
      echo "Drush command failed on ${SITE}.${env} (attempt ${attempt}/${max_attempts}): drush $*" >&2
      (( attempt++ ))
      sleep 5
    fi
  done

  return "${exit_code}"
}
