# ADR-0001: Drupal Canvas and SDC architecture

- Status: Accepted
- Date: 2026-09-29
- Decision owners: CivicActions homesite team

## Context

The homesite needs a publishing platform where content teams can compose pages visually and engineers can add reusable, accessible components. The implementation must preserve Drupal's integrated content and rendering model instead of creating a separately deployed headless frontend.

Components need consistent rules for markup, styles, props, URL safety, and editor verification.

## Decision

Use Drupal 11 and Drupal CMS 2.0 with Drupal Canvas for visual page composition. Build the production frontend in the `omnichannel` theme with Twig Single Directory Components.

Use typed SDC metadata for the component contract, semantic Twig for rendering, component-local CSS with the `.ca-` namespace and `@scope` progressive enhancement, and a trusted theme callback for sanitizing user-supplied URLs. Validate Canvas eligibility and editor behavior separately from Drupal plugin discovery.

Use theme-local Storybook for isolated component props and visual review. Keep Drupal Canvas as the source of truth for Drupal slot composition, component registration, and visual authoring behavior.

## Consequences

- The architecture keeps page composition inside Drupal instead of requiring a separate frontend deployment. The end-to-end editor workflow still requires Canvas verification.
- Components have a clear contract that can be reviewed in code, Canvas, and Storybook.
- Canvas registration and generated component configuration require explicit validation in addition to cache rebuilds.
- Scoped CSS reduces style bleed, but the page shell still owns a small set of global rules.
- Storybook preview wrappers may be needed for Twig blocks because isolated Twig.js rendering does not reproduce Drupal slot composition.
- Future token automation must be introduced only with a validated source-of-truth and drift-check path.

## Alternatives considered

- A separate headless frontend was not selected because it would create a second product to deploy and keep synchronized.
- A rigid existing design-system theme was not selected because the homesite requires its own brand language and Canvas-compatible component contracts.
- Hand-maintained Canvas configuration entities were not selected because generated identifiers and schema versions are implementation details of Drupal's component source system.

## References

- [Public homesite canon](../specs/canon.md)
- [Drupal Canvas](https://www.drupal.org/project/canvas)
- [Design Tokens Community Group format](https://www.designtokens.org/tr/2025.10/format/)
