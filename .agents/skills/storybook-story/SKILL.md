---
name: storybook-story
description: Create or update a theme-local Storybook story for an Omnichannel Twig SDC. Use when adding a component story, previewing props, documenting variants, or checking an isolated frontend render.
argument-hint: '<component name> [stories or states to cover]'
---

# Storybook Story

Use Storybook as an isolated render and documentation surface. Drupal Canvas remains the source of truth for Drupal slot composition and editor behavior.

## Procedure

1. Read the component schema, production Twig, CSS, and any existing neighboring stories.
2. Create `components/<name>/<name>.stories.js` with the local `vite-plugin-twig-drupal` pattern used by the theme.
3. Expose meaningful props through `argTypes` and choose stable, realistic defaults through `args`.
4. Cover the default state, each public variant, long or empty content where it affects layout, and link/image states where applicable.
5. If production Twig uses `{% block %}` or slot composition, create a Storybook-only `<name>-preview.twig` wrapper that extends the production template and fills the blocks. Do not change the production template to work around Twig.js limitations.
6. Use existing fixtures from `.storybook/fixtures.js` for images and icons. Do not add a large or private asset just to make a story render.
7. Run `npm run build-storybook` from `web/themes/omnichannel/` and verify the generated preview path when the static bundle is in scope.
8. Review the rendered story at narrow and wide viewports, then run the Storybook accessibility checks when configured. Automated checks supplement keyboard and visual review; they do not replace it.

## Completion check

The story should be useful to a human reviewer, render the same public contract as the SDC, avoid production-template changes for preview-only content, and leave no stale generated output in the lint scope.
