---
name: omnichannel-sdc
description: Create or update a Drupal Single Directory Component for the Omnichannel theme. Use when scaffolding an SDC, adding Canvas props, building a new component, or migrating a component into the CivicActions theme.
argument-hint: '<component name> [purpose and props]'
---

# Omnichannel SDC

Create a small, reusable SDC that works in Drupal Canvas, the public theme, and the theme-local Storybook.

## Procedure

1. Inspect a nearby component in `web/themes/omnichannel/components/` and read `docs/specs/canon.md` before choosing markup, tokens, or variants.
2. Define the component contract first: purpose, required props, optional props, variants, slots, responsive states, accessible name, and URL/image behavior.
3. Create the component directory with `<name>.component.yml`, `<name>.twig`, and `<name>.css`.
4. In the schema, use typed props, useful non-empty defaults, and non-empty examples for every required or structured prop. Keep prop names stable and understandable to content editors.
5. In Twig, initialize `attributes` defensively, render semantic HTML, namespace classes with `.ca-<component>`, and escape user-controlled attributes with `|e('html_attr')`.
6. For URL or URI props, inspect the current theme render boundary first. Reuse the trusted callback when it covers the prop; otherwise add or extend it with `UrlHelper::stripDangerousProtocols()` and `#[TrustedCallback]` before rendering the prop. Do not add ad hoc protocol filtering in Twig.
7. In CSS, first read `css/global.css` and map every color, spacing, font-size, line-height, container width, and shadow to an existing custom property, written as `var(--token, fallback)` with the token's value as the fallback. Hard-code a value only when no token matches exactly, and report near-matches (for example 55px against `--size-14` at 56px) instead of silently rounding. Scope component rules with `@scope (.ca-<component>)`, preserve the BEM fallback, and avoid bare HTML selectors. Document any intentional global-shell exception in the canon instead of hiding it in the component.
8. Add a Storybook story when the component has a meaningful isolated preview. Use a wrapper template for Twig blocks or slots rather than changing the production template to satisfy Storybook.
9. Rebuild Drupal caches, check SDC discovery and Canvas eligibility, then run the focused theme lint and browser checks.

## Completion check

- Schema, Twig, and CSS exist and use the project namespace.
- Required props have usable Canvas defaults and examples.
- URLs and attributes follow the project safety rules.
- Component CSS uses existing `css/global.css` tokens wherever one matches exactly, lists any hard-coded values that have no token, and does not leak outside the component.
- Drupal discovery, Canvas registration, Storybook rendering, responsive behavior, and accessibility checks have evidence appropriate to the change.
