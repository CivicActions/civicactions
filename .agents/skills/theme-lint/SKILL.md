---
name: theme-lint
description: Run focused frontend validation for the Omnichannel Drupal theme. Use after changing theme CSS, Twig component styles, JavaScript, Storybook stories, or design-token usage.
argument-hint: '<changed files or component name>'
---

# Theme Lint

Keep validation scoped to the changed theme surface and distinguish generated preview output from source files.

## Procedure

1. Identify the changed files and whether the change is CSS, JavaScript, Twig, Storybook, or documentation only.
2. For the first check, run the narrowest available validation for the changed file or component.
3. Use the project-pinned DDEV commands when the theme toolchain is required:
   - `ddev setup-css-lint` when the lint toolchain is not initialized.
   - `ddev lint-css` for stylesheet validation.
   - `ddev lint-js` for theme JavaScript validation.
4. Keep generated Storybook output such as `web/storybook/` and `storybook-static/` out of source lint input unless the generated bundle itself is under review.
5. For component CSS, check the `.ca-<component>` namespace, `@scope` structure, BEM fallback, custom-property usage, and absence of bare HTML selectors. Global shell selectors in `css/global.css` are documented exceptions and should be reported as drift, not silently normalized in an unrelated ticket.
6. For Storybook changes, restart the Storybook process after configuration changes before interpreting browser results.
7. If DDEV or Mutagen changes the local file state, check `git status` and file sizes before diagnosing a frontend failure.
8. Report command, scope, result, and any unrelated repository blocker separately.

## Completion check

A passing command is evidence only for the surface it covered. Pair lint output with browser, Canvas, Storybook, or accessibility evidence when the change affects rendered behavior.
