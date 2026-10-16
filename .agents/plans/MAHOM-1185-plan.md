# Plan: MAHOM-1185 Wire SDC Teasers and Responsive Grid for Views Listings

## Purpose

Public: Visitors browsing the Team, Case Studies, and Blog listings see cohesive, responsive cards using the CivicActions design system rather than unstyled core Drupal entity lists.

The backend Views configurations already exist in `civicactions_landing_page_views` (`ca_team`, `ca_articles`, `ca_news`, `ca_publications`, and `ca_case_studies`). This plan covers the remaining theme work: render teaser view modes through existing SDCs, preserve the MVP decision that Person cards are unlinked, and provide responsive Views grid presentation.

The core implementation and master merge are committed in PR #40 (commit `83c61c5`); the config-driven Media teaser view displays, entity access/cache-tag bubbling, News separator fixes, and canon updates are staged for the next commit. Existing environments require a targeted import of the Canvas editor and filter configurations and the Media/node teaser displays after deployment. A full repository config import is not safe while the module-owned Views remain database-managed and absent from the root config sync.

## Scope

- Add bundle-specific teaser templates for Person, Editorial, and Case Study nodes.
- Add theme preprocessing to map existing node fields and referenced media into the prop shapes expected by the existing teaser SDCs.
- Add responsive Views grid styling while preserving Drupal's existing Views item data and grouping behavior.
- Expose the existing Team profile-category taxonomy filter so the MVP listing can be narrowed by role category.
- Align Person Teaser surface and typography with the legacy flat staff grid while preserving linked focus states.
- Align active Editorial press/card typography with the legacy responsive body and heading scale.
- Match Team grid breakpoints and Case Study card crop/overlay to measured Gatsby output without changing the shared site shell.
- Verify the listing routes and a Views block placed on the disposable Canvas draft page.

### Out of Scope

- Full Case Study detail theming, owned by Iris under MAHOM-1186.
- Individual Person profile pages, deferred post-MVP.
- Backend Views filters, taxonomy migrations, or content-model changes.
- Section color-switch hardening, deferred until after the summit.

### Follow-up: Team Page Container Geometry

Team grid geometry has been measured at 375px, 768px, 1024px, 1200px, and 1280px. Portrait widths and column counts now match Gatsby; the local group remains 8-12px farther right because of the rebuilt page container. Do not change the global page-shell container in MAHOM-1185; track any tighter shell alignment separately because MAHOM-1187 owns the shared container contract.

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
- [x] Align Team portrait grids to Gatsby's 1/2/3/4/5-column progression at 375/768/1024/1200/1280px.
- [x] Match Case Study image crops, overlay typography, and desktop listing width to Gatsby; keep the optional summary prop available outside the listing.
- [x] Expose the existing Team profile-category filter and add update hook `9002` for already-enabled sites.
- [x] Remove the card shadow/surface treatment from Person Teaser and align name, role, and content spacing with the legacy staff grid.
- [x] Align Person desktop heading scale and Editorial press/card font family, body size, and line-height with legacy typography.
- [x] Rebuild Drupal caches and run focused PHP/Twig/CSS/JS validation.
- [x] Verify `/team`, `/case-studies`, and `/insights/articles`, including image alt text and link behavior.
- [x] Verify Team and Case Studies responsive geometry at 375px, 768px, 1024px, 1200px, and 1280px, including keyboard focus on a Case Study link.
- [ ] Verify a Case Study Views block inside the disposable Canvas draft page; local editor access was not available during this pass.

## Acceptance Criteria

- `/team` renders Person records through `omnichannel:person-teaser` with name, role, and image where available.
- Person cards and names on `/team` are not links.
- `/blog` and `/news` render Editorial records through the appropriate existing Editorial Teaser variant with title, description/date where available, and image where available.
- `/case-studies` renders Case Study records through `omnichannel:case-study-teaser` with client, title, image where available, and a working link; the optional summary remains supported by the SDC but is hidden in the listing for Gatsby parity.
- `/publications` renders White Paper Editorial records through the shared Editorial teaser path.
- Team and Case Studies grids reflow without horizontal overflow at 375px, 768px, 1024px, 1200px, and 1280px.
- Views blocks retain their styling when placed inside a Canvas Section.
- Drupal cache rebuild, theme linting, and focused browser checks pass, or blockers are documented.

## Validation Notes

- The local listing Views were initially unavailable because `civicactions_landing_page_views` was disabled. Enabling that existing module locally made the configured listing routes available without repository configuration changes.
- `/team` rendered a Person Teaser with name, role, and alt text, and no anchor around the card or name.
- `/case-studies` rendered a Case Study Teaser with client, title, image alt text, and a working canonical link. The SDC retains its optional summary prop, hidden only in the listing for Gatsby parity.
- `/insights/articles` rendered the configured Articles View using the Editorial Teaser card variant. `/blog` is not the configured local path.
- The CA News View uses `entity:node` teaser rows and the shared Editorial SDC render boundary. Local generated News fixtures render dated release text, titles, descriptions, and Full Story links.
- The CA Publications View uses `entity:node` teaser rows and the shared Editorial teaser path. Local generated Publications fixtures are available; fixture imagery may still be incomplete.
- A local full config import confirmed that the repository export currently deletes module-owned Views and uninstalls `civicactions_landing_page_views`; higher-environment validation must use a targeted Canvas configuration import until that configuration ownership is resolved.
- The Team View now exposes a multi-select `Team page category` filter with the available local taxonomy terms; its default remains unfiltered apart from the existing current-team constraints.
- Legacy comparison confirmed Person Teaser should be a flat portrait/name/role item: no background, border, shadow, or card hover surface. Local CSS now follows that treatment while retaining focus outlines for linked contexts.
- Legacy comparison confirmed Editorial News typography is already close; Editorial press/card typography uses the Nunito title family and responsive body scale.
- Gatsby Team grid counts match locally at 375px (one column), 768px (two), 1024px (three), 1200px (four), and 1280px (five), with 210px portraits and no overflow. Local portraits sit 8-12px farther right because the rebuilt page container was left unchanged.
- Gatsby Case Study card geometry matches locally at 375px (327x239), 768px (324x324, 1px shorter than Gatsby), 1024px (448x388), 1200px/1280px (584x426). Desktop cards use a 32px gap; the tablet grid uses 24px. The client/title overlay is bottom-aligned and summaries are hidden only in the listing.
- Gatsby `/press/` is the closest semantic comparison for local `/news`. The local teasers preserve release date, title, description, and Full Story link, but the Gatsby page heading/intro and release content are not reproduced by generated fixtures.
- Local Team and Case Studies routes have no page-level H1/intro and use View filter controls, unlike Gatsby's intro panels and category buttons/checkboxes. The shared header treatment differs too. These content, filter, and shell differences remain open for product/content direction and were not changed in this component pass.
- Keyboard Tab from the Case Studies Apply control reaches the first teaser link with a visible 3px blue outline and 3px offset. The disposable Canvas editor route redirected to Login, so palette and drag/drop placement remain unverified.
- The first render exposed and fixed a `public://` image URI passed into the SDC validator by converting file URIs through Drupal's `file_url_generator` service.
- The local Person image file is absent from the current fixture, so the browser screenshot shows the configured alt text while the image request fails. This is a local file-sync/content fixture gap, not a template discovery failure.
- Browser measurements used the local DDEV site and public Gatsby site at matched viewports. The local Case Studies route had no console errors/warnings or HTTP responses at 400+ across 85 requests, and all 11 teaser images had non-empty alt text. Drupal CSS lint and editor diagnostics pass.
- After selectively applying upstream Editorial News changes locally, the News child SDC declares and renders its structured image prop. `ddev lint-css`, `ddev drush cr`, and the local `/news` request pass; the route returns HTTP 200 and all four teaser images expose alt text.
- The Editorial teaser node template follows the existing `teaser_props` dispatcher pattern. `OmnichannelHooks::buildEditorialTeaserProps()` maps News/Whitepaper to the News variant and Article/Highlight to the Press card, retaining Jacqueline's taxonomy intent while using the established theme render boundary.
- Upstream `master` was cleanly merged into the feature branch in merge commit `83c61c5` on PR #40.
- Media teaser image styling was moved to Drupal configuration (`media.teaser` view mode and `media.image.teaser` display using `uncropped_600w_webp`), selected by each node teaser display. `OmnichannelHooks::getImageProp()` loads the configured style and transforms dimensions, eliminating the desktop image expansion and viewport overflow on `/news`.
- Scoped the News final-separator reset to `.view-ca-news .views-row:last-child .editorial-teaser-news`, preserving the legacy dashed red separator and 45px padding on preceding rows while removing them from the last row.
- Resolved Drupal peer review findings: added entity and field `view` access checks, bubbled access and cache tags for Media, files, displays, and image styles into Drupal preprocess `#cache` metadata, aligned teaser entity view displays (`schema_job_title`, `field_editorial_type`, `schema_client`), and standardized date formatting to `html_date`.
- Drupal discovers `omnichannel:editorial-teaser`; Canvas reports it eligible, and its generated component config exists and is enabled. The local component-status route returns 403 anonymously, so palette visibility and pointer drag-and-drop placement remain unverified.

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
- [Validate] -> in progress: cache rebuild, CSS lint, route checks, responsive geometry, and keyboard focus passed; Canvas placement and PR merge/review gates remain open.
- [Communicate] -> in progress: PR #40 is open with the implementation summary and remaining validation blockers documented.

_AI-assisted, reviewed/adjusted by me._
