# Plan: MAHOM-1167 Omnichannel theme scaffolding

## Goal
Move from the approved POC pilot theme to the production `omnichannel` Drupal theme. Port the validated MVP Single Directory Components (SDCs), preserve CivicActions brand tokens, and provide focused frontend lint commands.

## Scope
- Generate `web/themes/omnichannel/` from Drupal core `starterkit_theme`.
- Port brand tokens, global styles, image assets, and the six MVP SDCs:
  `card`, `case-study-teaser`, `editorial-teaser`, `link-button`,
  `primary-page-cta`, and `section`.
- Configure theme-local Stylelint, ESLint, and Prettier settings using Drupal core's pinned dependencies.
- Add `ddev lint-js` and retarget `ddev lint-css` to Omnichannel.
- Install Omnichannel as the default theme and uninstall `home_drupal_pilot` in Drupal. Retain the pilot files during transition.

## Validation
- `ddev lint-css` passes.
- `ddev lint-js` passes, reporting no files until theme JavaScript is added.
- Drupal cache rebuild passes.
- All six `omnichannel:*` SDC plugin definitions are discovered.
- Omnichannel is the default theme; Gin remains the admin theme; the pilot theme is disabled.
- The Styleguide route renders Omnichannel. Browser validation still needs a viewport at least 1024px wide for the Canvas editor, and the Styleguide reported one existing 404 resource.

## Follow-up
- Verify all six components in Canvas at a sufficiently wide viewport.
- Investigate the Styleguide 404.
- Build Header and Footer components next.
- Open the MAHOM-1167 PR after review.

_AI-assisted, reviewed/adjusted by me._
