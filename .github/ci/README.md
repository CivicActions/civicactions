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
- `missing_files <env>`: prints how many managed files have no file on disk. Review-env compares this with dev, re-copies files from dev (files only) if the PR environment is missing more, and fails suggesting `/recreate-review-env` if that doesn't fix it.
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
Backs the `/recreate-review-env` PR comment command and the automatic retry after Pantheon's "Failed to create multidev environment" comment (`review-env-commands.yml`, at most two automatic retries per PR). Usage: `recreate-review-env.sh <pr-number> <reason>`; the reason becomes the commit body. It deletes the PR's `pr-N` multidev, waiting for any in-progress build first, then waits until no Pantheon multidev operations are running and the last delete finished at least 3 minutes ago (`wait_multidev_ops 1200 180`). Creates that started during a delete, or up to a minute after one, failed, then pushes an empty commit to the PR branch through GitHub's GraphQL `createCommitOnBranch`, which GitHub signs, as the "Require Signed Commits" ruleset requires. The push uses the CI app's token so it triggers PR workflows. Pantheon then builds a fresh multidev and its "Successfully created" comment re-runs the review-env checks. Prints the new commit SHA.

### 10. `visual-status.mjs`
Decides the `ci/visual` status from the visual comparison results, and records and finds `/approve-visual` approvals.
- `decide --results <results.json> [--approval <json>] [--content-stale]`: prints `{ state, description }`. No differences passes. Differences fail unless approved, with a description that suggests `/approve-visual`, or `/refresh-content` too when the content is older than dev. Screenshots that couldn't be compared, or no results at all, are an error that suggests `/rerun-review-env`.
- `marker --tree <sha> --head <sha> --by <login>`: prints the hidden approval marker that `review-env-commands.yml` adds to its approval comment.
- `find-approval --tree <sha> --bot <login>`: reads PR comments (`gh api --paginate --slurp`) on stdin and prints the latest approval for that git tree, if any. Only markers in comments by the CI app (`--bot`) count. Keying approvals to the tree means commits that change no files, such as recreate commits, keep them.

### 11. `../actions/update-gate/gate.mjs`
Computes `ci/gate`, the single required check, from `ci/static`, `ci/review-env` and `ci/visual`: success when all three pass, failure when any fails or errors, otherwise pending. `node gate.mjs <sha>` (with `GH_TOKEN` and `REPO`) reads the commit's statuses and posts the gate. The `update-gate` composite action and the review-env sweeper both run it, so the logic lives in one place.

### PR comment commands (`review-env-commands.yml`)
Anyone with write access can comment these on an open PR from this repository. The command is the first word of the comment.

| Command | What it does |
|---|---|
| `/approve-visual [reason]` | Accepts the current head's visual differences: posts an approval comment with the marker, sets `ci/visual` to success and updates the gate. Refused unless `ci/visual` for the current head is `failure` or `error`. |
| `/refresh-content` | Dispatches `pr-review-env.yml` with `refresh_content`, which copies dev's database and files to `pr-N` and then runs the checks. |
| `/rerun-review-env` | Dispatches `pr-review-env.yml` to re-run the checks. |
| `/recreate-review-env` | Runs `recreate-review-env.sh` (section 9). |

The dispatched runs share the per-PR review-env concurrency group, so a content copy never overlaps a running check.

