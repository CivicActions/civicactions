---
name: canvas-verify
description: Verify Drupal Canvas discovery, eligibility, generated component configuration, and real editor placement. Use after changing an SDC schema, template, library, or Canvas-facing component.
argument-hint: '<component name> [route or verification notes]'
---

# Canvas Verify

Verify the integration boundary between Drupal SDC discovery and the Canvas editor. A component can be valid to Drupal and still be unavailable in Canvas, so check both registries.

## Procedure

1. Record the component name, changed files, expected palette group, required props, and a disposable verification scenario.
2. Run `ddev drush cr` from the repository root.
3. Check Drupal's component discovery and `/admin/appearance/component/status` for errors or incompatibility reasons.
4. Generate or refresh the Canvas component configuration through the Canvas component source service. Do not hand-edit generated entity identifiers or opaque version data.
5. Confirm the component appears in the Canvas Library with its expected label, group, props, and useful defaults.
6. Open `/canvas/editor/canvas_page/1`, which is the disposable draft surface for this project. Never use the published Home page as a test fixture.
7. Place the component with an actual pointer drag-and-drop operation. A palette click without a completed drop does not verify placement.
8. Exercise every required prop, each variant, empty/long text where relevant, link behavior, image behavior, and any slot content.
9. Check the rendered DOM, browser console, network requests, keyboard focus, responsive layout, and accessibility findings. Separate Canvas UI warnings from component errors.
10. Record the result, including known blockers such as missing authored headings or an unavailable image derivative.

## Evidence

A useful verification note names the component, Drupal discovery result, Canvas palette result, editor placement result, props exercised, viewport coverage, accessibility result, and remaining caveats. Do not claim Canvas support from cache rebuild alone.
