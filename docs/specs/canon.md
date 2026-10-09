# CivicActions Homesite Canon

Status: Active public technical canon
Audience: Contributors working on the CivicActions homesite rebuild
Last reviewed: 2026-09-29

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

Canvas requires useful, non-empty defaults and examples for required and structured props. A valid Drupal SDC is not automatically a Canvas-available component. Canvas configuration must be generated through Drupal's component source services rather than hand-maintained opaque identifiers.

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
