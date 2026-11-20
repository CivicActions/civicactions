# CI Scripts & Decision Logic

This directory contains standalone, dependency-free Node.js and Bash scripts that govern the CI/CD pipeline and automated deployment decisions for the CivicActions homesite.

## Running Unit Tests

All pure decision logic is covered by Node.js native unit tests with zero external test runners:

```bash
node --test .github/ci/test/
```

## Scripts

### 1. `classify-dependency-pr.mjs`
Analyzes Dependabot pull requests by inspecting lockfiles (`composer.lock` and `package-lock.json`), changed files, and GitHub security advisory metadata.
- **Outputs**: Classification category (`security-verified`, `tooling`, or `needs-review`), associated PR label (`deps:security-verified`, `deps:tooling`, `deps:needs-review`), and reasons for review.
- **Rules**:
  - Requires patch/minor version updates only (Drupal core must be patch-only).
  - Flags transitive major updates and changes outside allowed manifest/lock files.
  - Recognizes theme-local npm devDependency updates as safe `tooling`.

### 2. `evaluate-deploy-gate.mjs`
Evaluates whether an automated live deployment of pending security updates is safe.
- **Inputs**: Current live, test, dev, and master commit SHAs; pending commit history; live health & drift status; deploy window status; kill switch; track record.
- **Outputs**: `{ "decision": "deploy" | "blocked", "reasons": [...] }`
- **Rules**:
  - Every pending commit must come from a verified security PR.
  - Live must have zero config drift and zero pending database updates.
  - Current time must fall within the allowed window on a non-holiday.
  - Manual deployment track record must have at least 5 successful prior releases.

### 3. `deploy-window.mjs`
Evaluates a JSON window configuration against a given timestamp in a specified timezone.
- Computes US federal holidays (and observed Friday/Monday holidays) mathematically with zero third-party packages.
- Returns `{ "open": boolean, "holiday": string | null, "current_day": string, "current_time": string }`.

### 4. `pantheon.sh`
Bash helper library for interacting with Pantheon environments via Terminus.
- `env_sha <env>`: retrieves deployed commit SHA from Pantheon code log.
- `latest_deployment <env>`: prints the commit SHA and status (`in_progress`, `success`, `failure`, or `pending`) of the newest GitHub deployment the Pantheon GitHub app recorded for the environment.
- `last_db_clone_at <env>`: prints the epoch time the environment's database was last replaced by a Pantheon "Clone database" workflow (0 if none in recent history).
- `wait_workflows <env> [timeout]`: waits (default 30m) for active Pantheon platform workflows to complete; fails if the latest workflow for the env failed.
- `drush <env> -- ...`: executes Drush with retries and quiet SSH output.

### 5. `live-precheck.sh`
Performs pre-deployment diagnostics on the live environment.
- Checks `config:status` and `updatedb:status`.
- Outputs strictly config names and states—**never config values or diffs**—to prevent leaking production secrets.

### 6. `deployment-record.sh`
Creates and updates GitHub Deployment records for auditability and tracks the count of successful manual releases.

### 7. `health-check.sh`
Runs Drupal runtime diagnostics using standard Drush commands (`core:requirements`, `updatedb:status`, `config:status`, `config:get`, `watchdog:show`) and fails on:
- System requirements errors. Skipped: `update_core`/`update_contrib` (available releases, which Dependabot and the daily security workflow handle), and the `automatic_updates` readiness check while unattended updates are disabled (Pantheon's code filesystem is read-only).
- Pending database updates.
- Configuration drift (names and states only, never values).
- Error-level watchdog entries logged after `--since-wid`, when given.
- Unattended automatic updates not disabled.

Any Drush call that fails also fails the check, so an unreachable site never reports healthy.

### 8. `vrt-diff-links.mjs`
For each failed visual comparison in a review-environment run, composes a side-by-side PNG (dev reference, review environment, Playwright's highlighted diff) and uploads it as its own unzipped artifact, so the PR comment can link to it from the "⚠️ Difference" cell. It runs through `actions/github-script` because artifact uploads need the Actions runtime token, which plain `run` steps don't get. Links require GitHub sign-in and expire after 14 days.

Dependencies (`@actions/artifact`, `pngjs`) are in `.github/ci/package.json`; install them with `npm ci --prefix .github/ci`.

### 9. `recreate-review-env.sh`
Backs the `/recreate-review-env` PR comment command and the automatic retry after Pantheon's "Failed to create multidev environment" comment (`review-env-recreate.yml`, at most two automatic retries per PR). Usage: `recreate-review-env.sh <pr-number> <reason>`; the reason becomes the commit body. It deletes the PR's `pr-N` multidev, waiting for any in-progress build first, waits for Pantheon's post-delete edge cleanup to finish (`wait_multidev_ops`; pushing during it makes the re-create fail), then pushes an empty commit to the PR branch through GitHub's GraphQL `createCommitOnBranch`, which GitHub signs, as the "Require Signed Commits" ruleset requires. The push uses the CI app's token so it triggers PR workflows. Pantheon then builds a fresh multidev and its "Successfully created" comment re-runs the review-env checks. Prints the new commit SHA.
