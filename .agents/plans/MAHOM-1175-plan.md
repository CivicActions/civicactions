# Plan: MAHOM-1175 Site-wide HTML and Page Template Customization

## Goal
Establish the CivicActions layout and grid foundation in the Omnichannel theme, using the legacy Gatsby site's 1200px `.inner` container and 720px editorial reading width as migration references. Customize the active Drupal fallback page shell with semantic landmarks, sticky-footer behavior, and a stable integration point for the Footer SDC.

## Context
- Drupal Canvas page templates and config exports are deferred until content types are complete.
- During this phase, `page.html.twig` is the active production shell; Header and Footer SDCs will be integrated there first.
- Later Canvas page templates replace `page.html.twig`, so layout utilities must be globally attached and reusable by Canvas components.
- The legacy Gatsby site is a migration model for layout archetypes, content types, URLs, SEO, and component behavior, not a source to port blindly.

## Scope
- Add `css/layout.css` with `.ca-page`, `.ca-container`, `.ca-grid`, sidebar layout, and skip-link utilities.
- Register and globally attach the layout stylesheet.
- Add `.ca-body` and universal skip navigation to `html.html.twig`.
- Add semantic, namespaced fallback landmarks and sidebar layout to `page.html.twig`.
- Add `.ca-region` namespacing to `region.html.twig`.
- Preserve full-width page content so SDCs control their own width.
- Defer Canvas page-template entities/config exports, Header/Footer component authoring, and MVP SDC changes.

## Implementation Checklist
- [x] Create `feature/MAHOM-1175-page-template-layout` from `master`.
- [x] Add token-based global layout and grid CSS.
- [x] Register the layout library globally.
- [x] Customize HTML, page, and region templates.
- [x] Preserve a semantic footer seam for Footer SDC integration.
- [x] Verify populated Canvas content and a temporary editorial/sidebar fixture.
- [x] Run accessibility and responsive review against populated content.
- [ ] Verify higher environment after review and deployment.

## Validation
- `ddev drush cr` passes.
- Exact Stylelint invocation passes for `css/layout.css`.
- Browser route renders without Twig errors and exposes the skip link, `#main-content`, `.ca-page`, `.ca-region`, and footer landmark.
- Browser checks at 375px, 480px, 768px, 1024px, and 1280px show no horizontal overflow and retain sticky-footer flex behavior.
- Public-layout browser review passes for the populated Canvas Home composition and a temporary editorial/sidebar fixture at 375px, 768px, and 1280px. The sidebar grid was corrected to keep the sidebar narrow and editorial content wide at desktop.
- Full `ddev lint-css` passes after the generated Storybook exclusion and inherited property-order fixes.
- Disposable Axe CLI validation reports one `page-has-heading-one` violation because Canvas lacks an authored page-title component.

## Legacy Browser Comparison

Live browser comparison was completed against the public legacy site at `https://civicactions.com/`:

- **Homepage** (`/`): one `h1`, explicit header/navigation/footer shell, full-width sections with centered 1200px `.inner` containers, and a mobile navigation drawer.
- **Secondary/red model** (`/services/`): `red-header` header, `red--header` main modifier, a real page `h1`, and 1200px section containers.
- **Editorial/general model** (`/privacy/`): the same shell plus a 720px reading column inside the wider 1200px layout; the page has a real `h1`.
- **Drupal coverage**: global landmarks, skip navigation, 1200px layout tokens, responsive containers, and the fallback sidebar grid are implemented. Canvas Home content and the fallback editorial fixture were verified in browser.
- **Migration gaps**: the Canvas component library still needs a real heading/page-title component for authored `h1` output; the legacy announcement banner, red-header variant, and mobile navigation drawer remain separate follow-up surfaces. The legacy `Sidebar` is a mobile navigation drawer, not the fallback content sidebar.

The temporary editorial node and sidebar block placement used for review were removed after validation; no review fixture remains in local content or block configuration.

## Relevant Skills
- `browser-check`: DOM, responsive, console, network, and screenshot validation.
- `accessibility-audit`: skip link, landmarks, keyboard focus, and WCAG review.
- `ds-guard`: token and design-system conformance.
- `frontend-peer-review`: Twig/CSS review before merge.
- `handoff-message`: session closeout.

## Workflow State Requirements
- [x] Develop -> assigned and branch created.
- [ ] Validate -> local DDEV, populated Canvas content, legacy browser comparison, formal a11y check, and lint evidence; the remaining Axe heading violation, authenticated 404 width decision, and Pantheon Test verification are open.
- [ ] Communicate -> peer review, merge to `master`, and Jira closure notes.

_AI-assisted, reviewed/adjusted by me._
