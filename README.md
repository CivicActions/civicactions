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

## Contributing

Contributions are welcome in the form of GitHub pull requests. However, the
`pantheon-upstreams/drupal-composer-managed` repository is a mirror that does not
directly accept pull requests.

Instead, to propose a change, please fork [pantheon-systems/drupal-composer-managed](https://github.com/pantheon-systems/drupal-composer-managed)
and submit a PR to that repository.
