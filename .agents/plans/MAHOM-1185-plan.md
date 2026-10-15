# Plan: MAHOM-1185 Wire SDC Teasers and Responsive Grid for Views Listings

## Purpose

Public: Visitors browsing the Team, Case Studies, and Blog listings see cohesive, responsive cards using the CivicActions design system rather than unstyled core Drupal entity lists.

The backend Views configurations already exist in `civicactions_landing_page_views` (`ca_team`, `ca_articles`, `ca_news`, `ca_publications`, and `ca_case_studies`). This plan covers the remaining theme work: render teaser view modes through existing SDCs, preserve the MVP decision that Person cards are unlinked, and provide responsive Views grid presentation.

The implementation is committed in PR #40. Existing environments require a targeted import of the Canvas editor and filter configurations after deployment to activate headings. A full repository config import is not safe while the module-owned Views remain database-managed and absent from the root config sync.

## Scope

- Add bundle-specific teaser templates for Person, Editorial, and Case Study nodes.
- Add theme preprocessing to map existing node fields and referenced media into the prop shapes expected by the existing teaser SDCs.
- Add responsive Views grid styling while preserving Drupal's existing Views item data and grouping behavior.
- Expose the existing Team profile-category taxonomy filter so the MVP listing can be narrowed by role category.
- Align Person Teaser surface and typography with the legacy flat staff grid while preserving linked focus states.
- Align active Editorial press/card typography with the legacy responsive body and heading scale.
- Verify the listing routes and a Views block placed on the disposable Canvas draft page.

### Out of Scope

- Full Case Study detail theming, owned by Iris under MAHOM-1186.
- Individual Person profile pages, deferred post-MVP.
- Backend Views filters, taxonomy migrations, or content-model changes.
- Section color-switch hardening, deferred until after the summit.

### Follow-up: Team Page Container Geometry

Compare the Team route's shared `.ca-container` horizontal padding with the legacy `.inner` geometry at wide desktop widths. Do not change the global page-shell container in MAHOM-1185; track this as a separate Team/page-layout parity ticket because MAHOM-1187 owns the shared container contract.

## Decisions

- Person teaser cards remain unlinked for MVP, matching the current product decision and the observed legacy Team listing behavior.
- Reuse the existing `person-teaser`, `editorial-teaser`, and `case-study-teaser` SDCs rather than introducing new listing components.
- Keep Views' generated row and column attributes intact; add the smallest theme CSS layer needed for responsive layout instead of rewriting Drupal's Views template without a demonstrated need.
- Keep node field extraction in the theme render boundary and escape URL attributes in Twig. Extend the existing trusted URL sanitation callback only if the new rendering path introduces a user-controlled URL prop that is not already covered.

## Implementation Details

- [x] Create feature branch `feature/MAHOM-1185-views-sdc-teasers` from `master`, preserving unrelated worktree changes.
- [x] Inspect the exact Person, Editorial, Case Study, and Media field storage contracts before implementing extraction.
- [x] Add `preprocessNode()` for teaser view modes, mapping only fields present on each bundle and avoiding assumptions about missing references.
- [x] Add `node--person--teaser.html.twig` using `omnichannel:person-teaser` with no profile link.
- [x] Add `node--editorial--teaser.html.twig` using `omnichannel:editorial-teaser` with the appropriate press/news variant for the view bundle.
- [x] Add `node--case-study--teaser.html.twig` using `omnichannel:case-study-teaser`.
- [x] Switch the existing CA News View from field rows to the Editorial node teaser and add update hook `9003` for already-enabled sites.
- [x] Add tokenized responsive styles for Views grids and exposed filters, without altering unrelated layout rules.
- [x] Expose the existing Team profile-category filter and add update hook `9002` for already-enabled sites.
- [x] Remove the card shadow/surface treatment from Person Teaser and align name, role, and content spacing with the legacy staff grid.
- [x] Align Person desktop heading scale and Editorial press/card font family, body size, and line-height with legacy typography.
- [x] Rebuild Drupal caches and run focused PHP/Twig/CSS/JS validation.
- [x] Verify `/team`, `/case-studies`, and `/insights/articles`, including image alt text and link behavior.
- [ ] Verify responsive layout at 375px, 768px, and 1200px and inspect a Views block inside the disposable Canvas draft page.

## Acceptance Criteria

- `/team` renders Person records through `omnichannel:person-teaser` with name, role, and image where available.
- Person cards and names on `/team` are not links.
- `/blog` and `/news` render Editorial records through the appropriate existing Editorial Teaser variant with title, description/date where available, and image where available.
- `/case-studies` renders Case Study records through `omnichannel:case-study-teaser` with client, title, summary, image where available, and a working case-study link.
- `/publications` renders White Paper Editorial records through the shared Editorial teaser path.
- Views grids reflow without horizontal overflow at 375px, 768px, and 1200px.
- Views blocks retain their styling when placed inside a Canvas Section.
- Drupal cache rebuild, theme linting, and focused browser checks pass, or blockers are documented.

## Validation Notes

- The local listing Views were initially unavailable because `civicactions_landing_page_views` was disabled. Enabling that existing module locally made the configured listing routes available without repository configuration changes.
- `/team` rendered a Person Teaser with name, role, and alt text, and no anchor around the card or name.
- `/case-studies` rendered a Case Study Teaser with client, title, summary, image alt text, and a working canonical link. The rendered grid computed to two columns at the available desktop viewport.
- `/insights/articles` rendered the configured Articles View using the Editorial Teaser card variant. `/blog` is not the configured local path.
- The CA News View now uses `entity:node` teaser rows so `/news` follows the same Editorial SDC render boundary; local `/news` currently returns no rows despite the route and active view configuration being present.
- The CA Publications View already uses `entity:node` teaser rows and the shared Editorial teaser path; local `/publications` currently returns no rows despite the route and active view configuration being present.
- A local full config import confirmed that the repository export currently deletes module-owned Views and uninstalls `civicactions_landing_page_views`; higher-environment validation must use a targeted Canvas configuration import until that configuration ownership is resolved.
- The Team View now exposes a multi-select `Team page category` filter with the available local taxonomy terms; its default remains unfiltered apart from the existing current-team constraints.
- Legacy comparison confirmed Person Teaser should be a flat portrait/name/role item: no background, border, shadow, or card hover surface. Local CSS now follows that treatment while retaining focus outlines for linked contexts.
- Legacy comparison confirmed Editorial News typography is already close; Editorial press/card typography needed the Nunito title family and responsive body scale now applied locally. Case Study overlay typography remains a separate follow-up because its entire visual treatment differs.
- The first render exposed and fixed a `public://` image URI passed into the SDC validator by converting file URIs through Drupal's `file_url_generator` service.
- The local Person image file is absent from the current fixture, so the browser screenshot shows the configured alt text while the image request fails. This is a local file-sync/content fixture gap, not a template discovery failure.
- The `bdg` CLI was available but could not establish a CDP session for the requested 375px, 768px, and 1200px measurements. Responsive and disposable Canvas placement remain open verification items.

## Risks

- Media references may be empty or use different image field names by bundle. The implementation must guard field access and use the existing Media image field contract rather than assuming every node has an image.
- Editorial Views distinguish Articles and News by view configuration, not necessarily by node bundle. The implementation must inspect the actual view/node variables before selecting the Editorial Teaser variant.
- Canvas and local DDEV verification may be blocked by authentication or the failed Pantheon pull. Local template and lint validation should proceed independently.

## Skill Usage

| Phase | Skill | Purpose |
| :--- | :--- | :--- |
| Build | `omnichannel-sdc` | Apply the theme's SDC, Twig, escaping, and prop conventions. |
| Build | `legacy-compare` | Preserve observable Team and Case Study listing behavior without copying legacy implementation details. |
| Validate | `theme-lint` | Run the focused theme lint commands after CSS, Twig, or PHP changes. |
| Validate | `browser-check` | Inspect rendered routes, DOM, images, links, and console output. |
| Validate | `canvas-verify` | Verify a Views block on the disposable Canvas draft page if local access is available. |
| Validate | `accessibility-audit` | Check headings, image alternatives, link semantics, and keyboard behavior. |
| Validate | `responsive-design` | Check the required mobile, tablet, and desktop widths. |
| Validate | `frontend-peer-review` | Review the final frontend surface before communication. |
| Session end | `handoff-message` | Record implementation and validation status. |

## Workflow-State Field Requirements

- [Triage] -> completed: Task classification and `OmnichannelBuild` label.
- [Refinement] -> completed: Purpose, scope, acceptance criteria, implementation details, and estimate.
- [Plan] -> completed: this plan saved at `.agents/plans/MAHOM-1185-plan.md`.
- [Build] -> completed: feature branch implementation added and committed in PR #40.
- [Validate] -> needs: local cache rebuild, lint, route checks, responsive checks, and Canvas verification where available.
- [Communicate] -> in progress: PR #40 is open with the implementation summary and remaining validation blockers documented.

_AI-assisted, reviewed/adjusted by me._
