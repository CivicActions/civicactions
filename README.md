# Composer-enabled Drupal template

This is Pantheon's recommended starting point for forking new [Drupal](https://www.drupal.org/) upstreams
that work with the Platform's Integrated Composer build process. It is also the
Platform's standard Drupal 9 upstream.

Unlike with earlier Pantheon upstreams, files such as Drupal Core that you are
unlikely to adjust while building sites are not in the main branch of the
repository. Instead, they are referenced as dependencies that are installed by
Composer.

For more information and detailed installation guides, please visit the
Integrated Composer Pantheon documentation: [Pantheon Integrated Composer documentation](https://pantheon.io/docs/integrated-composer)

## Frontend linting

The custom theme uses Drupal core's pinned Stylelint, ESLint, and Prettier
configurations. Install the lint dependencies once per checkout, then run the
theme lint commands after CSS or JavaScript changes:

```bash
ddev setup-css-lint
ddev lint-css
ddev lint-js
```

The commands check changed files under `web/themes/omnichannel/`, not Drupal
core or contributed code.

To lint files against a custom Git base branch (the same method used in CI):

```bash
LINT_BASE=origin/master ddev lint-css
LINT_BASE=origin/master ddev lint-js
```

## End-to-End & Accessibility Tests

Browser functional, accessibility (axe), and visual regression tests use Playwright in `tests/e2e`:

```bash
cd tests/e2e
npm ci
npx playwright install --with-deps chromium

# Run functional & accessibility tests against local DDEV or remote dev environment:
BASE_URL=https://civicactions.ddev.site npx playwright test --grep "@functional|@a11y"

# Run smoke tests:
BASE_URL=https://civicactions.ddev.site npx playwright test --grep "@smoke"
```

## CI/CD Pipeline & Automated Deployment

Pull requests and releases are managed via GitHub Actions:
- **PR Checks**: Fast static analysis, Drupal health diagnostics on Pantheon review environments, Playwright functional/a11y tests, and visual regression.
- **Master Branch**: Deploys automatically to Pantheon `dev`.
- **Live Promotion**: Gated releases to `test` and `live`. Verified Dependabot security updates auto-merge and auto-deploy during business hours.

For architecture rules, gate criteria, kill switches, and drift management, see the [Homesite Canon](docs/specs/canon.md#cicd-pipeline--automated-deployment) and [ADR-0002](docs/decisions/0002-ci-cd-pipeline.md).

## Contributing

Contributions are welcome in the form of GitHub pull requests. However, the
`pantheon-upstreams/drupal-composer-managed` repository is a mirror that does not
directly accept pull requests.

Instead, to propose a change, please fork [pantheon-systems/drupal-composer-managed](https://github.com/pantheon-systems/drupal-composer-managed)
and submit a PR to that repository.
