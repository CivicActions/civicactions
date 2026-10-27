# Plan: MAHOM-1203 Views Pager Styling

## Purpose

Make Drupal Views pagination clear, accessible, and consistent with the CivicActions design system across all multi-page listings (`/insights/articles`, `/news`, `/publications`).

Currently, `web/themes/omnichannel/css/components/pager.css` retains legacy Drupal core unstyled float/inline CSS (`display: inline; padding: 0.5em;`). It lacks brand token styling, visible keyboard focus rings, active page indicators, disabled state semantics, and WCAG 2.1 AA compliant 44px mobile touch targets.

This ticket delivers token-driven, accessible styling for full Views pagers (`pager.html.twig`) and mini pagers (`views-mini-pager.html.twig`) while preserving Drupal Views' existing AJAX behavior.

## Context & Source Branch Inspection

- **Tracker:** [MAHOM-1203](https://civicactions.atlassian.net/browse/MAHOM-1203), Backlog / Ready for Development
- **Base Branch:** `master` (commit `f37d28f` / PR #44)
- **Feature Branch:** `feature/MAHOM-1203-views-pager-styling`
- **Complexity / Estimate:** Small (4h)
- **Priority:** Normal (Elevated to Major due to WCAG 2.1 AA Target Size / Focus Visible requirements)
- **Team Non-Interference:**
  - **Zero file overlap with PR #45:** Iris Ibekwe's open PR #45 (MAHOM-1162 Case Study Theming) touches `page.html.twig`, `OmnichannelHooks.php`, `node.html.twig`, and Case Study configs. It does not touch any pager CSS or templates.
  - **Zero database config risk:** MAHOM-1203 operates 100% in the theme layer (`web/themes/omnichannel/`). It carries no database configuration changes and does not conflict with active morning configuration on Pantheon Live.

## Legacy Comparison Findings (`/legacy-compare`)

- **Observed Legacy Behavior (`https://civicactions.com/press/`):**
  - Legacy Gatsby site implemented a 3-part flex bar: `[Back button]` + `Page <strong>X</strong> of Y` + `[Next button]`.
  - Buttons used the primary button pattern: red background (`#d83933`), uppercase bold Nunito text (18px), 12px 24px padding, and dark hover (`#171717`).
  - No individual page number links were rendered.
- **Omnichannel / Drupal Architecture Decision:**
  - Per `docs/plans/component-migration.md` (row 33), the rebuild preserves standard Drupal Views pagination (`pager.html.twig` full pager and `views-mini-pager.html.twig` mini pager) to support standard Views AJAX and multi-page indexing out of the box.
  - The styling must modernize Drupal core's pagination controls using CivicActions design tokens, provide 44px mobile touch targets, and cleanly display active, hover, focus, and disabled states.

## Scope

### In Scope

- **Styling (`pager.css`):**
  - Replace unstyled Drupal core CSS with responsive flexbox layout.
  - Style pager links (`.pager__link`, `.ca-pager__link`) using brand tokens: `--primary-blue`, `--primary-red`, `--white`, `--gray-05`, `--gray-10`, `--gray-30`, `--gray-50`, `--gray-70`.
  - Enforce 44px x 44px minimum touch targets across all viewports (`min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center;`).
  - Style current page (`.is-active`, `aria-current="page"`) with solid primary blue background, primary blue border, and bold white text.
  - Style visible keyboard focus (`:focus-visible`) with `outline: var(--focus-outline-width, 3px) solid var(--primary-blue)` and `outline-offset: var(--focus-outline-offset, 3px)`.
  - Style disabled controls (`.is-disabled`, `aria-disabled="true"`) for unavailable Previous/Next actions with 0.45 opacity, `--gray-50` color, and disabled pointer events.
  - Style ellipsis (`.pager__item--ellipsis`) with centered alignment and clear visual separation.
  - Encapsulate styles with `@scope (.ca-pager)` alongside unscoped BEM fallback.
- **Templates (`pager.html.twig` & `views-mini-pager.html.twig`):**
  - Add `.ca-pager` namespace and BEM element classes (`ca-pager__items`, `ca-pager__item`, `ca-pager__link`).
  - Output disabled Previous control on page 1 and disabled Next control on the last page.
  - Ensure `aria-current="page"` is applied to the active page item without duplication.

### Out of Scope

- Modifying Views query configuration, pager limits, or exposed filters (owned by MAHOM-1193 / MAHOM-1202).
- Infinite scroll widgets or client-side pagination JS.
- Editing `page.html.twig` or global shell layout (held for PR #45 coordination).

## Implementation Details

- [x] Create feature branch `feature/MAHOM-1203-views-pager-styling` from `master`.
- [x] Update `web/themes/omnichannel/templates/navigation/pager.html.twig`:
  - Add `.ca-pager` classes.
  - Output disabled Previous item with `is-disabled` and `aria-disabled="true"` when on first page.
  - Output disabled Next item with `is-disabled` and `aria-disabled="true"` when on last page.
  - Ensure `aria-current="page"` and `title="{{ 'Current page'|t }}"` on active page.
- [x] Update `web/themes/omnichannel/templates/views/views-mini-pager.html.twig`:
  - Add `.ca-pager` and `.ca-pager--mini` classes.
  - Ensure disabled Previous/Next items render when unavailable.
- [x] Refactor `web/themes/omnichannel/css/components/pager.css`:
  - Implement flexbox container with `gap: var(--size-2, 0.5rem)` and `justify-content: center`.
  - Apply 44px minimum touch targets and tokenized border/colors to interactive items.
  - Add `:hover`, `:focus-visible`, `.is-active`, and `.is-disabled` states.
  - Scope rules with `@scope (.ca-pager)` and provide unscoped BEM fallbacks.
- [x] Validate CSS and JS with `ddev lint-css` and `ddev lint-js`.
- [x] Rebuild caches with `ddev drush cr`.
- [x] Verify rendered output on active multi-page listings (`ca_articles` at page 0, page 1, and last page).
- [ ] Verify keyboard tab navigation and responsive flexbox wrapping at 375px mobile width.

## Acceptance Criteria

- [x] Active/current page is visually distinct (solid primary blue background, white text) and carries `aria-current="page"`.
- [x] Visible high-contrast focus ring (`outline: 3px solid var(--primary-blue)`) appears on keyboard `:focus-visible`.
- [x] Unavailable Previous control is visibly disabled on page 1; unavailable Next control is visibly disabled on the last page.
- [x] All interactive controls meet or exceed 44px x 44px touch target dimensions.
- [x] Controls wrap cleanly without horizontal overflow on mobile viewports down to 375px.
- [x] Views AJAX pagination continues to function correctly without broken selectors.
- [x] `ddev lint-css` passes with 0 errors.

## Skill Usage Mapping

| Skill | Phase | Purpose |
| :--- | :--- | :--- |
| `legacy-compare` | Pre-plan | Compare against legacy Gatsby `/press/` 3-part pagination behavior. |
| `issue-plan` | Planning | Author this formal project plan file in `.agents/plans/`. |
| `theme-lint` | Validation | Run `ddev lint-css` and `ddev lint-js` against changed theme files. |
| `accessibility-audit` | Validation | Confirm WCAG 2.1 AA compliance (touch targets, contrast, focus rings). |
| `commit-message-writer` | Finalization | Format conventional commit message for PR submission. |

## Workflow States & Field Requirements

- [x] **Triage** -> Title, Problem/Motivation, Backlog state in Jira MAHOM.
- [x] **Refinement** -> Acceptance criteria, SDC/Twig structure, token references defined.
- [x] **Plan** -> Assigned to Jack Haas, implementation plan created at `.agents/plans/MAHOM-1203-plan.md`.
- [x] **Build** -> Feature branch `feature/MAHOM-1203-views-pager-styling`, code implemented.
- [x] **Validate** -> `ddev lint-css` passing, rendered listing verified, local cache cleared.
- [ ] **Communicate** -> PR opened against `master`, closure notes drafted.

_AI-assisted, reviewed/adjusted by me._
