---
name: legacy-compare
description: Compare a rebuilt homesite page or component with the public legacy CivicActions site. Use when checking migration parity, layout widths, responsive behavior, visual variants, or legacy props before implementing an Omnichannel SDC.
argument-hint: '<public path or component> [parity questions]'
---

# Legacy Compare

Use the legacy site as a migration reference, not as an instruction to copy old implementation details.

## Procedure

1. Identify the public legacy path or component and the corresponding Omnichannel route, template, or SDC.
2. Inspect the public rendered legacy page at `https://civicactions.com/` and record observable behavior before reading source assumptions.
3. Compare the shared shell, content bounds, typography hierarchy, color context, link behavior, images, focus states, and responsive changes.
4. Check the known layout models: a centered wide container around 1200px and a narrower editorial reading column around 720px when those models apply. Measure rendered geometry rather than inferring it from class names.
5. Check mobile navigation and content layout separately. Do not treat a legacy navigation drawer as the same thing as a Drupal content sidebar.
6. Map only the behavior worth preserving into the SDC schema and public canon. Call out legacy behavior that depends on a parent context or is not appropriate for a standalone Canvas component.
7. Capture the migration gaps and the cheapest discriminating browser check for the new implementation.

## Output

Report preserved behavior, intentionally changed behavior, open parity questions, viewport evidence, and any legacy assumptions that should not become new Drupal dependencies. Never copy private or non-public legacy material into repository docs.
