#!/usr/bin/env bash
set -euo pipefail

MIGRATION_ID="${1:-civicactions_medium_articles}"
BATCH_SIZE="${BATCH_SIZE:-10}"
SLEEP_SECONDS="${SLEEP_SECONDS:-20}"
MAX_LOOPS="${MAX_LOOPS:-50}"

if ! command -v ddev >/dev/null 2>&1; then
  echo "ddev is required in PATH" >&2
  exit 1
fi

echo "Starting throttled migration import"
echo "migration: ${MIGRATION_ID}"
echo "batch size: ${BATCH_SIZE}"
echo "sleep seconds: ${SLEEP_SECONDS}"
echo "max loops: ${MAX_LOOPS}"

for ((i=1; i<=MAX_LOOPS; i++)); do
  echo "---- loop ${i} ----"

  output="$(ddev drush migrate:import "${MIGRATION_ID}" --limit="${BATCH_SIZE}" 2>&1 || true)"
  echo "${output}"

  if grep -qiE "No unprocessed items|already imported" <<<"${output}"; then
    echo "Migration appears complete."
    break
  fi

  echo "Sleeping ${SLEEP_SECONDS}s before next batch..."
  sleep "${SLEEP_SECONDS}"
done

echo "Final status:"
ddev drush migrate:status "${MIGRATION_ID}" || true
