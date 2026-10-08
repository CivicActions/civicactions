# Plan: MAHOM-1180 Person Teaser SDC and Canvas Presentation

## Goal

Deliver a reusable Person Teaser Single Directory Component (SDC) for team listings and offering pages such as DITAP. The component will support portraits, names, roles, optional profile links, and optional inline bio text without porting the legacy Read bio links or modal dialogs.

## Scope

- Add the `person-teaser` SDC under `web/themes/omnichannel/components/person-teaser/`.
- Support the shared presentation used by `/team/` and `/services/ditap/` Meet the team cards.
- Add optional `teaserlink` and `bio` props.
- Add a configurable heading level to Person Teaser, defaulting to `h3` to preserve teaser conventions and allowing `h2` for standalone Canvas placement.
- Constrain the isolated Storybook preview to the fixture portrait width without adding a production max-width to the reusable card.
- Use the existing Quote SDC for staff testimonials and the existing Section SDC for listing layout.
- Add a theme-local Storybook story for linked, unlinked, bio, and multi-card states.
- Verify Drupal discovery and Canvas placement on the disposable draft page.
- Track plans in git by removing `.agents/plans/` from local Git exclusions.

## Out of Scope

- Drupal Person content type, fields, taxonomy, entity view modes, and Views listings.
- Strapi content migration or backend content modeling.
- Legacy Read bio links, modal dialogs, modal JavaScript, and a standalone StaffQuote SDC.

## Implementation Details

- [x] Create feature branch `feature/MAHOM-1180-person-teaser-sdc` from `master`.
- [x] Add the Canvas-ready `person-teaser` schema with required `name`, `role`, and portrait `image` props plus optional `teaserlink` and `bio` props.
- [x] Add semantic Twig markup with defensive attributes, escaped URL attributes, and conditional profile linking.
- [x] Add token-based component CSS with `@scope (.ca-person-teaser)` and the established BEM fallback.
- [x] Add configurable heading levels to Person Teaser and Card so Canvas compositions do not skip from `h1` to `h3`.
- [x] Add Storybook coverage for linked, unlinked, inline bio, and repeated-card presentation at a realistic card width.
- [x] Rebuild Drupal caches and generate the enabled Canvas component entity through the component source manager.
- [x] Run responsive, keyboard, focus, Storybook, CSS, and JavaScript validation.
- [x] Verify the existing disposable Canvas component route exposes all props and persists edited name, role, profile link, and inline bio values.
- [x] Complete authenticated Canvas Library drag-and-drop placement, confirmed by the user on the disposable draft page.
- [ ] Complete Axe review for the rendered component.

## Validation

- `ddev drush cr`
- `ddev lint-css`
- `ddev lint-js`
- `cd web/themes/omnichannel && npm run build-storybook`
- Storybook review at 375px, 480px, and 768px; Canvas full-preview review at 1024px and 1280px because Canvas rejects narrower browser windows.
- Axe review with no new WCAG 2.1 AA violations.

## Workflow State Requirements

- [x] Triage: issue exists in Jira MAHOM.
- [x] Refinement: frontend SDC scope, DITAP reuse, and retired modal behavior documented.
- [x] Plan: this implementation plan is tracked in `.agents/plans/MAHOM-1180-plan.md`.
- [x] Build: component and Storybook implementation completed on the feature branch.
- [ ] Validate: local Drupal, Canvas, Storybook, responsive, and accessibility checks completed; Axe review remains open.
- [ ] Communicate: review, merge, and closure notes completed.

_AI-assisted, reviewed/adjusted by me._
