# ADR-0002: CI/CD Pipeline, Automated PR Testing, and Gated Live Deployment

- Status: Accepted
- Date: 2026-10-27
- Decision owners: CivicActions Homesite Team

## Context

The CivicActions homesite rebuild is hosted on Pantheon using their external repository integration with GitHub as the source of truth. Pantheon maintains three standing environments (`dev`, `test`, `live`) and builds multidev review environments (`pr-N`) for each pull request.

To maintain code quality, verify visual and functional parity across responsive viewports, and streamline security patching, we require:
1. Automated quality and health checks on all PRs against their disposable review environments.
2. Safe automatic merging of low-risk, verified Dependabot security updates.
3. Gated deployment to `test` and `live` that promotes code safely without per-environment git branches (trunk-based delivery).
4. Prevention of live configuration overwrites and secret leaks.

## Decision

1. **Trunk-Based Workflow without Environment Branches**:
   - `master` is the sole long-lived branch and tracks Pantheon's `dev` environment.
   - Code is promoted to `test` and `live` via Pantheon environment deployments (`terminus env:deploy`), not through gitflow branches.
2. **Review Environment Test Trigger**:
   - The Pantheon GitHub App creates/syncs review environments and posts a PR comment (`Successfully created multidev environment...`).
   - GitHub Actions triggers environment testing from this comment event, verifies the deployed commit matches the PR head (`PANTHEON_DEPLOYMENT_IDENTIFIER`), runs `drush deploy`, health diagnostics, Playwright functional/accessibility suites, and visual regression against `dev`.
   - Untrusted external fork PRs require maintainer manual dispatch before running against Pantheon.
3. **No Reference Images in Version Control**:
   - Visual regression captures `dev` baselines dynamically in the same job before comparing against the review environment across desktop (1440px) and mobile (390px) viewports.
   - Visual differences on developer PRs are informational and non-blocking; differences on dependency bot PRs block auto-merge.
4. **Dependabot Classification & Auto-Merge**:
   - Dependabot updates are classified by diffing lockfiles across all packages.
   - Only patch/minor updates resolving known advisories (with Drupal core strictly patch-only) and touching only manifest/lock files receive `deps:security-verified` and auto-merge.
5. **Gated Automated Live Deployment**:
   - Automatic promotion to `live` occurs only if:
     - All pending commits between `live` and `master` are verified security updates.
     - `dev` matches `master`.
     - `live` has zero configuration drift and zero pending database updates.
     - The current time is within the Monday–Thursday 09:00–15:00 PT window and not a US federal holiday.
     - A manual release track record of at least 5 successful deployments has been achieved.
     - The `AUTO_DEPLOY_ENABLED` repository kill switch is active.
6. **No Automated Live Config Export (Secret Protection)**:
   - Live configuration drift is strictly verified before deployments (`config:status`), surfacing only config names and states—never values or YAML diffs.
   - Automated export of live config into git/PRs is avoided to prevent leaking production secrets in public repositories. Resolving live drift is a manual developer task.
7. **Terminus Session Caching for CI**:
   - Workflows delegate Terminus setup and authentication to `pantheon-systems/terminus-github-actions`, passing the machine token directly to the action.
   - The action encrypts and restores `$HOME/.terminus/cache/session` using GitHub Actions cache (`actions/cache`), preserving active sessions across workflow jobs and avoiding Auth0 authentication rate limits.

## Consequences

- **Positive**:
  - Consistent, automated gate on all PRs before merge.
  - Accelerated security patch delivery for tested minor/patch updates.
  - Zero risk of overwriting active live configuration or exposing secrets.
  - Reliable visual comparison that accounts for dynamic Drupal content.
- **Negative / Trade-offs**:
  - Developers must resolve live configuration drift manually if content editors make unexported config changes on production.
  - If feature commits land on `master` ahead of `live`, automated security deployment pauses until a human performs a manual release.

## Alternatives considered

- **Gitflow / Environment Branches (`dev`, `test`, `live` branches)**: Rejected. Introduces merge overhead, branch divergence, and cherry-picking friction.
- **Pantheon "Push to Pantheon" Action**: Rejected. Requires a Pantheon-hosted Git repository and Build Tools, incompatible with Pantheon's external repository integration architecture on this site.
- **Committed Visual Baselines (BackstopJS / Static PNGs)**: Rejected. Flaky on dynamic CMS sites with changing editorial content.
- **Automated Daily Config Drift PR**: Evaluated and explicitly rejected. Risk of committing credentials or API keys added on production into a public repository.

## References

- [Pantheon External Repositories Guide](https://docs.pantheon.io/guides/external-repositories)
- [Pantheon Terminus Scripting & CI Authentication](https://docs.pantheon.io/terminus/scripting#authenticate-terminus-for-continuous-integration)
- [Spec: PR Testing, Dependency Auto-Merge, and Gated Live Deployment](../../specs/002-pr-ci-auto-deploy/spec.md)
- [Plan: Architecture & Contracts](../../specs/002-pr-ci-auto-deploy/plan.md)
