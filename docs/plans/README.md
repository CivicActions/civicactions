# Shared plans

This directory contains public, team-owned planning artifacts that help contributors coordinate work across the homesite rebuild.

Use a shared plan when it captures a roadmap, cross-ticket implementation sequence, or decision that multiple contributors need to follow. Keep individual working notes, ticket scratchpads, handoffs, and lessons learned in personal local directories rather than publishing them here.

## Active plans

- [component-migration.md](component-migration.md): Component migration strategy from the legacy homesite to Drupal 11 SDCs and Canvas, including the 39-component audit matrix and batched implementation phases.

## Plan expectations

- Start with the user or editor problem and the intended outcome.
- State scope, dependencies, open decisions, validation, and follow-up work.
- Link to the relevant ADR and public canon sections.
- Keep private project context, credentials, internal URLs, staff discussion, and raw discovery exports out of the repository.
- Update the plan through a normal pull request when the shared approach changes.

Architecture decisions belong in `docs/decisions/`. Component contracts belong beside their SDC implementation and Storybook story.
