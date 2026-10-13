# Plan: MAHOM-1184 Reusable Hub Components (Proofpoints, Accordion, Icon)

## Purpose

The homesite rebuild needs three reusable components for the DITAP offering page, Case Studies, and the Homepage:

1. **Proofpoints SDC**: Displaying 1 to 3 statistical metrics with labels.
2. **Accordion SDC**: An accessible, collapsible disclosure item and slot-based container for FAQs and content-heavy pages.
3. **Icon SDC**: A scalable SVG icon primitive parameterized by brand colors and size tokens for feature highlights and inline cues.

This work completes the Issue 2 batch of the Omnichannel frontend roadmap and clears three `TODO` markers in the Storybook page reconstruction fixtures.

## Scope

- Build `omnichannel:proofpoints` SDC under `web/themes/omnichannel/components/proofpoints/`:
  - `proofpoints.component.yml`: Typed prop contract supporting 1 to 3 stats (`stat_1`/`label_1`, optional `stat_2`/`label_2`, optional `stat_3`/`label_3`) alongside an `items` array for programmatic Twig callers, optional `card_style` boolean, and `alignment` enum (`center`, `left`).
  - `proofpoints.twig`: Semantic markup rendering a responsive list of callouts with BEM classes (`ca-proofpoints`, `ca-proofpoints__stat`, `ca-proofpoints__label`).
  - `proofpoints.css`: Scoped component styling (`@scope (.ca-proofpoints)`) with BEM fallbacks, using brand tokens for typography and colors (`--primary-red`, `--primary-blue`, `--size-12`, `--font-heading`).
  - `proofpoints.stories.js`: Storybook stories for 1-stat, 2-stat, 3-stat, boxed card style, and left-aligned variants.
- Build `omnichannel:accordion` and `omnichannel:accordion-container` SDCs under `web/themes/omnichannel/components/`:
  - `accordion.component.yml`: Single-item contract with `title`, optional `item_id`, `heading_level`, `open_by_default`, and an `accordion_content` slot.
  - `accordion.twig`: Semantic, zero-JS `<details>`/`<summary>` item with native keyboard accessibility and a slotted content region.
  - `accordion-container.component.yml` and `accordion-container.twig`: Slot wrapper for unlimited single-item Accordion instances.
  - `accordion-container.js`: Demand-driven behavior that closes sibling items when one opens, matching the existing Mercury container pattern.
  - `accordion.css`: Scoped styling (`@scope (.ca-accordion)`) with BEM fallbacks, custom animated chevron indicators, tokenized borders (`--gray-10`), and visible focus outlines (`--focus-outline-width: 3px`).
  - `accordion.stories.js` and `accordion-container.stories.js`: Storybook coverage for single items, open-by-default content, heading levels, and multi-item composition.
- Build `omnichannel:icon` SDC under `web/themes/omnichannel/components/icon/`:
  - `icon.component.yml`: Typed prop contract for `name` (enum: `check`, `calendar`, `certificate`, `users`, `arrow`, `document`, `star`), `size` (enum: `sm`, `md`, `lg`, `xl`), `color` (enum: `primary-red`, `primary-blue`, `light-blue`, `gray-90`, `inherit`), and optional `aria_label`.
  - `icon.twig`: Pure Twig SVG symbol rendering without relying on Drupal's `source()` filter, so the component renders in both Drupal and Storybook Twig.js.
  - `icon.css`: Scoped styling (`@scope (.ca-icon)`) with BEM fallbacks, mapping sizes (`16px`, `24px`, `32px`, `48px`) and tokenized colors (`currentColor`, `--primary-red`, etc.).
  - `icon.stories.js`: Storybook stories showcasing individual icons and a full icon/color/size catalog matrix.
- Integrate into Storybook page fixtures (`page-fixtures.stories.js`):
  - Replace `renderProofpointPreview` on DITAP and Case Study Detail fixtures with `omnichannel:proofpoints`.
  - Replace DITAP feature card placeholder icons with `omnichannel:icon`.
  - Replace DITAP FAQ raw `<details>` list with `omnichannel:accordion`.
  - Remove `todoDetails.proofpoints`, `todoDetails.accordion`, and `todoDetails.icon`.
- Validate Drupal discovery, Canvas generated configuration, Storybook builds, CSS/JS linting, responsive reflow, and accessibility.

### Out of Scope

- Backend content types, custom entity fields, or migration scripts (handled in MAHOM-1182/downstream tasks).
- Views listings for Team or Blog (tracked in MAHOM-1185).
- Dedicated node template for Case Studies (tracked in MAHOM-1186).
- Custom video or multimedia player integrations (covered in MAHOM-1183).

## Decisions

- **Canvas-first dual prop model for Proofpoints**: Canvas requires simple storable prop shapes for its form widgets. Proofpoints will expose explicit props (`stat_1`, `label_1`, `stat_2`, `label_2`, `stat_3`, `label_3`) for direct editing in the Canvas sidebar, while the Twig template also normalizes an `items` array for node templates such as `node--case-study.html.twig` and Storybook.
- **Mercury-style item/container split**: Accordion owns one disclosure item and exposes a content slot. Accordion Container owns the multi-item group and closes sibling items through a small Drupal behavior. This supports unlimited Canvas-authored items without an array-of-objects prop.
- **Deterministic Accordion IDs**: `item_id` is an optional presentation-level ID seed. The item falls back to a cleaned title for existing callers, while Canvas authors can provide unique values when titles repeat. This does not create or replace a Drupal content field.
- **Content Hub alignment**: The imported planning CSVs in local `.context/content-hub/` are the current model reference. Accordion remains a layout surface for existing Offering fields, Proofpoints remains a presentation primitive pending the post-MVP Proof Point `Claim` model, and Icon remains theme presentation rather than editorial content.
- **Pure Twig SVG catalog for Icon**: Drupal's `source()` filter fails inside Storybook's Twig.js environment. Embedding the SVG path definitions directly within `icon.twig` keeps the component usable in Drupal Canvas, Drupal server rendering, and isolated Storybook previews without asset-path wrappers.
- **Token usage**: Colors, sizes, borders, and focus rings reference `web/themes/omnichannel/css/global.css` tokens with established fallbacks (e.g., `var(--primary-red, #d83933)`, `var(--size-6, 1.5rem)`).
- **Progressive enhancement CSS**: Component stylesheets provide class-prefixed BEM fallback rules followed by an `@scope (.ca-<component>)` block.

## Implementation Details

- [x] Create and check out feature branch `feature/MAHOM-1184-reusable-hub-components` from `master`.
- [x] Add Proofpoints schema, Twig, CSS, and stories under `web/themes/omnichannel/components/proofpoints/`.
- [x] Add single-item Accordion and Accordion Container schemas, Twig, CSS, behavior, and stories.
- [x] Add Icon schema, Twig, CSS, and stories under `web/themes/omnichannel/components/icon/`.
- [x] Update `web/themes/omnichannel/components/page-fixtures/page-fixtures.stories.js` to replace temporary Proofpoints, Accordion, and Icon TODOs with real components.
- [x] Rebuild Drupal caches and verify generated Canvas configuration entities.
- [x] Run `ddev lint-css`, `ddev lint-js`, and `npm run build-storybook`.
- [x] Verify responsive layout across 375px, 480px, 768px, 1024px, and 1280px.
- [x] Verify keyboard navigation and accessibility attributes (disclosure semantics, focus rings, SVG aria attributes).

## Validation Notes

- `ddev lint-css` and `ddev lint-js` pass with zero errors or warnings.
- `cd web/themes/omnichannel && npm run build-storybook` builds static Storybook output.
- Drupal Canvas discovery and configuration generator confirmed `sdc.omnichannel.proofpoints`, `sdc.omnichannel.accordion`, and `sdc.omnichannel.icon` created as enabled Component config entities in the `Content` folder.
- Drupal Canvas discovery confirmed `sdc.omnichannel.accordion-container` with an `accordion_content` slot; the Accordion item exposes `title`, `heading_level`, `open_by_default`, and its `accordion_content` slot.
- Drupal Canvas generation confirmed the Accordion item also exposes optional `item_id`, with title fallback preserved for existing callers.
- Exported Drupal YAML configuration entities to `config/`.
- Verified in-browser Storybook rendering:
  - Proofpoints: 1, 2, and 3 column variants, card style, responsive mobile 1-column stack.
  - Accordion: HTML5 disclosure `<details>/<summary>`, keyboard Tab and Space/Enter expansion, active focus outline (`3px solid rgb(22, 46, 81)`), and slotted content regions.
  - Accordion Container: Verified nine DITAP FAQ items compose through the slot, the isolated container story renders multiple item children without overflow, and the Drupal behavior closes sibling items when one opens.
  - Icon: Browser checks confirmed SVG rendering across sizes (`sm`, `md`, `lg`, `xl`), brand colors (`primary-red`, `primary-blue`, `light-blue`, `gray-90`), and accessibility (`aria-hidden="true"` when decorative, `role="img"` with `aria-label` when labeled).
  - Page fixtures: Verified DITAP and Case Study Detail fixtures render real Proofpoints, Accordion, and Icon components, clearing all three Issue 2 `TODO` placeholders.
  - Card & Icon alignment: Adopted the pattern alignment recommendation by updating `card.component.yml`, `card.twig`, and `card.css` to support `icon_name`, migrating cards across Homepage and DITAP fixtures to the unified `omnichannel:icon` SDC.
  - Viewport verification: Tested 375px, 480px, 768px, 1024px, and 1280px with zero horizontal scroll overflow.

## Acceptance Criteria

- Proofpoints SDC renders 1, 2, or 3 stat callouts with responsive stacking on small viewports (<768px).
- Accordion SDC expands and collapses smoothly with native keyboard accessibility, visible focus indicators, and optional mutual exclusivity.
- Icon SDC renders scalable vector icons across all defined size (`sm`, `md`, `lg`, `xl`) and color (`primary-red`, `primary-blue`, `light-blue`, `gray-90`, `inherit`) tokens.
- Decorative icons output `aria-hidden="true"`; icons with `aria_label` output `role="img"` with accessible names.
- Storybook page fixtures for DITAP and Case Study Detail render real Proofpoints, Accordion, and Icon components, resolving three fixture TODOs.
- `ddev lint-css`, `ddev lint-js`, and `npm run build-storybook` pass with zero errors or warnings.
- Drupal Canvas discovers all three SDCs and generates valid component config entities.
- All three components are verified on the disposable Canvas draft page `/canvas/editor/canvas_page/1`.

## Risks

- **Normal, Canvas Schema Compatibility**: Nested object arrays in SDC schemas can cause Canvas to fail schema validation or omit prop widgets. Mitigated by providing explicit `stat_1..3` and `label_1..3` props for Proofpoints, and testing Canvas discovery immediately after cache rebuild.
- **Low, Twig.js Storybook Differences**: Using Drupal-specific functions like `source()` causes Storybook builds to break. Mitigated by embedding SVG vectors directly in `icon.twig` using portable Twig syntax.
- **Low, Accordion Container behavior**: The container behavior must only close sibling items and must not change native focus or disclosure semantics. Keep the behavior limited to click-triggered sibling closing; the item itself remains a native HTML5 `<details>`/`<summary>` control.
- **Normal, Content Hub model ambiguity**: The planning snapshot identifies Proof Point as a post-MVP `Claim` content type and contains conflicting notes about carrying over the legacy TabMobile pattern. Keep current presentation components decoupled from those fields until the follow-up SDC audit resolves the production content wiring.

## Skill Usage

| Phase | Skill | Purpose |
| :--- | :--- | :--- |
| Build | `omnichannel-sdc` | Create SDC component metadata, Twig templates, and scoped CSS adhering to theme standards. |
| Build | `storybook-story` | Build theme-local Storybook stories and preview coverage for each component. |
| Build | `kiss` | Keep the implementations small, using native `<details>`/`<summary>` and pure Twig SVG icons. |
| Validate | `theme-lint` | Execute CSS, JS, and Storybook build checks. |
| Validate | `canvas-verify` | Verify Drupal discovery, Canvas eligibility, and disposable-page placement. |
| Validate | `browser-check` | Verify rendered DOM, computed styles, and browser console output. |
| Validate | `accessibility-audit` | Check disclosure semantics, focus rings, heading hierarchy, and SVG accessible names. |
| Validate | `responsive-design` | Validate 375px, 480px, 768px, 1024px, and 1280px breakpoints. |
| Validate | `frontend-peer-review` | Final quality check on Twig, CSS, and schemas prior to PR/commit. |
| Session end | `handoff-message` | Record session outcomes, validation results, and next steps. |

## Workflow State Requirements

- [x] Triage: Issue MAHOM-1184 exists in Jira with summary, description, priority, and labels.
- [x] Refinement: Acceptance criteria, SDC specifications, and LOE documented.
- [x] Plan: Implementation plan formulated and saved in session memory and `.agents/plans/MAHOM-1184-plan.md`.
- [x] Build: Feature branch created; SDCs, styles, Storybook stories, and fixture updates implemented.
- [x] Validate: Theme linting, Storybook build, Canvas verification, and accessibility audit completed.
- [ ] Communicate: PR opened/merged to `master`, Jira updated, and session handoff documented.
- [ ] Follow-up: Complete the SDC Content Hub alignment audit documented in `.context/sdc-content-hub-audit.md` before wiring production fields and Views.

_AI-assisted, reviewed/adjusted by me._
