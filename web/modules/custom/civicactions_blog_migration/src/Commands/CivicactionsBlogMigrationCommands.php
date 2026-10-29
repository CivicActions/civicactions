<?php

declare(strict_types=1);

namespace Drupal\civicactions_blog_migration\Commands;

use Drupal\civicactions_blog_migration\MediumLegacyRedirectSync;
use Drush\Attributes as CLI;
use Drush\Commands\DrushCommands;

/**
 * Drush commands for CivicActions Blog Migration.
 */
final class CivicactionsBlogMigrationCommands extends DrushCommands {

  /**
   * Constructs command handlers.
   */
  public function __construct(
    private readonly MediumLegacyRedirectSync $mediumLegacyRedirectSync,
  ) {
    parent::__construct();
  }

  /**
   * Syncs or rolls back Medium legacy redirects for migrated article editorials.
   */
  #[CLI\Command(name: 'civicactions:medium-legacy-redirects')]
  #[CLI\Option(name: 'rollback', description: 'Delete redirects previously created by this command.')]
  #[CLI\Option(name: 'dry-run', description: 'Show what would change without writing redirects.')]
  #[CLI\Usage(name: 'ddev drush civicactions:medium-legacy-redirects', description: 'Create 301 redirects from legacy Medium slug-hash paths to current editorial aliases.')]
  #[CLI\Usage(name: 'ddev drush civicactions:medium-legacy-redirects --dry-run', description: 'Preview redirect creation without writing changes.')]
  #[CLI\Usage(name: 'ddev drush civicactions:medium-legacy-redirects --rollback', description: 'Delete redirects created by this command.')]
  public function mediumLegacyRedirects(array $options = ['rollback' => FALSE, 'dry-run' => FALSE]): void {
    $rollback = (bool) ($options['rollback'] ?? FALSE);
    $dry_run = (bool) ($options['dry-run'] ?? FALSE);

    $summary = $rollback
      ? $this->mediumLegacyRedirectSync->rollback($dry_run)
      : $this->mediumLegacyRedirectSync->sync($dry_run);

    $mode = $rollback ? 'rollback' : 'sync';
    $this->io()->title(sprintf('Medium legacy redirect %s (%s)', $mode, (string) ($summary['status'] ?? 'unknown')));
    foreach ($summary as $key => $value) {
      $this->io()->writeln(sprintf(' - %s: %s', $key, (string) $value));
    }
  }

}

