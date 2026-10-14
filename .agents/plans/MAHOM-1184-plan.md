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
  - `accordion-container.component.yml` and `accordion-container.twig`: Slot wrapper for unlimited Accordion items.
  - `accordion-container.js`: Optional demand-driven behavior for single-open groups; the default allows multiple items to remain open, matching the legacy DITAP FAQ.
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
- **Legacy-compatible item/container split**: Accordion owns one disclosure item and exposes an answer-content slot. Accordion Container owns the multi-item group and supports unlimited Canvas-authored items without an array-of-objects prop. Multiple items remain open by default, matching the legacy DITAP FAQ; an explicit single-open setting may opt into sibling closing for other use cases.
- **Progressive Accordion behavior**: Keep native `<details>` as the base behavior. Add an optional `single_open` Container prop, defaulting to false, and limit sibling-closing behavior to groups that explicitly enable it.
- **Optional Accordion IDs**: `item_id` is an optional presentation-level ID seed. When blank, the item relies on native `<details>` semantics without generated ID relationships; explicit values provide stable anchors and labeled content regions. This does not create or replace a Drupal content field.
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
  - Drupal Canvas generation confirmed the Accordion item also exposes optional `item_id`; blank values do not generate duplicate title-based IDs.
- Exported Drupal YAML configuration entities to `config/`.
- Verified in-browser Storybook rendering:
  - Proofpoints: 1, 2, and 3 column variants, card style, responsive mobile 1-column stack.
  - Accordion: HTML5 disclosure `<details>/<summary>`, keyboard Tab and Space/Enter expansion, active focus outline (`3px solid rgb(22, 46, 81)`), and slotted content regions.
  - Accordion Container: Verified nine DITAP FAQ items compose through the slot, the isolated container story renders multiple item children without overflow, and the default group allows multiple items to remain open.
  - Icon: Browser checks confirmed SVG rendering across sizes (`sm`, `md`, `lg`, `xl`), brand colors (`primary-red`, `primary-blue`, `light-blue`, `gray-90`), and accessibility (`aria-hidden="true"` when decorative, `role="img"` with `aria-label` when labeled).
  - Page fixtures: Verified DITAP and Case Study Detail fixtures render real Proofpoints, Accordion, and Icon components, clearing all three Issue 2 `TODO` placeholders.
  - Card & Icon alignment: Adopted the pattern alignment recommendation by updating `card.component.yml`, `card.twig`, and `card.css` to support `icon_name`, migrating cards across Homepage and DITAP fixtures to the unified `omnichannel:icon` SDC.
  - Viewport verification: Tested 375px, 480px, 768px, 1024px, and 1280px with zero horizontal scroll overflow.

## Acceptance Criteria

- Proofpoints SDC renders 1, 2, or 3 stat callouts with responsive stacking on small viewports (<768px).
- Accordion SDC expands and collapses smoothly with native keyboard accessibility, visible focus indicators, and legacy-compatible multi-open behavior by default.
- Accordion Container supports an explicit single-open option without changing the default multi-open behavior.
- Icon SDC renders scalable vector icons across all defined size (`sm`, `md`, `lg`, `xl`) and color (`primary-red`, `primary-blue`, `light-blue`, `gray-90`, `inherit`) tokens.
- Decorative icons output `aria-hidden="true"`; icons with `aria_label` output `role="img"` with accessible names.
- Storybook page fixtures for DITAP and Case Study Detail render real Proofpoints, Accordion, and Icon components, resolving three fixture TODOs.
- `ddev lint-css`, `ddev lint-js`, and `npm run build-storybook` pass with zero errors or warnings.
- Drupal Canvas discovers all three SDCs and generates valid component config entities.
- All three components are verified on the disposable Canvas draft page `/canvas/editor/canvas_page/1`.

## Risks

- **Normal, Canvas Schema Compatibility**: Nested object arrays in SDC schemas can cause Canvas to fail schema validation or omit prop widgets. Mitigated by providing explicit `stat_1..3` and `label_1..3` props for Proofpoints, and testing Canvas discovery immediately after cache rebuild.
- **Low, Twig.js Storybook Differences**: Using Drupal-specific functions like `source()` causes Storybook builds to break. Mitigated by embedding SVG vectors directly in `icon.twig` using portable Twig syntax.
- **Low, Accordion Container behavior**: The default group must not add behavior beyond native `<details>`/`<summary>` disclosure. If `single_open` is enabled, sibling closing must remain limited to click-triggered behavior and must not change native focus or disclosure semantics.
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

## Follow-up Plan: Accordion Authoring Guidance

### Goal

Make the Accordion and Accordion Container understandable to Canvas authors without requiring them to know the terms “slot,” “mutual exclusion,” or “presentation-level ID.” An author should be able to identify which component to place, where repeated items belong, and where answer content belongs from the Canvas palette, slot labels, and settings panel.

### Current gap

The current contracts describe implementation behavior but do not clearly explain the author workflow. “Accordion container” sounds like a layout wrapper, and “Accordion content” is ambiguous because it can mean either repeated Accordion items or the answer content inside one item. The existing Storybook examples demonstrate the behavior but do not explicitly show the recommended Container > Accordion > Content/Card composition.

### Recommended guidance surfaces

1. Improve the Canvas palette metadata without changing machine names:
  - Rename the user-facing Container label to `Accordion group` or `Accordion group (container)` while keeping `omnichannel:accordion-container` stable.
  - Describe the group as a set of collapsible questions or disclosures where multiple items can remain open.
  - Describe the single Accordion as one collapsible question or disclosure item and direct authors to use an Accordion group for multiple items.
2. Make slot contracts action-oriented:
  - Container slot title: `Accordion items`.
  - Container slot description: `Add Accordion items here. Add answer content inside each individual Accordion item.`
  - Item slot title: `Answer content` or `Accordion answer`.
  - Item slot description: `Add Content, Card, or another allowed component here. This content appears when the item opens.`
3. Clarify the settings fields:
  - Title: `Question or heading shown in the trigger.`
  - Item ID: `Optional stable anchor ID. Leave blank for normal use; provide a unique value when this item needs a link target or explicit relationship.`
  - Open by default: `Expand this item when the public page loads. Use sparingly for long groups.`
  - Heading level: explain that it should match the surrounding page hierarchy.
4. Add a Storybook authoring example rather than relying on prose alone:
  - Show one Accordion group with three sibling Accordion items.
  - Show Content and Card nested inside one item’s answer slot.
  - Keep the duplicate-title regression story and add a short story description explaining the recommended tree.
5. Preserve the existing Canvas editor enhancement that opens newly inserted items in the editor, so authors can see nested slot content while composing without changing saved/public disclosure behavior.

### Implementation details

- [ ] Create or use the follow-up branch `feature/MAHOM-1184-accordion-authoring-guidance` from `master` if this ships separately; otherwise apply the changes to the active MAHOM-1184 branch without rewriting pushed history.
- [ ] Update Accordion and Accordion Container SDC names, descriptions, slot titles, slot descriptions, and prop help text.
- [ ] Add the optional `single_open` Container prop with a false default and expose its behavior clearly in Canvas settings.
- [ ] Update the Container behavior so sibling closing runs only when `single_open` is enabled.
- [ ] Keep `source_local_id`, component IDs, and public Twig/CSS behavior stable unless a focused authoring test proves a change is required.
- [ ] Add or refine Storybook stories showing the recommended group and nested answer-content composition.
- [ ] Regenerate Canvas component configuration through `ComponentSourceManager` after metadata changes and export the affected config entities.
- [ ] Rebuild caches and verify the Canvas palette, slot labels, and settings descriptions on the disposable draft page. Existing draft component instances created before these props were added are out of scope.
- [ ] Run `ddev lint-css`, `ddev lint-js`, and `npm run build-storybook`.
- [ ] Verify pointer placement for new components, nested Card/Content visibility, duplicate-title behavior, keyboard disclosure behavior, and responsive layout at 375px, 768px, and 1280px.

### Acceptance criteria

- Canvas authors can distinguish `Accordion group` from a standalone `Accordion` from the palette descriptions.
- The group slot clearly requests Accordion items, and the item slot clearly requests answer content.
- Canvas settings explain when to use `Item ID`, `Open by default`, and each heading level.
- Storybook contains a visible recommended composition with three sibling items and nested answer content.
- A Card or Content component placed inside an Accordion item is visible during Canvas editing and remains collapsed by default in saved/public rendering unless configured otherwise.
- Multiple Accordion items can remain open simultaneously by default, matching the legacy DITAP FAQ behavior.
- A group configured with `single_open` closes other open items when one item opens.
- Duplicate Accordion titles do not create duplicate IDs when `item_id` is blank.
- No machine identifiers, generated Canvas entity IDs, or unrelated public component behavior change.

### Risks and decisions

- Keep help text short enough for Canvas sidebars; use the Storybook composition for the fuller explanation.
- Do not rename the machine-level component or slot keys. User-facing labels can change without invalidating authored component trees.
- Treat `item_id` as an advanced stability/anchor option, not a required authoring step.
- The legacy DITAP screenshot is the behavior baseline. Single-open behavior is an explicit opt-in for future compositions, not an implicit Container default.

### Complexity

Small. The work is metadata, Storybook documentation, generated Canvas config, and focused editor verification. It does not require new content fields or backend modeling.

## Workflow State Requirements

- [x] Triage: Issue MAHOM-1184 exists in Jira with summary, description, priority, and labels.
- [x] Refinement: Acceptance criteria, SDC specifications, and LOE documented.
- [x] Plan: Implementation plan formulated and saved in session memory and `.agents/plans/MAHOM-1184-plan.md`.
- [x] Build: Feature branch created; SDCs, styles, Storybook stories, and fixture updates implemented.
- [x] Validate: Theme linting, Storybook build, Canvas verification, and accessibility audit completed.
- [ ] Communicate: PR opened/merged to `master`, Jira updated, and session handoff documented.
- [ ] Follow-up: Complete the SDC Content Hub alignment audit documented in `.context/sdc-content-hub-audit.md` before wiring production fields and Views.

## Follow-up Workflow State Requirements

- [ ] Triage → needs a scoped Jira summary, priority, and `build`, `canvas`, `sdc`, or `omnichannel` labels.
- [ ] Refinement → needs problem/motivation, proposed resolution, acceptance criteria, and the SDC/Canvas technical approach.
- [x] Plan → needs this implementation plan stored under `.agents/plans/`.
- [ ] Build → needs the metadata, Storybook, and generated Canvas configuration changes implemented.
- [ ] Validate → needs `Needs review`, `Needs visual QA`, `Needs a11y review`, and `Needs Canvas verification` markers plus local DDEV and disposable Canvas evidence.
- [ ] Communicate → needs the PR updated, Jira status/comment updated, and a session handoff recorded.

_AI-assisted, reviewed/adjusted by me._
