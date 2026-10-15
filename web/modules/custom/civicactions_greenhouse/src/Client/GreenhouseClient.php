<?php

declare(strict_types=1);

namespace Drupal\civicactions_greenhouse\Client;

use Drupal\Component\Utility\UrlHelper;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use GuzzleHttp\ClientInterface;
use Psr\Log\LoggerInterface;

/**
 * Service to fetch and cache jobs from the Greenhouse Job Board API.
 */
class GreenhouseClient implements GreenhouseClientInterface {

  /**
   * Base URL for the Greenhouse boards API.
   */
  public const BASE_API_URL = 'https://boards-api.greenhouse.io/v1/boards';

  /**
   * Timeout in seconds for upstream requests.
   */
  public const TIMEOUT_SECONDS = 4.0;

  /**
   * Constructs a GreenhouseClient object.
   */
  public function __construct(
    protected readonly ClientInterface $httpClient,
    protected readonly ConfigFactoryInterface $configFactory,
    protected readonly CacheBackendInterface $cache,
    protected readonly LoggerInterface $logger,
  ) {}

  /**
   * {@inheritdoc}
   */
  public function fetchJobs(bool $reset_cache = FALSE): array {
    $board_token = $this->getBoardToken();
    $cid = "civicactions_greenhouse:jobs_data:{$board_token}";

    if (!$reset_cache && ($cache_item = $this->cache->get($cid))) {
      return [
        'jobs' => $cache_item->data,
        'from_cache' => TRUE,
        'error' => NULL,
      ];
    }

    try {
      $endpoint = self::BASE_API_URL . '/' . rawurlencode($board_token) . '/jobs';
      $response = $this->httpClient->request('GET', $endpoint, [
        'timeout' => self::TIMEOUT_SECONDS,
        'connect_timeout' => self::TIMEOUT_SECONDS,
        'headers' => [
          'Accept' => 'application/json',
          'User-Agent' => 'CivicActions-Drupal/11 (+https://civicactions.com)',
        ],
      ]);

      if ($response->getStatusCode() !== 200) {
        throw new \RuntimeException("Greenhouse API returned unexpected HTTP status {$response->getStatusCode()}");
      }

      $data = json_decode((string) $response->getBody(), TRUE, 512, JSON_THROW_ON_ERROR);
      $raw_jobs = $data['jobs'] ?? [];
      $normalized_jobs = $this->normalizeJobs($raw_jobs);

      // Cache normalized jobs permanently until explicitly invalidated by tag.
      $this->cache->set(
        $cid,
        $normalized_jobs,
        CacheBackendInterface::CACHE_PERMANENT,
        ['civicactions_greenhouse:jobs']
      );

      return [
        'jobs' => $normalized_jobs,
        'from_cache' => FALSE,
        'error' => NULL,
      ];
    }
    catch (\Throwable $e) {
      $this->logger->warning('Failed to fetch jobs from Greenhouse API: @message', [
        '@message' => $e->getMessage(),
      ]);

      // Fallback: check if we have any stale cache entry.
      if ($cache_item = $this->cache->get($cid)) {
        return [
          'jobs' => $cache_item->data,
          'from_cache' => TRUE,
          'error' => 'Served from fallback cache due to API unavailability.',
        ];
      }

      return [
        'jobs' => [],
        'from_cache' => FALSE,
        'error' => 'Currently unable to retrieve job postings.',
      ];
    }
  }

  /**
   * {@inheritdoc}
   */
  public function warmCache(): array {
    return $this->fetchJobs(TRUE);
  }

  /**
   * Cleans job title by removing strictly trailing literal "(Remote)".
   *
   * @param string $title
   *   The raw job title.
   *
   * @return string
   *   The cleaned job title.
   */
  public static function cleanTitle(string $title): string {
    $cleaned = preg_replace('/\s*\(remote\)\s*$/i', '', $title);
    return trim($cleaned ?? $title);
  }

  /**
   * Normalizes raw jobs data from Greenhouse.
   *
   * @param array $raw_jobs
   *   Array of job records from API.
   *
   * @return array
   *   Normalized job records.
   */
  protected function normalizeJobs(array $raw_jobs): array {
    $normalized = [];

    foreach ($raw_jobs as $job) {
      if (!is_array($job) || empty($job['title']) || empty($job['absolute_url'])) {
        continue;
      }

      $raw_title = (string) $job['title'];
      $clean_title = self::cleanTitle($raw_title);
      $url = UrlHelper::stripDangerousProtocols((string) $job['absolute_url']);
      $location_name = is_array($job['location'] ?? NULL) ? (string) ($job['location']['name'] ?? '') : '';

      $normalized[] = [
        'id' => $job['id'] ?? NULL,
        'title' => $clean_title,
        'raw_title' => $raw_title,
        'url' => $url,
        'location' => $location_name,
      ];
    }

    return $normalized;
  }

  /**
   * Retrieves the configured board token.
   */
  protected function getBoardToken(): string {
    $token = (string) $this->configFactory->get('civicactions_greenhouse.settings')->get('board_token');
    return !empty(trim($token)) ? trim($token) : 'civicactions';
  }

}
