#!/usr/bin/env bash
# Recreates a PR's Pantheon review environment: deletes the multidev (if any),
# then pushes an empty, GitHub-signed commit to the PR branch. Pantheon's
# GitHub app builds a fresh multidev (code from the PR, content cloned from
# dev) and its "Successfully created" comment re-runs the review-env checks.
#
# Usage: recreate-review-env.sh <pr-number> <reason>
# Env: GH_TOKEN (contents: write on the repo), REPO, PANTHEON_SITE; Terminus
# must be authenticated. Prints the new commit SHA on the last line.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=SCRIPTDIR/pantheon.sh
source "${SCRIPT_DIR}/pantheon.sh"

PR_NUMBER="$1"
REASON="$2"
ENV_NAME="pr-${PR_NUMBER}"

read -r STATE HEAD_SHA HEAD_REF HEAD_REPO <<< "$(gh api "repos/${REPO}/pulls/${PR_NUMBER}" \
  -q '"\(.state) \(.head.sha) \(.head.ref) \(.head.repo.full_name)"')"
if [[ "${STATE}" != "open" ]]; then
  echo "::error::PR #${PR_NUMBER} is ${STATE}." >&2
  exit 1
fi
if [[ "${HEAD_REPO}" != "${REPO}" ]]; then
  echo "::error::PR #${PR_NUMBER} comes from a fork (${HEAD_REPO}); its branch can't be updated." >&2
  exit 1
fi

# Deleting while Pantheon creates another PR's multidev makes that create fail.
wait_multidev_ops 1800 >&2

if terminus multidev:list "${SITE}" --format=list 2>/dev/null | grep -qx "${ENV_NAME}"; then
  # Let an in-progress build or sync finish first; a failed one is expected here.
  wait_workflows "${ENV_NAME}" 900 >&2 || true
  echo "Deleting ${SITE}.${ENV_NAME}..." >&2
  terminus multidev:delete "${SITE}.${ENV_NAME}" --yes >&2
  for _ in $(seq 1 24); do
    terminus multidev:list "${SITE}" --format=list 2>/dev/null | grep -qx "${ENV_NAME}" || break
    sleep 5
  done
  if terminus multidev:list "${SITE}" --format=list 2>/dev/null | grep -qx "${ENV_NAME}"; then
    echo "::error::${ENV_NAME} still exists after deletion." >&2
    exit 1
  fi
else
  echo "No ${ENV_NAME} multidev exists; Pantheon will create it on the next push." >&2
fi

# A create that starts during a delete (including Pantheon's separate edge
# cleanup) or within about a minute after one fails; creates starting 0-60s
# after a delete failed, 114s+ succeeded. The pause covers a cleanup that
# hasn't been queued yet when the delete returns.
sleep 30
wait_multidev_ops 1200 180 >&2

# Commits made through the GraphQL API are signed by GitHub, which the
# "Require Signed Commits" ruleset needs. expectedHeadOid guards against a
# concurrent push.
NEW_SHA=$(jq -n \
  --arg repo "${REPO}" --arg branch "${HEAD_REF}" --arg head "${HEAD_SHA}" \
  --arg body "${REASON}" \
  '{
    query: "mutation($input: CreateCommitOnBranchInput!) { createCommitOnBranch(input: $input) { commit { oid } } }",
    variables: { input: {
      branch: { repositoryNameWithOwner: $repo, branchName: $branch },
      expectedHeadOid: $head,
      message: { headline: "chore: recreate review environment", body: $body },
      fileChanges: {}
    } }
  }' | gh api graphql --input - -q '.data.createCommitOnBranch.commit.oid')

if [[ -z "${NEW_SHA}" ]]; then
  echo "::error::Could not push an empty commit to ${HEAD_REF}." >&2
  exit 1
fi
echo "Pushed empty commit ${NEW_SHA:0:7} to ${HEAD_REF}." >&2
echo "${NEW_SHA}"
