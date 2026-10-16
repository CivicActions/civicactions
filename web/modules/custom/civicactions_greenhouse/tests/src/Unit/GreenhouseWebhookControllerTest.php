<?php

declare(strict_types=1);

namespace Drupal\Tests\civicactions_greenhouse\Unit;

use Drupal\civicactions_greenhouse\Client\GreenhouseClientInterface;
use Drupal\civicactions_greenhouse\Controller\GreenhouseWebhookController;
use Drupal\Core\Cache\CacheTagsInvalidatorInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\key\KeyInterface;
use Drupal\key\KeyRepositoryInterface;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Tests GreenhouseWebhookController authentication and cache invalidation.
 */
#[CoversClass(GreenhouseWebhookController::class)]
#[Group('civicactions_greenhouse')]
class GreenhouseWebhookControllerTest extends TestCase {

  /**
   * Tests webhook rejection when no secret or key is configured.
   */
  public function testHandleUnconfiguredSecret(): void {
    $config = $this->createMock(ImmutableConfig::class);
    $config->method('get')->willReturnMap([
      ['webhook_key', ''],
      ['webhook_secret', ''],
    ]);

    $config_factory = $this->createMock(ConfigFactoryInterface::class);
    $config_factory->method('get')->with('civicactions_greenhouse.settings')->willReturn($config);

    $client = $this->createMock(GreenhouseClientInterface::class);
    $cache_tags_invalidator = $this->createMock(CacheTagsInvalidatorInterface::class);
    $logger = $this->createMock(LoggerInterface::class);
    $key_repository = $this->createMock(KeyRepositoryInterface::class);

    $controller = new GreenhouseWebhookController(
      $config_factory,
      $client,
      $cache_tags_invalidator,
      $logger,
      $key_repository
    );

    $request = Request::create('/api/v1/greenhouse/webhook', 'POST', [], [], [], [
      'PHP_AUTH_PW' => 'some_secret',
    ]);

    $response = $controller->handle($request);
    $this->assertEquals(403, $response->getStatusCode());
  }

  /**
   * Tests webhook rejection when configured key entity does not exist.
   */
  public function testHandleKeyNotFound(): void {
    $config = $this->createMock(ImmutableConfig::class);
    $config->method('get')->willReturnMap([
      ['webhook_key', 'non_existent_key'],
      ['webhook_secret', ''],
    ]);

    $config_factory = $this->createMock(ConfigFactoryInterface::class);
    $config_factory->method('get')->with('civicactions_greenhouse.settings')->willReturn($config);

    $key_repository = $this->createMock(KeyRepositoryInterface::class);
    $key_repository->method('getKey')->with('non_existent_key')->willReturn(NULL);

    $client = $this->createMock(GreenhouseClientInterface::class);
    $cache_tags_invalidator = $this->createMock(CacheTagsInvalidatorInterface::class);
    $logger = $this->createMock(LoggerInterface::class);

    $controller = new GreenhouseWebhookController(
      $config_factory,
      $client,
      $cache_tags_invalidator,
      $logger,
      $key_repository
    );

    $request = Request::create('/api/v1/greenhouse/webhook', 'POST', [], [], [], [
      'PHP_AUTH_PW' => 'some_secret',
    ]);

    $response = $controller->handle($request);
    $this->assertEquals(403, $response->getStatusCode());
  }

  /**
   * Tests webhook rejection with invalid credentials using key module key.
   */
  public function testHandleInvalidCredentials(): void {
    $config = $this->createMock(ImmutableConfig::class);
    $config->method('get')->willReturnMap([
      ['webhook_key', 'greenhouse_webhook_key'],
      ['webhook_secret', ''],
    ]);

    $config_factory = $this->createMock(ConfigFactoryInterface::class);
    $config_factory->method('get')->with('civicactions_greenhouse.settings')->willReturn($config);

    $key = $this->createMock(KeyInterface::class);
    $key->method('getKeyValue')->willReturn('super_secret_123');

    $key_repository = $this->createMock(KeyRepositoryInterface::class);
    $key_repository->method('getKey')->with('greenhouse_webhook_key')->willReturn($key);

    $client = $this->createMock(GreenhouseClientInterface::class);
    $cache_tags_invalidator = $this->createMock(CacheTagsInvalidatorInterface::class);
    $logger = $this->createMock(LoggerInterface::class);

    $controller = new GreenhouseWebhookController(
      $config_factory,
      $client,
      $cache_tags_invalidator,
      $logger,
      $key_repository
    );

    // Request with wrong password.
    $request = Request::create('/api/v1/greenhouse/webhook', 'POST', [], [], [], [
      'PHP_AUTH_PW' => 'wrong_secret',
    ]);

    $response = $controller->handle($request);
    $this->assertEquals(403, $response->getStatusCode());
  }

  /**
   * Tests successful ping event handling using key module key.
   */
  public function testHandlePingSuccess(): void {
    $config = $this->createMock(ImmutableConfig::class);
    $config->method('get')->willReturnMap([
      ['webhook_key', 'greenhouse_webhook_key'],
      ['webhook_secret', ''],
    ]);

    $config_factory = $this->createMock(ConfigFactoryInterface::class);
    $config_factory->method('get')->with('civicactions_greenhouse.settings')->willReturn($config);

    $key = $this->createMock(KeyInterface::class);
    $key->method('getKeyValue')->willReturn('super_secret_123');

    $key_repository = $this->createMock(KeyRepositoryInterface::class);
    $key_repository->method('getKey')->with('greenhouse_webhook_key')->willReturn($key);

    $client = $this->createMock(GreenhouseClientInterface::class);
    $client->expects($this->never())->method('warmCache');

    $cache_tags_invalidator = $this->createMock(CacheTagsInvalidatorInterface::class);
    $cache_tags_invalidator->expects($this->never())->method('invalidateTags');

    $logger = $this->createMock(LoggerInterface::class);

    $controller = new GreenhouseWebhookController(
      $config_factory,
      $client,
      $cache_tags_invalidator,
      $logger,
      $key_repository
    );

    $request = Request::create(
      '/api/v1/greenhouse/webhook',
      'POST',
      [],
      [],
      [],
      ['PHP_AUTH_PW' => 'super_secret_123', 'CONTENT_TYPE' => 'application/json'],
      json_encode(['action' => 'ping'])
    );

    $response = $controller->handle($request);
    $this->assertEquals(200, $response->getStatusCode());
    $data = json_decode((string) $response->getContent(), TRUE);
    $this->assertEquals('success', $data['status']);
    $this->assertEquals('Webhook ping acknowledged.', $data['message']);
  }

  /**
   * Tests job post event triggers tag invalidation and cache re-warm.
   */
  public function testHandleJobPostEventSuccess(): void {
    $config = $this->createMock(ImmutableConfig::class);
    $config->method('get')->willReturnMap([
      ['webhook_key', 'greenhouse_webhook_key'],
      ['webhook_secret', ''],
    ]);

    $config_factory = $this->createMock(ConfigFactoryInterface::class);
    $config_factory->method('get')->with('civicactions_greenhouse.settings')->willReturn($config);

    $key = $this->createMock(KeyInterface::class);
    $key->method('getKeyValue')->willReturn('super_secret_123');

    $key_repository = $this->createMock(KeyRepositoryInterface::class);
    $key_repository->method('getKey')->with('greenhouse_webhook_key')->willReturn($key);

    $client = $this->createMock(GreenhouseClientInterface::class);
    $client->expects($this->once())->method('warmCache')->willReturn(['jobs' => []]);

    $cache_tags_invalidator = $this->createMock(CacheTagsInvalidatorInterface::class);
    $cache_tags_invalidator->expects($this->once())
      ->method('invalidateTags')
      ->with(['civicactions_greenhouse:jobs']);

    $logger = $this->createMock(LoggerInterface::class);

    $controller = new GreenhouseWebhookController(
      $config_factory,
      $client,
      $cache_tags_invalidator,
      $logger,
      $key_repository
    );

    $request = Request::create(
      '/api/v1/greenhouse/webhook',
      'POST',
      [],
      [],
      [],
      ['PHP_AUTH_PW' => 'super_secret_123', 'CONTENT_TYPE' => 'application/json'],
      json_encode([
        'action' => 'job_post_created',
        'payload' => ['id' => 999],
      ])
    );

    $response = $controller->handle($request);
    $this->assertEquals(200, $response->getStatusCode());
    $data = json_decode((string) $response->getContent(), TRUE);
    $this->assertEquals('success', $data['status']);
    $this->assertEquals('job_post_created', $data['action']);
  }

}
