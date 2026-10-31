<?php

/**
 * Load services definition file.
 */
$settings['container_yamls'][] = __DIR__ . '/services.yml';

/**
 * Include the Pantheon-specific settings file.
 *
 * n.b. The settings.pantheon.php file makes some changes
 *      that affect all environments that this site
 *      exists in.  Always include this file, even in
 *      a local development environment, to ensure that
 *      the site settings remain consistent.
 */
/**
 * Determine whether this is a preproduction or production environment, and
 * then load the pantheon services.yml file.  This file should be named either
 * 'pantheon-production-services.yml' (for 'live' or 'test' environments)
 * 'pantheon-preproduction-services.yml' (for 'dev' or multidev environments).
 */
$pantheon_services_file = __DIR__ . '/services.pantheon.preproduction.yml';
if (
  isset($_ENV['PANTHEON_ENVIRONMENT']) &&
  ( ($_ENV['PANTHEON_ENVIRONMENT'] == 'live') || ($_ENV['PANTHEON_ENVIRONMENT'] == 'test') )
) {
  $pantheon_services_file = __DIR__ . '/services.pantheon.production.yml';
}

if (file_exists($pantheon_services_file)) {
  $settings['container_yamls'][] = $pantheon_services_file;
}

include \Pantheon\Integrations\Assets::dir() . "/settings.pantheon.php";

/**
 * Fix for https://www.drupal.org/project/trash/issues/3619527
 * If https://github.com/pantheon-systems/drupal-integrations/pull/44 is merged this can be removed.
 */
if (isset($_ENV['PANTHEON_ROLLING_TMP'])) {
  $settings['php_storage']['trash']['directory'] = $_ENV['PANTHEON_ROLLING_TMP'];
  $settings['php_storage']['trash']['secret'] = $settings['hash_salt'] . ($settings['deployment_identifier'] ?? '');
}

/**
 * Ensure in-site unattended automatic updates are disabled on all Pantheon environments.
 */
if (isset($_ENV['PANTHEON_ENVIRONMENT'])) {
  $config['automatic_updates.settings']['unattended']['level'] = 'disable';
}

/**
 * Only notify search engines (IndexNow) from production. Other environments
 * share the database (and any IndexNow key in state) and the production
 * sitemap base URL, so they must never submit.
 */
if (($_ENV['PANTHEON_ENVIRONMENT'] ?? NULL) !== 'live') {
  $config['simple_sitemap_engines.settings']['enabled'] = FALSE;
  $config['simple_sitemap_engines.settings']['index_now_enabled'] = FALSE;
}

# Disable HTML5 validation for accessibility reasons
$settings['enable_html5_validation'] = FALSE;

/**
 * Skipping permissions hardening will make scaffolding
 * work better, but will also raise a warning when you
 * install Drupal.
 *
 * https://www.drupal.org/project/drupal/issues/3091285
 */
// $settings['skip_permissions_hardening'] = TRUE;

/**
 * If there is a local settings file, then include it
 */
$local_settings = __DIR__ . "/settings.local.php";
if (file_exists($local_settings)) {
  include $local_settings;
}

// Automatically generated include for settings managed by ddev.
$ddev_settings = __DIR__ . '/settings.ddev.php';
if (getenv('IS_DDEV_PROJECT') == 'true' && is_readable($ddev_settings)) {
  require $ddev_settings;
}
