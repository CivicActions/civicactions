#!/usr/bin/env bash
# Copy configuration that still differs on a Pantheon environment after
# `drush deploy` into a config directory, using a real `drush cex` export.
#
# Module updates can change how their configuration is stored, so `drush
# deploy`'s config import cannot keep the committed version. What remains
# afterwards is what the updated code writes, and belongs in git.
#
# Usage: .github/ci/sync-config-drift.sh <env> <config-dir> <result-json>
#   Writes {"drift": [...], "changed": [...]} (names and states only) to
#   <result-json>. Exits 3 if there is drift that exporting cannot fix.
#   Requires the terminus-config-export plugin (`terminus cexr`).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=SCRIPTDIR/pantheon.sh
source "${SCRIPT_DIR}/pantheon.sh"

if [[ $# -ne 3 ]]; then
  echo "Usage: $0 <env> <config-dir> <result-json>" >&2
  exit 1
fi
ENV_NAME="$1"
CONFIG_DIR="$2"
RESULT="$3"

WORK_DIR=$(mktemp -d)
trap 'rm -rf "${WORK_DIR}"' EXIT

if ! drush "${ENV_NAME}" -- config:status --format=json > "${WORK_DIR}/status.json" 2> "${WORK_DIR}/status.err"; then
  echo "::error::Could not read config status on ${ENV_NAME}:" >&2
  grep -v "read-only Git mode" "${WORK_DIR}/status.err" >&2 || true
  exit 1
fi

DRIFT=$(node "${SCRIPT_DIR}/config-sync.mjs" drift --status "${WORK_DIR}/status.json")
if [[ -z "${DRIFT}" ]]; then
  echo "No configuration drift on ${ENV_NAME}."
  echo '{"drift": [], "changed": []}' > "${RESULT}"
  exit 0
fi

echo "Configuration that differs on ${ENV_NAME}:"
echo "${DRIFT}"
echo "Exporting configuration from ${ENV_NAME} with drush cex..."
terminus cexr "${SITE}.${ENV_NAME}" \
  --destination="${WORK_DIR}/export" \
  --remote-destination="ci-config-sync-${GITHUB_RUN_ID:-$(date +%s)}"

node "${SCRIPT_DIR}/config-sync.mjs" apply \
  --status "${WORK_DIR}/status.json" \
  --export "${WORK_DIR}/export" \
  --config "${CONFIG_DIR}" > "${RESULT}"
