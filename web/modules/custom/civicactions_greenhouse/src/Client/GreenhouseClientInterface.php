<?php

declare(strict_types=1);

namespace Drupal\civicactions_greenhouse\Client;

/**
 * Interface for Greenhouse Job Board API client.
 */
interface GreenhouseClientInterface {

  /**
   * Fetches active jobs from the Greenhouse Job Board API.
   *
   * @param bool $reset_cache
   *   Whether to bypass and reset the data cache.
   *
   * @return array
   *   An array containing:
   *   - 'jobs': An array of normalized job arrays.
   *   - 'from_cache': Whether the data was served from cache.
   *   - 'error': Optional error message if the fetch failed.
   */
  public function fetchJobs(bool $reset_cache = FALSE): array;

  /**
   * Proactively re-fetches and warms the jobs cache.
   *
   * @return array
   *   The fresh jobs data array.
   */
  public function warmCache(): array;

}
