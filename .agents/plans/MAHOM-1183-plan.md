# Plan: MAHOM-1183 Core Layout and Canvas Primitives

## Purpose

Canvas authors need reusable building blocks for landing pages, service pages, and utility pages. This work adds section anchors and headings, filtered rich text, responsive image and remote video presentation, and a semantic page title so editors can compose pages without losing layout or accessibility context.

## Scope

- Update the Section SDC with an optional cleaned anchor ID, title, and heading level.
- Add a Content SDC for block rich text with scoped typography and an optional narrow reading column.
- Add a Media SDC for Canvas images and remote video embeds with captions and transcript links.
- Add a Page Title SDC with a configurable heading level that defaults to `h1`.
- Add component-local Storybook coverage for the new and changed states.
- Add legacy-inspired Storybook page fixtures for Homepage, Services, Team, Case Studies, DITAP, Utility, and individual Case Study detail so completed SDCs can be assembled against representative page layouts.
- Verify discovery, Canvas placement, responsive rendering, keyboard focus, and accessibility.

Out of scope: content types and fields, CKEditor configuration, migration scripts, production page-template boundaries and full-bleed layout ownership (tracked in MAHOM-1187), node templates, Views listings, and the Proofpoints, Accordion, and Icon SDCs tracked in MAHOM-1184.

The page fixtures preserve useful legacy section order, container geometry, jump targets, card density, responsive stacking, and the real Site Footer SDC. They use native page, container, grid, Section, and component CSS only. There is no fixture-specific stylesheet, so Storybook cannot create a second layout canon. They use local fixture content and existing SDCs rather than copying legacy assets or pretending to be production routes. They do not reproduce the legacy Services sidebar, tab interfaces, or agency seal/logo rails. Agency names use text-based representations, while Proofpoints, Accordion, and Icon areas remain clearly marked follow-up work. The header remains a lightweight fixture shell because MAHOM-1168's code is merged but CMS menu setup and environment visibility are still in Jira Develop. Canvas persistence and content-backed listings remain downstream work.

## Decisions

- Canvas rich text uses `type: string`, `contentMediaType: text/html`, and `x-formatting-context: block`. The Twig template renders the value normally so Drupal's filtered markup handling remains intact.
- Canvas's built-in `json-schema-definitions://canvas.module/video` shape represents a video file and maps to Canvas video-file media sources. Remote YouTube, Vimeo, or similar embeds use a `video_url` string with `format: uri-reference`; the schema description will require an iframe embed URL.
- URL props remain protected by the existing trusted `#propsAlter` callback. The implementation will strip dangerous protocols and restrict the video prop to HTTP(S) embed URLs without adding a custom video player or JavaScript.
- Section IDs are set through Drupal's `Attribute` API, then cleaned with `clean_id`, so a supplied Canvas or render ID cannot produce duplicate attributes.
- Component CSS follows the existing progressive-enhancement pattern: class-prefixed BEM fallback rules plus an `@scope (.ca-<component>)` block. Rich-text element selectors are bare only inside the scope block.
- Remote videos use a native responsive iframe wrapper with `aspect-ratio: 16 / 9`, a descriptive iframe title, lazy loading, and an optional transcript link. Parent Section layout controls alignment and width.
- Full-bleed section bands use the Section wrapper for the background and the Section inner element for the content boundary. `width: constrained` keeps content at the 1200px token while the wrapper remains viewport-wide; `width: full` allows content to use the available page width with token gutters.
- Full bleed requires a wide page boundary. Canvas pages already bypass the narrow node content container in `page.html.twig`; regular narrow node layouts must use a page-template boundary or a dedicated layout variant before they can host viewport-wide bands. Do not escape the narrow container with negative margins or `100vw` hacks inside an SDC.
- Jenna's migration guidance takes precedence over visual parity for retired patterns: Services uses inline Section anchors instead of a sticky sidebar, Team and Case Study listings use straightforward page flow instead of legacy tabs, and agency seals are represented by text or simple icons to reduce governance risk.
- The fixture shell uses the production Site Footer SDC and its Storybook preview wrapper. It does not claim to reproduce Drupal's region-driven header until the MAHOM-1168 CMS menu dependency is visible in the target environment.
- Fixture layout must use the native theme classes and component CSS. Do not add a `page-fixtures.css` replacement or selectors that style Storybook pages as a parallel design system.
- Yellow TODO markers use one canonical detail for each repeated gap: Hero media, Proofpoints, Icon, and Accordion. The October 9 public crawl rechecked Homepage, Services, DITAP, Team, Case Studies, and Privacy copy; visible text is aligned where the fixture represents the legacy page, while the documented structural migrations remain intentional.

## Implementation Details

- [x] Create `feature/MAHOM-1183-core-layout-primitives` from `master`.
- [x] Update Section schema, Twig, CSS, preview fixture, and Storybook controls for anchor IDs, titles, and heading levels.
- [x] Add Content schema, Twig, CSS, and stories for default, narrow, and rich block content.
- [x] Add Media schema, Twig, CSS, and stories for image, captioned image, video, and video-with-transcript states.
- [x] Extend `OmnichannelHooks::sanitizeComponentUrls()` for Media video and transcript URLs, including the allowed HTTP(S) embed constraint.
- [x] Add Page Title schema, Twig, CSS, and stories for default H1, subtitle, and centered presentation.
- [x] Add seven legacy page composition fixtures, including DITAP, Utility, and individual Case Study detail.
- [x] Rebuild Drupal caches and verify SDC discovery and generated Canvas component configuration.
- [x] Run focused Storybook and lint checks, then the full theme validation commands.
- [ ] Verify drag-and-drop placement and prop editing on `/canvas/editor/canvas_page/1` only.
- [ ] Complete formal Axe review and the full 375px, 480px, 768px, 1024px, and 1280px viewport matrix. Storybook DOM checks and 375px/desktop screenshots are complete.

## Validation Notes

- `npm run build-storybook`, `ddev lint-css`, `ddev lint-js`, and `ddev drush cr` pass.
- Drupal reports enabled `sdc.omnichannel.content`, `sdc.omnichannel.media`, `sdc.omnichannel.page-title`, and `sdc.omnichannel.section` component entities.
- Storybook browser checks confirmed Section anchor output, Content rich HTML, Media iframe title/lazy loading/transcript output, Page Title H1 output, and no mobile Media overflow.
- Screenshots are saved under `.agents/reviews/MAHOM-1183-*.png` for the team and PR summary.
- Rebuilt the tracked static Storybook bundle to remove conflict markers from `web/storybook/index.json`; the served manifest now parses and includes all MAHOM-1183 stories.
- Added `Pages/Legacy Reconstructions` Storybook fixtures for Homepage, Services, Team, Case Studies, DITAP, Utility, and individual Case Study detail. The fixtures use text-based agency names, inline Services anchors, and no legacy tabs or custom logo rail.
- Replaced the raw fixture footer with the real `omnichannel:site-footer` Storybook composition and realistic social destinations.
- The local Canvas editor route requires an authenticated browser session. No shared authenticated page was available during this pass, so pointer placement remains open.

## Acceptance Criteria

- Section renders a valid jump target when `section_id` is provided and renders no empty heading when `title` is absent.
- Content accepts Canvas block HTML and keeps its typography inside `.ca-content`, without affecting Drupal admin or Canvas chrome.
- Media renders a responsive image or remote video, never both, and provides caption and transcript output when supplied.
- Remote video and transcript URLs cannot retain dangerous protocols after the theme props alter callback runs.
- Page Title renders one semantic heading with `h1` as the default and supports a documented lower level for nested compositions.
- All four components are discoverable by Drupal Canvas and can be dragged into the disposable draft page.
- Representative page fixtures cover the seven legacy page archetypes without reintroducing retired sidebar, tab, or agency seal patterns.
- Storybook builds successfully; `ddev lint-css` and `ddev lint-js` complete without errors.
- Responsive and accessibility checks pass, including iframe accessible name, visible focus, contrast, and heading hierarchy.

## Risks

- **Major, Canvas authoring:** Invalid defaults or examples can prevent component configuration generation. Validate schema metadata immediately after cache rebuild.
- **Major, accessibility:** Page-level headings and video alternatives affect WCAG 2.1 AA. Verify the rendered Canvas page, not only isolated Storybook markup.
- **Normal, embed compatibility:** Providers may reject non-embed URLs or change iframe policies. Document the expected embed URL format and test at least one supported provider.
- **Normal, style isolation:** Rich-text rules can leak through fallback selectors if any selector loses the `.ca-content` prefix. Keep the CSS lint check and inspect the rendered admin boundary.

## Skill Usage

| Phase | Skill | Use |
| :--- | :--- | :--- |
| Build | `omnichannel-sdc` | SDC metadata, Twig, CSS, and Canvas prop conventions |
| Build | `storybook-story` | Theme-local Storybook stories and preview fixtures |
| Build | `kiss` | Keep the four components static and avoid a custom media player |
| Validate | `theme-lint` | CSS, JavaScript, and Storybook build checks |
| Validate | `canvas-verify` | Discovery, generated configuration, and disposable-page placement |
| Validate | `browser-check` | Rendered DOM, console, and computed styles |
| Validate | `accessibility-audit` | Heading, iframe, focus, and contrast review |
| Validate | `responsive-design` | Breakpoint review at project contract widths |
| Validate | `frontend-peer-review` | Final Twig, CSS, and schema review |
| Session end | `handoff-message` | Record validation status and remaining work |

Excluded: `legacy-compare` because this is a new primitive set rather than a 1:1 legacy rebuild; `drupal-peer-review` because no backend service or entity code is planned; `triage` and `ticket-refinement` because Jira already contains the scoped acceptance criteria and estimate.

## Workflow State Requirements

- [x] Triage: issue exists in Jira with title, summary, type, priority, and labels.
- [x] Refinement: acceptance criteria, SDC prop contract, technical approach, and LOE are documented.
- [x] Plan: this plan is saved in `.agents/plans/MAHOM-1183-plan.md`.
- [ ] Build: create the feature branch from `master` and use conventional commits that include `MAHOM-1183`.
- [ ] Validate: add the `Needs review` marker and complete local cache rebuild, lint, Storybook, Canvas, responsive, and accessibility checks.
- [ ] Communicate: complete review, merge to `master`, Jira closure notes, and a session handoff.

_AI-assisted, reviewed/adjusted by me._
