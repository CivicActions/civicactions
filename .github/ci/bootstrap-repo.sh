#!/usr/bin/env bash
set -euo pipefail

# Idempotent repository configuration script using GitHub CLI
# Usage: ./bootstrap-repo.sh [--require-gate]

REPO="${GITHUB_REPOSITORY:-CivicActions/civicactions}"
REQUIRE_GATE="${1:-}"

echo "Configuring repository: ${REPO}"

# 1. Repository settings
echo "Configuring general repository settings..."
gh api --method PATCH "repos/${REPO}" \
  -f allow_auto_merge=true \
  -f allow_squash_merge=true \
  -f delete_branch_on_merge=true >/dev/null

# 2. Repository variables
set_repo_var() {
  local name="$1"
  local val="$2"
  echo "Setting variable ${name}..."
  if gh api "repos/${REPO}/actions/variables/${name}" >/dev/null 2>&1; then
    gh api --method PATCH "repos/${REPO}/actions/variables/${name}" -f name="${name}" -f value="${val}" >/dev/null
  else
    gh api --method POST "repos/${REPO}/actions/variables" -f name="${name}" -f value="${val}" >/dev/null
  fi
}

set_repo_var "AUTO_MERGE_ENABLED" "false"
set_repo_var "AUTO_DEPLOY_ENABLED" "false"
set_repo_var "DEPLOY_WINDOW" '{"days":[1,2,3,4],"start":"09:00","end":"15:00","tz":"America/Los_Angeles"}'
set_repo_var "REVIEW_ENV_TIMEOUT_MINUTES" "45"
set_repo_var "PANTHEON_SITE" "civicactions"
set_repo_var "PANTHEON_READY_COMMENT_PREFIX" "Successfully created multidev environment"

# 3. Labels
set_label() {
  local name="$1"
  local color="$2"
  local desc="$3"
  echo "Ensuring label ${name}..."
  if gh api "repos/${REPO}/labels/${name}" >/dev/null 2>&1; then
    gh api --method PATCH "repos/${REPO}/labels/${name}" -f new_name="${name}" -f color="${color}" -f description="${desc}" >/dev/null
  else
    gh api --method POST "repos/${REPO}/labels" -f name="${name}" -f color="${color}" -f description="${desc}" >/dev/null
  fi
}

set_label "deps:security-verified" "0e8a16" "Verified security dependency update (eligible for auto-merge and auto-deploy)"
set_label "deps:tooling" "bfdadc" "Non-shipping development/build tooling update"
set_label "deps:needs-review" "d93f0b" "Dependency update requiring human review"
set_label "refresh-content" "1d76db" "Request fresh content clone from dev for PR environment"

# 4. Environments
echo "Ensuring environments..."
gh api --method PUT "repos/${REPO}/environments/production-manual" >/dev/null
gh api --method PUT "repos/${REPO}/environments/production-auto" >/dev/null

# 5. Security features
echo "Ensuring security scanning settings..."
gh api --method PATCH "repos/${REPO}" \
  -F "security_and_analysis[secret_scanning][status]=enabled" \
  -F "security_and_analysis[secret_scanning_push_protection][status]=enabled" >/dev/null 2>&1 || true

# 6. Branch ruleset for master
echo "Configuring ruleset for master branch..."
RULESET_NAME="protect-master"
EXISTING_ID=$(gh api "repos/${REPO}/rulesets" --jq ".[] | select(.name == \"${RULESET_NAME}\") | .id" 2>/dev/null || true)

REQUIRED_STATUS_CHECKS="[]"
if [[ "${REQUIRE_GATE}" == "--require-gate" ]]; then
  REQUIRED_STATUS_CHECKS='[{"context":"ci/gate"}]'
fi

PAYLOAD=$(cat <<EOF
{
  "name": "${RULESET_NAME}",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/master"],
      "exclude": []
    }
  },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "required_status_checks": ${REQUIRED_STATUS_CHECKS}
      }
    }
  ]
}
EOF
)

if [[ -n "${EXISTING_ID}" ]]; then
  gh api --method PUT "repos/${REPO}/rulesets/${EXISTING_ID}" --input - <<< "${PAYLOAD}" >/dev/null
else
  gh api --method POST "repos/${REPO}/rulesets" --input - <<< "${PAYLOAD}" >/dev/null
fi

echo "Repository bootstrap complete."
