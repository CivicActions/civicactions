# Plan: MAHOM-1203 Views Pager Styling

## Purpose

Match the legacy CivicActions pagination pattern across multi-page listings while retaining Drupal Views' generated links and query parameters.

The legacy pager shows a centered three-part row: Back, Page X of Y, and Next. The first and last pages omit the unavailable link. The initial implementation kept Drupal's numbered full pager and diverged from that behavior. This follow-up replaces the numbered control with the measured legacy pattern while retaining the nav landmark, keyboard focus, and minimum 44px touch target.

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

- **Observed Legacy Behavior (`https://civicactions.com/press/2/`):**
  - The row contains Back, Page 2 of 3, and Next. It has no page-number, First, or Last links.
  - Back and Next use uppercase Nunito Bold at 18px, white text, a red background, 12px by 24px padding, and a dark hover/focus background.
  - At 1920px, the pager's centered inner row measures 720px wide; the buttons are 60px tall.
  - At 375px, the row remains on one line, the page summary wraps to two lines, and the document has no horizontal overflow.
- **Omnichannel / Drupal Architecture Decision:**
  - Keep Drupal's full pager for the current multi-page content listings so it continues to provide accurate total-page counts and generated URLs.
  - Add the total page count to the pager template variables through the theme preprocess hook, then render only the legacy Back, Page X of Y, and Next controls.
  - The active Articles, News, and Publications Views use the full pager. Team and Case Studies do not currently paginate. No Views configuration change is needed for this theme-only output change.

## Scope

### In Scope

- **Styling (`pager.css`):**
  - Match the legacy red primary-button appearance with white uppercase Nunito text and a dark hover/focus state.
  - Reuse the existing `omnichannel:link-button` SDC instead of duplicating button styles.
  - Center the three-part row in the 720px narrow container, with responsive behavior that allows the page summary to wrap at narrow widths.
  - Keep a visible `:focus-visible` outline using the theme focus tokens.
  - Use the Link Button SDC for the exact legacy button typography, colors, spacing, and interaction states; use theme tokens for pager spacing and width.
  - Encapsulate styles with `@scope (.ca-pager)` and retain the BEM fallback.
- **Templates (`pager.html.twig` & `views-mini-pager.html.twig`):**
  - Render previous and next links only when Drupal provides them, using the visible labels Back and Next.
  - Render the current and total page numbers as Page X of Y for full pagers.
  - Keep query parameters, `rel` attributes, and Drupal-generated URLs.
  - Keep mini pager controls styled consistently; mini pagers do not provide a reliable total-page count.

### Out of Scope

- Modifying Views query configuration, pager types, pager limits, or exposed filters.
- Exporting or importing Views configuration from Pantheon Live, which has known unsynced morning changes.
- Infinite scroll widgets or client-side pagination JS.
- Editing `page.html.twig` or global shell layout (held for PR #45 coordination).

## Implementation Details

- [x] Create feature branch `feature/MAHOM-1203-views-pager-styling` from `master`.
- [x] Update `web/themes/omnichannel/templates/navigation/pager.html.twig`:
  - Render Back and Next links when available, with an empty slot at the first/last page.
  - Render Page X of Y using the current and total page count.
  - Render previous/next controls through the Link Button SDC for the legacy button appearance.
- [x] Update `web/themes/omnichannel/templates/views/views-mini-pager.html.twig`:
  - Use the same Back/Next button styling and current page label; do not invent a total for the count-optimized mini pager.
- [x] Add a `preprocess_pager` hook in `OmnichannelHooks` to expose the full pager's actual total page count.
- [x] Refactor `web/themes/omnichannel/css/components/pager.css`:
  - Match the legacy primary-button colors, typography, spacing, and hover state.
  - Keep the row centered in the 720px narrow width and verify mobile wrapping.
  - Retain `:focus-visible` styling and 44px minimum target sizing.
  - Scope rules with `@scope (.ca-pager)` and provide unscoped BEM fallbacks.
- [x] Validate CSS and JS with `ddev lint-css` and `ddev lint-js`.
- [x] Rebuild caches with `ddev drush cr`.
- [x] Verify rendered output on active multi-page listings (`ca_articles` at first, middle, and last page).
- [x] Verify keyboard tab navigation and responsive layout at 375px, 768px, and 1280px.

## Acceptance Criteria

- [x] Full pager renders Back | Page X of Y | Next, with no page-number, First, or Last links.
- [x] Previous and Next are omitted at the first and last page, respectively.
- [x] Buttons match the legacy red/white uppercase appearance and reach at least 44px by 44px.
- [x] Focus remains visible on keyboard navigation; no horizontal overflow at 375px.
- [x] Views AJAX pagination continues to function correctly.
- [x] `ddev lint-css` passes with 0 errors.

## Validation Notes

- `ddev lint-css`, `ddev lint-js`, and PHP syntax validation passed; Drupal caches rebuilt successfully.
- Direct Views rendering showed Page 1 of 12, Page 2 of 12, and Page 12 of 12. Back/Next URLs kept the expected `page` query parameter; boundary links were omitted.
- Local browser check on `/insights/articles` showed a 720px centered pager at desktop, 60px red buttons, the exact Back / Page X of Y / Next structure, and no document overflow at 375px, 768px, or 1280px.
- Next and Back both triggered `/views/ajax` and updated the pager without a full-page navigation.
- Keyboard Tab moved focus into the pager and exposed a 3px primary-blue focus outline. Browser console reported no errors or warnings.
- Direct Drush rendering also logged a pre-existing `Missing text format: basic_html` warning from local content. It did not prevent pager rendering. Local config status still reports `views.view.ca_publications` as different from Git; no Views configuration was changed or imported.

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
- [x] **Validate** -> `ddev lint-css` passing, rendered listing and responsive behavior verified, local cache cleared.
- [ ] **Communicate** -> PR opened against `master`, closure notes drafted.

_AI-assisted, reviewed/adjusted by me._
