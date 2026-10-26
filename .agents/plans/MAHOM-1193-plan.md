# Plan: MAHOM-1193 Lock Down Config Ownership in Git

## Purpose

This ticket resolves the primary operational safety blocker for the CivicActions homesite rebuild.

Currently, the landing page Views (`ca_team`, `ca_articles`, `ca_news`, `ca_publications`, and `ca_case_studies`) and their corresponding Drupal Canvas block wrappers (`canvas.component.block.views_block.*.yml`) exist only in the active database. They are missing from Git root `config/`, and the module providing them (`civicactions_landing_page_views`) is omitted from `config/core.extension.yml`.

Because Drupal config synchronization (`drush cim`) enforces Git as the source of truth, any deployment or routine config import on Pantheon Live will immediately uninstall `civicactions_landing_page_views`, delete all five Views, and wipe out the Canvas block wrappers. This would erase the Team listing already placed on Canvas Page 9 and break all other landing pages.

Locking down config ownership in Git ensures deployments are safe and config imports preserve existing page assemblies.

## Sequencing in MVP Launch Plan: Step 0 (Absolute Prerequisite)

This task must happen **first, before anything else in the MVP launch plan**:

1. **Safety prerequisite for all deployments:** Any downstream backend or frontend deployment (Webforms under MAHOM-1200, Greenhouse module enabling, or node theming under MAHOM-1162) will execute `drush cim` on Pantheon. If MAHOM-1193 is not merged first, every deployment threatens to wipe the Live database state.
2. **Hard blocker for Wednesday 5 PM ET Content Cowork:** Jenna and the content team are scheduled to assemble Canvas pages (`/case-studies`, `/insights/articles`, `/news`, `/publications`, and `/careers`) on Wednesday. Placing Views blocks on those pages requires stable, Git-tracked Canvas block configuration entities. If authors place blocks on Live before this config is in Git, the next code deployment will erase their placements.
3. **Prerequisite for Views feature tickets:** MAHOM-1202 (Team filters and default current status) and MAHOM-1203 (Views pager styling) directly modify these Views. The Views must be tracked in Git root `config/` before they can be revised and deployed through version control.

Conclusion: MAHOM-1193 must be completed, verified, and merged to `master` as Step 0 before Wednesday's cowork and before any further configuration imports on Test or Live.

## Scope

### In Scope

- Add `civicactions_landing_page_views: 0` to `config/core.extension.yml`.
- Add the five landing page Views configurations to `config/`:
  - `config/views.view.ca_articles.yml`
  - `config/views.view.ca_case_studies.yml`
  - `config/views.view.ca_news.yml`
  - `config/views.view.ca_publications.yml`
  - `config/views.view.ca_team.yml`
- Add the five Canvas block component wrappers to `config/`:
  - `config/canvas.component.block.views_block.ca_articles-block_1.yml`
  - `config/canvas.component.block.views_block.ca_case_studies-block_1.yml`
  - `config/canvas.component.block.views_block.ca_news-block_1.yml`
  - `config/canvas.component.block.views_block.ca_publications-block_1.yml`
  - `config/canvas.component.block.views_block.ca_team-block_1.yml`
- Verify a clean two-way synchronization on local DDEV (`ddev drush cim -y` followed by `ddev drush cex -y` yields a clean git status).
- Merge to `master` and document deployment instructions for Pantheon Test and Live.

### Out of Scope

- Bulk-copying the full config export from the `../civicactions-mahom-1194` worktree. That worktree contains stale database exports that revert CKEditor 5 headings (MAHOM-1192) and older SDC canvas metadata. Only the 11 target files are in scope.
- Modifying View filters, sorts, or taxonomy relationships (owned by MAHOM-1202).
- Pager styling and 44px mobile touch targets (owned by MAHOM-1203).
- Placing Views blocks on Canvas pages (owned by the content team during the Wednesday cowork).
- Webform module installation or DITAP/Contact forms (owned by MAHOM-1200).
- Enabling or configuring `civicactions_greenhouse`.

## Decisions

- **Surgical file transfer instead of full directory export:** Inspection of `../civicactions-mahom-1194` revealed that a general `drush cex` in that worktree modified 23 files, including removing H2-H6 headings in `editor.editor.canvas_html_block.yml` and modifying `canvas.component.sdc.omnichannel.card.yml`. We will selectively stage only the 10 new YAML files plus the `core.extension.yml` entry.
- **Maintain existing UUIDs and dependencies:** The Canvas block wrappers depend on `views.view.ca_*`. Exported UUIDs from the existing database will be preserved to prevent entity recreation or orphaned block placements on Live.
- **Verification on clean database:** Before opening a PR or merging, test `drush cim` against a local database to confirm Drupal recognizes the module as already installed and does not drop any tables or views.

## Implementation Details

- [ ] Check out or rebase the working branch `chore/MAHOM-1193-config-ownership` from latest `master` (commit `5eba9d8` or newer).
- [ ] Add `civicactions_landing_page_views: 0` to `config/core.extension.yml` in alphabetical order under `module:`.
- [ ] Surgically copy the five View configuration files from `../civicactions-mahom-1194/config/` to `config/`:
  - `config/views.view.ca_articles.yml`
  - `config/views.view.ca_case_studies.yml`
  - `config/views.view.ca_news.yml`
  - `config/views.view.ca_publications.yml`
  - `config/views.view.ca_team.yml`
- [ ] Surgically copy the five Canvas block component wrappers from `../civicactions-mahom-1194/config/` to `config/`:
  - `config/canvas.component.block.views_block.ca_articles-block_1.yml`
  - `config/canvas.component.block.views_block.ca_case_studies-block_1.yml`
  - `config/canvas.component.block.views_block.ca_news-block_1.yml`
  - `config/canvas.component.block.views_block.ca_publications-block_1.yml`
  - `config/canvas.component.block.views_block.ca_team-block_1.yml`
- [ ] Run `git diff config/` to verify that no unrelated config files (such as `editor.editor.canvas_html_block.yml` or SDC configs) were touched.
- [ ] Run `ddev drush cim -y` on local DDEV and inspect output to confirm zero deletions of Views or Canvas block components.
- [ ] Rebuild caches with `ddev drush cr`.
- [ ] Run `ddev drush cex -y` and verify `git status config/` remains clean, proving complete two-way config parity.
- [ ] Verify local routes `/team`, `/case-studies`, `/insights/articles`, `/news`, and `/publications` resolve with HTTP 200.
- [ ] Verify in the Canvas editor on disposable draft page `/canvas/editor/canvas_page/1` that `CA Team`, `CA Articles`, `CA News`, `CA Publications`, and `CA Case Studies` appear in the block component palette.
- [ ] Commit changes with message `chore(config): lock down landing page views and canvas block configs in git (MAHOM-1193)`.
- [ ] Merge to `master` and push to trigger Pantheon deployment.
- [ ] Verify on Pantheon Test with `terminus drush civicactions.test -- cim -y` that config imports cleanly without entity deletions.

## Acceptance Criteria

- `config/core.extension.yml` contains `civicactions_landing_page_views: 0`.
- All five landing page Views YAML files are present in `config/`.
- All five Canvas block wrapper YAML files are present in `config/`.
- Running `drush cim` does not report any pending deletions of `ca_*` Views, `views_block` components, or `civicactions_landing_page_views`.
- Running `drush cex` immediately after import produces no diff.
- Live Canvas page 9 (`/team`) retains its placed `ca_team-block-1` component after config synchronization.
- No regressions to CKEditor 5 headings, SDC definitions, or AI configurations.

## Risks

- **Stale config pollution:** The `../civicactions-mahom-1194` worktree contains uncommitted changes from an earlier database dump that revert MAHOM-1192. A blanket copy would reintroduce regressions. Mitigation: Strict manual whitelist of the 11 required files.
- **UUID divergence between environments:** If the local database has different UUIDs from Pantheon Live for the Views, importing may attempt to recreate them. Mitigation: Confirm exported YAML UUIDs match the entities generated when `civicactions_landing_page_views` was initially installed on Live. Test on Pantheon Test before running on Live.
- **Accidental deployment before merge:** A deployment from `master` prior to this fix would trigger Pantheon Quicksilver or manual `drush cim`, wiping Live. Mitigation: Do not trigger Pantheon builds or run `drush cim` on Live until this PR is merged.

## Complexity & Estimate

- **Complexity:** Small (surgical config addition and import verification).
- **Estimate:** 2h (including local and Pantheon Test import validation).

## Skill Usage

| Phase | Skill | Purpose |
| :--- | :--- | :--- |
| Build | `evidence-check` | Verify git diff and ensure no stale configs from the worktree are imported. |
| Build | `pattern-alignment` | Check config YAML structure against Drupal CMS and project standards. |
| Validate | `canvas-verify` | Verify Canvas block wrappers are discovered and usable in the Canvas editor. |
| Validate | `browser-check` | Verify local listing routes continue rendering without 404 or 500 errors. |
| Validate | `drupal-peer-review` | Inspect `core.extension.yml` and config dependencies before staging. |
| Pre-push | `commit-message-writer` | Format commit message following project conventional commit standards. |
| Session end | `handoff-message` | Document deployment readiness and notify content team for the Wednesday cowork. |

### Excluded Skills

- `omnichannel-sdc`: No SDCs or Twig templates are created or modified.
- `storybook-story`: Backend configuration only; no Storybook preview components involved.
- `legacy-compare`: Visual parity was handled in MAHOM-1185; this is purely configuration management.
- `theme-lint`: No theme CSS, JavaScript, or Twig files are modified.
- `responsive-design`, `accessibility-audit`: No frontend layout or markup changes.

## Workflow-State Field Requirements

- [Triage] -> completed: Issue tracked under Jira `MAHOM-1193`, labeled `OmnichannelBuild`, classified as Critical priority.
- [Refinement] -> completed: Problem, exact config files, safety justification, and 2h estimate established.
- [Plan] -> completed: Implementation plan saved to `.agents/plans/MAHOM-1193-plan.md`.
- [Build] -> needs: Feature/chore branch rebased on `master`, surgical addition of 10 YAML files plus `core.extension.yml` entry.
- [Validate] -> needs: Clean `ddev drush cim -y` and `ddev drush cex -y` pass, route validation, and Canvas component tray verification.
- [Communicate] -> needs: PR or direct commit to `master`, closure notes informing team that `drush cim` is now safe on Test/Live, and notification to Jenna prior to Wednesday 5 PM cowork.

_AI-assisted, reviewed/adjusted by me._
