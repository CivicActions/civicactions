<?php

declare(strict_types=1);

namespace Drupal\civicactions_greenhouse\Commands;

use Drupal\civicactions_greenhouse\Client\GreenhouseClientInterface;
use Drupal\Core\Cache\CacheTagsInvalidatorInterface;
use Drush\Attributes as CLI;
use Drush\Commands\DrushCommands;

/**
 * Drush commands for CivicActions Greenhouse module.
 */
final class GreenhouseCommands extends DrushCommands {

  /**
   * Constructs command handlers.
   */
  public function __construct(
    private readonly GreenhouseClientInterface $greenhouseClient,
    private readonly CacheTagsInvalidatorInterface $cacheTagsInvalidator,
  ) {
    parent::__construct();
  }

  /**
   * Invalidates and refreshes the Greenhouse jobs cache.
   */
  #[CLI\Command(name: 'civicactions:greenhouse-refresh', aliases: ['greenhouse:refresh', 'gh-refresh'])]
  #[CLI\Usage(
    name: 'ddev drush greenhouse:refresh',
    description: 'Fetch fresh jobs from Greenhouse API and invalidate cached blocks.',
  )]
  public function refresh(): int {
    $this->io()->comment('Invalidating Greenhouse jobs cache tag...');
    $this->cacheTagsInvalidator->invalidateTags(['civicactions_greenhouse:jobs']);

    $this->io()->comment('Fetching fresh jobs from Greenhouse API...');
    $result = $this->greenhouseClient->warmCache();

    if (!empty($result['error'])) {
      $this->io()->error((string) $result['error']);
      return DrushCommands::EXIT_FAILURE;
    }

    $jobs = $result['jobs'] ?? [];
    $this->io()->success(sprintf('Successfully refreshed Greenhouse job listings (%d active jobs found).', count($jobs)));

    if (!empty($jobs)) {
      $rows = [];
      foreach ($jobs as $job) {
        $rows[] = [
          $job['id'] ?? '-',
          $job['title'] ?? '-',
          $job['location'] ?? '-',
        ];
      }
      $this->io()->table(['ID', 'Title', 'Location'], $rows);
    }

    return DrushCommands::EXIT_SUCCESS;
  }

}
