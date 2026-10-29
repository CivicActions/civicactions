# CivicActions Homesite Canon

Status: Active public technical canon
Audience: Contributors working on the CivicActions homesite rebuild
Last reviewed: 2026-10-19

This document records the public-facing architecture, design-system rules, and component conventions for the homesite rebuild. It is intentionally distilled from project work rather than copied from internal discovery notes.

## Scope and source of truth

- Repository code is authoritative for current behavior.
- This canon records shared standards, rationale, and target behavior.
- Architecture decisions belong in `docs/decisions/`.
- SDC prop and slot contracts belong in each component's `.component.yml` file.
- Rendered component examples belong in the theme-local Storybook and Drupal Canvas.
- Personal plans, handoffs, raw discovery notes, operational URLs, and private design references do not belong in this public repository.

When the docs and code disagree, label the gap as current state or target state, then resolve it through a focused change or ADR. Do not document an aspiration as current behavior.

## Platform architecture

The site uses Drupal 11 and Drupal CMS 2.0 on Pantheon. Drupal provides content management, routing, permissions, and publishing. Drupal Canvas provides visual page composition. The production theme is `web/themes/omnichannel/`, based on Drupal's starter theme and extended with Twig Single Directory Components.

The frontend is server-rendered Twig with component-local CSS. The theme-local Storybook provides isolated previews for component props and variants. Storybook does not replace Canvas verification for Drupal slots, entity registration, or editor behavior.

## Component standards

Each SDC lives under `web/themes/omnichannel/components/<name>/` and normally contains:

- `<name>.component.yml` for the typed prop and slot contract
- `<name>.twig` for semantic markup
- `<name>.css` for component-local styles
- `<name>.stories.js` when an isolated preview adds useful review coverage

Components use the `.ca-<component>` namespace and BEM element/modifier names. Component styles use `@scope (.ca-<component>)` with the established BEM fallback. Bare HTML selectors are not used inside component styles. Global shell selectors in `css/global.css` are a current implementation exception and should be reduced or explicitly documented through separate work.

Twig templates initialize attributes with `attributes|default(create_attribute())`. User-controlled HTML attributes use `|e('html_attr')`. User-supplied URLs must be sanitized at the trusted theme render boundary with `UrlHelper::stripDangerousProtocols()` and `#[TrustedCallback]`; Twig escaping remains defense in depth. Verify callback coverage for each prop before claiming that it is implemented.

Include SDCs by their Drupal plugin ID, such as `omnichannel:case-study-header`, without a leading `@`. The `@namespace/path` syntax is for Twig template namespaces, not SDC plugin IDs.

Canvas requires useful, non-empty defaults and examples for required and structured props. A valid Drupal SDC is not automatically a Canvas-available component. Canvas configuration must be generated through Drupal's component source services rather than hand-maintained opaque identifiers.

## Views listings and teaser rendering

The `civicactions_landing_page_views` module owns the Team, Editorial, News, Publications, and Case Study listing Views. Publications represents White Papers through the Editorial taxonomy; it does not require a separate content bundle or teaser component. The Omnichannel theme renders their node teaser view modes through the existing teaser SDCs rather than introducing listing-specific components.

- Bundle-specific `node--<bundle>--teaser.html.twig` templates live under `web/themes/omnichannel/templates/content/` and pass `teaser_props` to the matching SDC.
- `preprocessNode()` builds `teaser_props` only for the `teaser` view mode, guards missing fields and references, checks entity and field view access, and adds access/cache dependencies to Drupal's preprocess bubbleable metadata.
- Managed Media images are converted to structured SDC props at the theme render boundary. Teaser image styles are selected by the Media view display referenced from each node teaser display, not hard-coded in preprocessing; Media, file, and image-style cache dependencies are bubbled with the output.
- Person teaser cards remain unlinked for the MVP. Editorial and Case Study teasers retain their configured canonical links.
- The Views grid preserves Drupal's generated row and column attributes. `css/layout.css` supplies a one-column mobile baseline, configured responsive columns at 768px, and the five-column Team layout at 1200px.
- The Section SDC supports optional intro copy, no vertical padding, and blue/red backgrounds with white foreground content. Its full prop contract remains in `components/section/section.component.yml`.
- The Hero SDC supports an optional `heading_level` prop (`1` or `2`, default `1`), allowing landing pages with multiple Hero instances (such as the Home page Culture callout) to use an `h2` heading tag and prevent duplicate `h1` accessibility violations.
- Full Views pagination uses the legacy Back | Page X of Y | Next pattern centered in the 720px container (`.ca-pager`), delegating button presentation to `omnichannel:link-button` while preserving Drupal core's `.js-pager__items` hook for Views AJAX paging.
- Views exposed filters (`.ca-views-exposed-form`) use token-based flexbox layout, 44px minimum touch targets, uppercase Nunito bold labels, and Link Button submit styling with 3px focus rings. For the MVP launch, taxonomy keyword/topic filters and non-functional quick-link headers are hidden on `/insights/articles` and `/case-studies`, and the Team listing defaults to current members without an exposed internal/external filter. The exposed form styles remain available for post-MVP topic feeds (MAHOM-1205).

The current local listing routes are `/team`, `/news`, `/publications`, `/case-studies`, and `/insights/articles`; `/blog` is not the configured local Articles route. On Live, these routes resolve to Canvas Page entities created by editorial authors, which override naked Views page routes. Placing the matching Views blocks (`ca_*_block_1`) and an authored H1 `page-title` component within these Canvas pages is the active architecture (demonstrated on `/team` with `ca_team-block-1`). MAHOM-1201 tracks separate landing pages for Articles, Insights, Highlights, and News. Sitewide footer menu links in `templates/partials/footer/menu.html.twig` map directly to canonical MVP routes (`/team/`, `/news/`, `https://reports.civicactions.com/2025`, `/services/`, `/case-studies/`, `/contracting/`, `/contact/`, `/insights/`, `/careers/`); dynamic Drupal menu block integration is deferred post-MVP.

## Full node rendering standards

Full node detail displays (`editorial`, `case_study`, `page`) render standard node templates wrapped by `page.html.twig`.

- **Reading width:** Long-form prose and editorial content (`page`, `editorial`) use the 720px narrow container (`.ca-container.ca-container--narrow`).
- **Entity view display sanitization:** Full node displays must hide internal administrative taxonomies (`field_funnel_stage`, `field_content_job`, `schema_audience`, `field_tools`, `field_expertise`) and raw field labels ("Description", "Featured Image", "Article body").
- **Case Study node theming:** Tracked in MAHOM-1162 (in Develop with Iris Ibekwe). Dedicated 1:1 Gatsby parity was declined under MAHOM-1186; clean node theming matching the Omnichannel design tokens is the target standard.
- **Person nodes:** Person teaser cards remain unlinked on `/team` for MVP. Individual staff detail nodes are deferred post-MVP.

### Basic page detail rendering

[node--page--full.html.twig](../../web/themes/omnichannel/templates/content/node--page--full.html.twig) passes `page_hero_summary` to the Hero SDC. For basic pages in `full` view mode, `preprocessNode()` extracts the plain-text `schema_short_description` value using the shared field-access helper and bubbles its access cache metadata without replacing existing cache metadata. The field render array is excluded from the remaining content so its label and block wrappers do not appear inside the hero summary paragraph or duplicate the description.

### Case study detail rendering

[node--case-study.html.twig](../../web/themes/omnichannel/templates/content/node--case-study.html.twig) extends the shared node template. In full view mode it renders the header (title, client, description), hero media, proof points, article body, expertise and tools, key outcomes, and team members in that order. Display-enabled fields that are not mapped to a prop, such as keywords, are not rendered; non-full view modes retain the parent markup unless a more specific template applies.

For case-study nodes in `full` view mode, `preprocessNode()` exposes `case_study_props` through `buildCaseStudyFullProps()`, separately from teaser props. The full-page template consumes `title`, `client`, `description`, `hero_image`, `body`, `expertise`, `tools`, `team_members`, `outcomes`, and `proofpoints_component_props`. The builder reuses the prepared label and field render arrays instead of extracting raw values. The `body` prop maps to `field_body`; `schema_article_body` is hidden in the full display. The Proofpoints SDC is the exception to render-array reuse: `buildProofpointsProps()` maps the first three accessible `field_proof_points` paragraphs (`field_value` to `stat_N`, filtered and tag-stripped `field_description` to `label_N`) into `proofpoints_component_props`, skips incomplete pairs, and applies access and cache dependencies to the preprocess variables. The `field_proof_points` field is hidden in the full display so it is not rendered twice. The template renders `field_outcomes` through its Drupal field output; each Outcomes paragraph renders as an Outcome Card SDC through the default paragraph template `paragraph--outcomes.html.twig`. The Key outcomes section band, heading, and card grid from the legacy page are not implemented yet, and a dedicated paragraph view mode is a planned post-MVP change in [component-migration.md](../plans/component-migration.md). Team members render in a "Meet the team" band after the outcomes: the `field_team_members` full display uses the Person `teaser` view mode, so each person renders through the existing Person Teaser SDC, unlinked for the MVP.

The default case-study display renders hero media as an entity and hides the teaser-only image. The hero media renders immediately after the case-study header in its own `ca-container`, using the global wide layout and responsive gutters rather than the header's narrow width. The `omnichannel/case-study` library sizes the rendered image to the container while preserving its aspect ratio. It is attached only in the full-view branch of the case-study node template; case-study detail CSS is not loaded globally or by teaser templates. Field render arrays retain Drupal formatters, access checks, translations, and cache metadata. Statistics, challenges, and outcomes depend on authored article-body paragraphs rather than hard-coded legacy content. This is field mapping, not full visual parity: legacy columns, team cards, related case studies, and the closing call to action are not implemented by this node template.

### 404 error page rendering

[page--404.html.twig](../../web/themes/omnichannel/templates/layout/page--404.html.twig) extends `page.html.twig` and overrides the `main_content` block to deliver a branded, legacy-aligned 404 experience. It attaches the `omnichannel/not-found` library and renders:

- A centered 1200px max-width container (`.ca-not-found__inner`).
- The 404 status code (Merriweather bold red) and secondary heading ("Well, that's awkward.").
- A responsive team photo (`zoom-image.png`, 83% width on mobile up to 759px max width).
- Centered explanation copy and standard link-styled navigation to Home (`/`), Careers (`/careers/`), and Insights (`/insights/`).
- The standard full-width Primary Page CTA banner (`omnichannel:primary-page-cta`).

The page suggestion `page__404` is registered in `OmnichannelHooks::themeSuggestionsPageAlter()` for the `system.404` route via injected `RouteMatchInterface`. Isolated rendering and visual verification are provided by the `NotFound` story in `page-fixtures.stories.js`.

## Design tokens and visual language

The current theme exposes brand and layout values as CSS custom properties in [web/themes/omnichannel/css/global.css](../../web/themes/omnichannel/css/global.css). Component CSS uses these properties instead of hand-coded values wherever a token matches exactly, written as `var(--token, fallback)`. A value with no matching token may be hard-coded; do not round it to a nearby token without recording the difference. For the complete token inventory, see [design-tokens.md](design-tokens.md). These values are the implementation surface today:

- Primary red: `#D83933`
- Primary blue: `#162E51`
- Light blue: `#73B3E7`
- Warm gold: `#FA9441`
- Warm light gold: `#FFBC78`
- Heading family: Merriweather
- Body family: Nunito
- Base line height: `1.15`
- Spacing values based on a 4px scale
- Wide content container: approximately `1200px`
- Narrow editorial content: approximately `720px`
- Card elevation token: `--shadow-card`

The theme currently has global typography and link rules in `css/global.css`. Those rules are part of the page shell, not evidence that component CSS may use bare selectors.

If the project adopts machine-readable tokens, use the Design Tokens Community Group 2025.10 format. Do not add a second hand-maintained token inventory until the project has a validated generation or drift-check path. When that path exists, use typed groups, descriptions, semantic aliases, and deprecation metadata, then generate or validate CSS custom properties from the structured source.

## Layout and responsive behavior

The shared page shell uses full-width bands with constrained inner content. The primary layout models are:

- Mobile: 375px and 480px review widths
- Tablet: 768px
- Desktop: 1024px
- Wide desktop: 1200px and 1440px
- Standard content container: approximately 1200px
- Editorial reading container: approximately 720px

### Page width models

Pages use one of three width models. The page template at [page.html.twig](../../web/themes/omnichannel/templates/layout/page.html.twig) chooses the wrapper around `page.content`.

- **Full-width (unconstrained):** Canvas pages (`canvas_page`) get no page-level container. Each layout Section determines its own width: a full-bleed background band with content constrained inside it.
- **Constrained width:** `.ca-container` with `max-width: var(--container-max-width)` (1200px).
- **Narrow width:** `.ca-container.ca-container--narrow` with `max-width: var(--container-narrow-width)` (720px), for editorial and prose content types such as the Utility page (Privacy, Accessibility Statement, Licensing).

The header sets its own width (`.site-header__inner__container` uses `--container-max-width`) and is not affected by these wrappers. The Hero caps `.ca-hero__inner` at `--container-narrow-width` (`--container-max-width` for the flush variant) independently of the page wrapper.

Responsive behavior must be checked at the project breakpoints and must not introduce horizontal overflow. The legacy mobile navigation drawer and a Drupal content sidebar are separate concerns.

## Accessibility and component documentation

The project baseline is WCAG 2.1 AA, with current WCAG guidance used for review. Semantic HTML, keyboard access, visible focus, readable contrast, meaningful link names, image alternatives, and responsive reflow are component requirements.

Automated Axe or Storybook checks are a baseline, not a complete accessibility review. New interactive components also require keyboard and focus review in a rendered browser surface.

Each component's implementation and preview should make its public contract clear: purpose, props, variants, allowed content, responsive states, accessibility expectations, known limitations, and lifecycle status.

## Canvas verification

Use only the disposable Canvas draft page at `/canvas/editor/canvas_page/1` for editor verification. Confirm Drupal discovery, Canvas eligibility, component-library visibility, pointer drag-and-drop placement, prop editing, responsive output, browser console health, and accessibility behavior. Do not mutate the published Home page as a test fixture.

## Validation

Use the narrowest useful check first, then widen validation according to risk:

```text
ddev drush cr
ddev lint-css
ddev lint-js
cd web/themes/omnichannel && npm run build-storybook
```

Frontend changes also require rendered browser review at relevant mobile and desktop widths. Keep generated Storybook output out of source lint input unless the generated bundle is specifically under review.

## CI/CD Pipeline & Automated Deployment

The homesite rebuild follows a trunk-based deployment model on Pantheon with GitHub Actions. Detailed architecture decisions are recorded in [ADR-0002](../decisions/0002-ci-cd-pipeline.md).

### Pipeline overview

1. **Pull Requests**:
   - Fast static checks run immediately (`pr-static.yml`): Composer validate/audit, PHPStan (level 2), PHPCS (Drupal standards), theme Stylelint & ESLint, Storybook build, dependency review, and CI logic unit tests.
   - Pantheon builds a disposable review environment (`pr-<number>`) and posts a PR comment upon readiness.
   - Environment testing (`pr-review-env.yml`) triggers on this comment, verifies the deployed commit matches the PR head, runs `drush deploy`, health diagnostics, Playwright functional and axe accessibility tests on the curated page list, and visual regression against `dev`.
   - Results rollup into a single required status check: `ci/gate`.

2. **Master branch**:
   - Pushes to `master` deploy automatically to Pantheon `dev` (`master-dev.yml`).
   - Runs `drush deploy`, health diagnostics, and Playwright smoke tests against `dev`.
   - Evaluates the automated deploy gate (`auto-deploy-gate.yml`) to check if pending security updates qualify for automatic release.

3. **Deploying to Live**:
   - Code is promoted from `dev` to `test` with live content sync, verified with automated test suites (including live-vs-test visual comparison), and promoted to `live` (`deploy.yml`).
   - **Manual releases**: Triggered via `workflow_dispatch` on `deploy.yml`. Requires deployment approval from any repository developer with write access.
   - **Automated releases**: Security-only updates merge and deploy automatically if all conditions in ADR-0002 pass.

### Status contexts & PR labels

- `ci/gate`: The single required status check on `master`. Derived dynamically from `ci/static` and `ci/review-env`.
- `deps:security-verified`: Applied to Dependabot PRs updating only manifest/lock files with patch/minor versions that resolve published security advisories.
- `deps:tooling`: Applied to theme-local development tooling updates in `web/themes/omnichannel`.
- `deps:needs-review`: Applied to version bumps, major updates, or PRs touching non-lock files. Requires human review.
- `refresh-content`: Add this label to a PR to request that the next environment run re-clones the database and files from `dev`.

### Kill switches & configuration

Controlled via repository variables:
- `AUTO_MERGE_ENABLED` (`true` | `false`): Enables automated squash-merging of qualifying dependency updates.
- `AUTO_DEPLOY_ENABLED` (`true` | `false`): Enables automated promotion of verified security updates to `live`. Defaults to `false` until 5 successful manual releases are logged.
- `DEPLOY_WINDOW`: JSON defining the allowed automated deployment window (`{"days":[1,2,3,4],"start":"09:00","end":"15:00","tz":"America/Los_Angeles"}`). Automated deploys never run on US federal holidays.

### Configuration drift & secret management

- **Zero drift requirement**: Deployments to `live` halt immediately if `config:status` reports unexported configuration changes on production.
- **Never commit secrets to config**: Production credentials, API keys, and sensitive tokens must be stored in Pantheon Secrets (`terminus secrets:set`) or environment-specific `settings.php` overrides, never in exported YAML config.
- **Resolving live drift**: To resolve drift cleanly:
  1. Pull the live database into DDEV: `ddev pull pantheon --skip-files`.
  2. Inspect and export locally: `ddev drush config:status` and `ddev drush config:export`.
  3. Review exported files in `config/` to ensure no credentials or secrets are present.
  4. Submit changes via a standard PR, or revert unintended changes on live.
