# CivicActions Homesite

## Project

This repository contains the CivicActions homesite rebuild on Drupal 11 and Drupal CMS 2.0. The production theme is `web/themes/omnichannel/`. Drupal Canvas is the visual authoring surface, and Twig Single Directory Components (SDCs) are the reusable frontend units.

Keep the build simple and maintainable. Make the smallest change that satisfies the requirement and validate the rendered result when a change affects the frontend.

## Local workflow

Run commands from the repository root:

```text
ddev start
ddev drush cr
ddev setup-css-lint
ddev lint-css
ddev lint-js
```

Use `vendor/bin/dr` for Drupal core generator commands when the project Composer autoloader is required.

For theme-local Storybook:

```text
cd web/themes/omnichannel
npm install
npm run storybook
npm run build-storybook
```

## SDC standards

- Place components under `web/themes/omnichannel/components/<name>/`.
- Use the `.ca-<component>` namespace and BEM element/modifier names.
- Scope component CSS with `@scope (.ca-<component>)` and provide the established BEM fallback where needed.
- Do not add bare HTML selectors to component CSS. Global shell rules are documented exceptions in `docs/specs/canon.md`.
- Initialize Twig attributes with `attributes|default(create_attribute())`.
- Escape user-controlled HTML attributes with `|e('html_attr')`.
- Inspect the theme render boundary for user-supplied URL props. Reuse or add a trusted callback using `UrlHelper::stripDangerousProtocols()` and `#[TrustedCallback]` before rendering them.
- Give every required or structured Canvas prop a useful, non-empty `default` and `examples` value.

## Canvas and Storybook

- Rebuild caches after SDC metadata changes with `ddev drush cr`.
- Confirm Drupal discovery and Canvas eligibility before debugging the editor UI.
- Generate Canvas component configuration through Drupal's component source services. Do not hand-maintain generated component entity identifiers.
- Use only the disposable Canvas draft page at `/canvas/editor/canvas_page/1` for editor verification. Do not mutate the published Home page.
- Canvas insertion uses pointer drag-and-drop. A palette click alone is not a placement test.
- Keep production Twig templates unchanged for Storybook-only preview needs. Use a component-local preview wrapper for Twig blocks or slots.

## Documentation and skills

The public project canon is [docs/specs/canon.md](docs/specs/canon.md). Architecture decisions live in [docs/decisions/](docs/decisions/), and shared implementation planning lives in [docs/plans/](docs/plans/).

Project skills are available under `.agents/skills/`:

- `omnichannel-sdc`: create a Canvas-ready SDC
- `canvas-verify`: verify Drupal and Canvas registration
- `storybook-story`: create a theme-local Storybook story
- `legacy-compare`: compare public legacy behavior with the rebuild
- `theme-lint`: run focused frontend validation

Personal plans, handoffs, lessons, reports, and raw context stay outside version control through each developer's local `.git/info/exclude`.

## Validation expectations

For frontend changes, validate the narrowest useful check first, then run the relevant lint and browser checks. Include keyboard/focus behavior, responsive behavior, and accessibility review when a component or layout changes. Keep the canon honest about current implementation state and label target standards separately.
