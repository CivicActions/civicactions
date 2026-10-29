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
- `deploy_id <env>`: retrieves short deployment identifier via `drush php:eval`.
- `wait_workflows <env>`: waits for active Pantheon platform workflows to complete.
- `drush <env> -- ...`: executes Drush with retries and quiet SSH output.

### 5. `live-precheck.sh`
Performs pre-deployment diagnostics on the live environment.
- Checks `config:status` and `updatedb:status`.
- Outputs strictly config names and states—**never config values or diffs**—to prevent leaking production secrets.

### 6. `deployment-record.sh`
Creates and updates GitHub Deployment records for auditability and tracks the count of successful manual releases.

### 7. `health-check.sh` & `drupal/health.php`
Runs comprehensive Drupal runtime diagnostics via Drush and outputs JSON:
- System requirements errors.
- Pending database updates.
- Configuration drift (names and states).
- Config schema validation.
- Watchdog log entries logged during the run.
- Verification that unattended automatic updates are disabled.
