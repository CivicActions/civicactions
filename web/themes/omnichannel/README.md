# Omnichannel theme

Production Drupal 11 theme for the CivicActions homesite rebuild, scaffolded from Drupal core `starterkit_theme`.

## Architecture

- **Single Directory Components (SDCs):** Located in `components/`. Each component contains a `<name>.component.yml` schema, `<name>.twig` template, and encapsulated `<name>.css` stylesheet.
- **Brand Tokens:** Defined in `css/global.css` from the CivicActions Brand Library and `design.md`.
- **CSS Encapsulation:** Strict BEM class naming with `.ca-<component>` namespace, zero bare-tag element styling, and `@scope (.ca-<component>)` encapsulation with progressive-enhancement fallbacks.

## Components

- `card`: Linked card with icon, title, and body text.
- `case-study-teaser`: Linked case study preview with client label, image, title, and summary.
- `editorial-teaser`: Content teaser available as an image card or compact title-and-arrow link.
- `link-button`: Call-to-action link button supporting primary and secondary variants.
- `primary-page-cta`: Full-width call-to-action banner supporting default (blue) and home (red) variants.
- `section`: Responsive CSS Grid section supporting 2-, 3-, and 4-column layouts.
- `site-footer`: Responsive site footer with slots for organization, navigation, and policy content.
- `social-links`: CivicActions social media icon links with hover and focus states.

## Frontend Linting

Frontend linting uses Drupal core's pinned dependencies:

```bash
ddev setup-css-lint
ddev lint-css
ddev lint-js
```

## Storybook

Storybook runs in the theme directory and renders Twig SDCs with Vite:

```bash
cd web/themes/omnichannel/
npm install
npm run storybook
npm run build-storybook
```

Storybook runs without Drupal. Stories that render images use the existing Canvas image fixture at
`images/canvas-assets/editorial-teaser-img.jpg` and the bundled Card icon fixture at
`images/icons/check.svg`; responsive `srcset` generation remains a Drupal and Canvas
responsibility. The production Twig templates remain unchanged.

### Adding a component story

Storybook automatically includes any `*.stories.js` file under `components/`. Add a story beside
the component files, for example `components/example/example.stories.js`:

```js
import template from './example.twig';
import './example.css';

const meta = {
  title: 'Components/Example',
  render: (args) => template(args),
  argTypes: {
    title: { control: 'text' },
  },
  args: {
    title: 'Example component',
  },
};

export default meta;

export const Default = {};
```

Use `argTypes` for editable prop controls and `args` for the default values shown in the story.
For image or icon props, import the existing helpers from `.storybook/fixtures.js` so local and production
asset paths stay consistent. If a component uses Twig blocks for slots, create a Storybook-only
wrapper template that extends the production template and supplies preview content; keep Drupal
Canvas slot composition in the production template.

Run `npm run storybook` while developing, then run `npm run build-storybook` to verify the static
bundle before submitting the change.

To publish a static Storybook preview on Pantheon, run `npm run build-storybook` from this
directory. The output is written to `web/storybook/` and is available at
`https://<environment>-civicactions.pantheonsite.io/storybook/`. The generated files are
intentionally tracked during the build phase so Pantheon can serve them from its `web` docroot.
