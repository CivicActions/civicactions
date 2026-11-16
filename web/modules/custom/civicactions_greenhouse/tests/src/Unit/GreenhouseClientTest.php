<?php

declare(strict_types=1);

namespace Drupal\Tests\civicactions_greenhouse\Unit;

use Drupal\civicactions_greenhouse\Client\GreenhouseClient;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\ImmutableConfig;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Psr7\Request as GuzzleRequest;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;

/**
 * Tests GreenhouseClient API response parsing, suffix stripping, and caching.
 */
#[CoversClass(GreenhouseClient::class)]
#[Group('civicactions_greenhouse')]
class GreenhouseClientTest extends TestCase {

  /**
   * Tests title cleaning strips literal trailing (Remote) only.
   */
  #[DataProvider('titleProvider')]
  public function testCleanJobTitle(string $raw_title, string $expected_title): void {
    $this->assertEquals($expected_title, GreenhouseClient::cleanTitle($raw_title));
  }

  /**
   * Data provider for title cleaning.
   */
  public static function titleProvider(): array {
    return [
      'trailing remote' => ['Senior Drupal Engineer (Remote)', 'Senior Drupal Engineer'],
      'trailing remote lowercase' => ['Full Stack Developer (remote)', 'Full Stack Developer'],
      'trailing remote with spaces' => ['Product Designer  (Remote)  ', 'Product Designer'],
      'remote inside title preserved' => ['Remote Sensing Scientist', 'Remote Sensing Scientist'],
      'remote with location preserved' => ['Engineer (Remote, US)', 'Engineer (Remote, US)'],
      'no remote suffix' => ['Delivery Manager', 'Delivery Manager'],
    ];
  }

  /**
   * Tests fetchJobs with a successful HTTP response.
   */
  public function testFetchJobsSuccess(): void {
    $raw_json = json_encode([
      'jobs' => [
        [
          'id' => 101,
          'title' => 'Drupal Architect (Remote)',
          'absolute_url' => 'https://job-boards.greenhouse.io/civicactions/jobs/101',
          'location' => ['name' => 'Remote, US'],
        ],
        [
          'id' => 102,
          'title' => 'UX Researcher',
          'absolute_url' => 'https://job-boards.greenhouse.io/civicactions/jobs/102',
          'location' => ['name' => 'Washington, DC'],
        ],
      ],
    ]);

    $http_client = $this->createMock(ClientInterface::class);
    $http_client->expects($this->once())
      ->method('request')
      ->with('GET', 'https://boards-api.greenhouse.io/v1/boards/civicactions/jobs', $this->anything())
      ->willReturn(new Response(200, ['Content-Type' => 'application/json'], $raw_json));

    $config = $this->createMock(ImmutableConfig::class);
    $config->method('get')->willReturnMap([
      ['board_token', 'civicactions'],
    ]);

    $config_factory = $this->createMock(ConfigFactoryInterface::class);
    $config_factory->method('get')->with('civicactions_greenhouse.settings')->willReturn($config);

    $cache = $this->createMock(CacheBackendInterface::class);
    $cache->method('get')->willReturn(FALSE);
    $cache->expects($this->once())
      ->method('set')
      ->with(
        'civicactions_greenhouse:jobs_data:civicactions',
        $this->callback(function ($jobs) {
          return count($jobs) === 2
            && $jobs[0]['title'] === 'Drupal Architect'
            && $jobs[1]['title'] === 'UX Researcher';
        }),
        CacheBackendInterface::CACHE_PERMANENT,
        ['civicactions_greenhouse:jobs']
      );

    $logger = $this->createMock(LoggerInterface::class);

    $client = new GreenhouseClient($http_client, $config_factory, $cache, $logger);
    $result = $client->fetchJobs(TRUE);

    $this->assertCount(2, $result['jobs']);
    $this->assertEquals('Drupal Architect', $result['jobs'][0]['title']);
    $this->assertEquals('UX Researcher', $result['jobs'][1]['title']);
    $this->assertFalse($result['from_cache']);
    $this->assertNull($result['error']);
  }

  /**
   * Builds a client whose HTTP request throws a connection error.
   */
  private function buildFailingClient(CacheBackendInterface $cache): GreenhouseClient {
    $http_client = $this->createMock(ClientInterface::class);
    $http_client->method('request')->willThrowException(
      new ConnectException('Connection timed out', new GuzzleRequest('GET', 'https://boards-api.greenhouse.io'))
    );

    $config = $this->createMock(ImmutableConfig::class);
    $config->method('get')->with('board_token')->willReturn('civicactions');
    $config_factory = $this->createMock(ConfigFactoryInterface::class);
    $config_factory->method('get')->willReturn($config);

    return new GreenhouseClient($http_client, $config_factory, $cache, $this->createMock(LoggerInterface::class));
  }

  /**
   * Tests that a failed refresh serves the invalidated (stale) job list.
   */
  public function testFetchFailureServesStaleCacheAfterInvalidation(): void {
    $stale_jobs = [['id' => 1, 'title' => 'Engineer', 'url' => 'https://example.com/1', 'location' => '']];
    $cache = $this->createMock(CacheBackendInterface::class);
    $cache->expects($this->never())->method('set');
    // The item was invalidated by the webhook, so only allow_invalid finds it.
    $cache->method('get')->willReturnCallback(
      fn (string $cid, bool $allow_invalid = FALSE) => $allow_invalid ? (object) ['data' => $stale_jobs] : FALSE
    );

    $result = $this->buildFailingClient($cache)->fetchJobs(TRUE);

    $this->assertSame($stale_jobs, $result['jobs']);
    $this->assertTrue($result['from_cache']);
    $this->assertNotNull($result['error']);
  }

  /**
   * Tests the empty error result when the API fails and nothing is cached.
   */
  public function testFetchFailureWithoutCacheReturnsError(): void {
    $cache = $this->createMock(CacheBackendInterface::class);
    $cache->method('get')->willReturn(FALSE);
    $cache->expects($this->never())->method('set');

    $result = $this->buildFailingClient($cache)->fetchJobs(TRUE);

    $this->assertSame([], $result['jobs']);
    $this->assertFalse($result['from_cache']);
    $this->assertSame('Currently unable to retrieve job postings.', $result['error']);
  }

}
