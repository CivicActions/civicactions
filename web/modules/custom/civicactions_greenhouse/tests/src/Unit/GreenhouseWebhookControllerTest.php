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
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Tests Greenhouse webhook signature verification and cache invalidation.
 */
#[CoversClass(GreenhouseWebhookController::class)]
#[Group('civicactions_greenhouse')]
class GreenhouseWebhookControllerTest extends TestCase {

  private const SECRET = 'test-secret-value';

  /**
   * The mocked Greenhouse client.
   */
  private GreenhouseClientInterface&MockObject $client;

  /**
   * The mocked cache tags invalidator.
   */
  private CacheTagsInvalidatorInterface&MockObject $invalidator;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->client = $this->createMock(GreenhouseClientInterface::class);
    $this->invalidator = $this->createMock(CacheTagsInvalidatorInterface::class);
  }

  /**
   * Builds a controller whose key resolves to the given value.
   *
   * @param string $key_id
   *   The configured webhook_key value.
   * @param string|null $key_value
   *   The key value, or NULL if the key entity does not exist.
   */
  private function buildController(string $key_id = 'greenhouse_webhook', ?string $key_value = self::SECRET): GreenhouseWebhookController {
    $config = $this->createMock(ImmutableConfig::class);
    $config->method('get')->with('webhook_key')->willReturn($key_id);
    $config_factory = $this->createMock(ConfigFactoryInterface::class);
    $config_factory->method('get')->with('civicactions_greenhouse.settings')->willReturn($config);

    $key = NULL;
    if ($key_value !== NULL) {
      $key = $this->createMock(KeyInterface::class);
      $key->method('getKeyValue')->willReturn($key_value);
    }
    $key_repository = $this->createMock(KeyRepositoryInterface::class);
    $key_repository->method('getKey')->willReturn($key);

    return new GreenhouseWebhookController(
      $config_factory,
      $this->client,
      $this->invalidator,
      $this->createMock(LoggerInterface::class),
      $key_repository,
    );
  }

  /**
   * Builds a webhook request with optional headers.
   */
  private function buildRequest(string $body, array $server = []): Request {
    return Request::create(
      '/api/v1/greenhouse/webhook',
      'POST',
      [],
      [],
      [],
      $server + ['CONTENT_TYPE' => 'application/json'],
      $body,
    );
  }

  /**
   * Builds a request signed the way Greenhouse signs it.
   */
  private function buildSignedRequest(string $body, string $secret = self::SECRET): Request {
    return $this->buildRequest($body, [
      'HTTP_SIGNATURE' => 'sha256 ' . hash_hmac('sha256', $body, $secret),
    ]);
  }

  /**
   * Asserts the request is rejected with 403 and has no side effects.
   */
  private function assertRejected(GreenhouseWebhookController $controller, Request $request): void {
    $this->invalidator->expects($this->never())->method('invalidateTags');
    $this->client->expects($this->never())->method('warmCache');

    $response = $controller->handle($request);
    $this->assertSame(403, $response->getStatusCode());
    $this->assertSame('error', json_decode((string) $response->getContent(), TRUE)['status']);
  }

  /**
   * Tests that a validly signed ping is acknowledged without invalidation.
   */
  public function testSignedPingIsAcknowledged(): void {
    $this->invalidator->expects($this->never())->method('invalidateTags');
    $this->client->expects($this->never())->method('warmCache');

    $response = $this->buildController()->handle($this->buildSignedRequest('{"action":"ping"}'));

    $this->assertSame(200, $response->getStatusCode());
    $this->assertSame('Webhook ping acknowledged.', json_decode((string) $response->getContent(), TRUE)['message']);
  }

  /**
   * Tests that signed job post events invalidate and re-warm the cache.
   */
  #[DataProvider('jobPostActionProvider')]
  public function testSignedJobPostEventInvalidatesAndWarms(string $action): void {
    $this->invalidator->expects($this->once())
      ->method('invalidateTags')
      ->with(['civicactions_greenhouse:jobs']);
    $this->client->expects($this->once())->method('warmCache')->willReturn(['jobs' => []]);

    $body = json_encode(['action' => $action, 'payload' => ['job_post' => ['id' => 1]]]);
    $response = $this->buildController()->handle($this->buildSignedRequest($body));

    $this->assertSame(200, $response->getStatusCode());
    $this->assertSame($action, json_decode((string) $response->getContent(), TRUE)['action']);
  }

  /**
   * Provides the job post actions that trigger invalidation.
   */
  public static function jobPostActionProvider(): array {
    return [
      'created' => ['job_post_created'],
      'updated' => ['job_post_updated'],
      'deleted' => ['job_post_deleted'],
    ];
  }

  /**
   * Tests that unrelated actions are acknowledged without invalidation.
   */
  public function testSignedUnrelatedActionDoesNotInvalidate(): void {
    $this->invalidator->expects($this->never())->method('invalidateTags');
    $this->client->expects($this->never())->method('warmCache');

    $response = $this->buildController()->handle($this->buildSignedRequest('{"action":"candidate_hired"}'));

    $this->assertSame(200, $response->getStatusCode());
  }

  /**
   * Tests that surrounding whitespace in the stored key value is ignored.
   */
  public function testKeyValueWhitespaceIsTrimmed(): void {
    $controller = $this->buildController(key_value: "  " . self::SECRET . "\n");

    $response = $controller->handle($this->buildSignedRequest('{"action":"ping"}'));

    $this->assertSame(200, $response->getStatusCode());
  }

  /**
   * Tests that an uppercase hex digest is accepted.
   */
  public function testUppercaseDigestIsAccepted(): void {
    $body = '{"action":"ping"}';
    $request = $this->buildRequest($body, [
      'HTTP_SIGNATURE' => 'sha256 ' . strtoupper(hash_hmac('sha256', $body, self::SECRET)),
    ]);

    $this->assertSame(200, $this->buildController()->handle($request)->getStatusCode());
  }

  /**
   * Tests rejection when no webhook key is configured.
   */
  public function testRejectsWhenKeyNotConfigured(): void {
    $this->assertRejected(
      $this->buildController(key_id: ''),
      $this->buildSignedRequest('{"action":"ping"}', ''),
    );
  }

  /**
   * Tests rejection when the configured key entity does not exist.
   */
  public function testRejectsWhenKeyEntityMissing(): void {
    $this->assertRejected(
      $this->buildController(key_value: NULL),
      $this->buildSignedRequest('{"action":"ping"}'),
    );
  }

  /**
   * Tests rejection when the key entity has an empty value.
   */
  public function testRejectsWhenKeyValueEmpty(): void {
    $this->assertRejected(
      $this->buildController(key_value: '   '),
      $this->buildSignedRequest('{"action":"ping"}', ''),
    );
  }

  /**
   * Tests rejection of requests without a Signature header.
   */
  public function testRejectsMissingSignature(): void {
    $this->assertRejected(
      $this->buildController(),
      $this->buildRequest('{"action":"job_post_created"}'),
    );
  }

  /**
   * Tests rejection of a signature made with the wrong secret.
   */
  public function testRejectsWrongSecret(): void {
    $this->assertRejected(
      $this->buildController(),
      $this->buildSignedRequest('{"action":"job_post_created"}', 'wrong-secret'),
    );
  }

  /**
   * Tests rejection when the body was altered after signing.
   */
  public function testRejectsTamperedBody(): void {
    $signature = hash_hmac('sha256', '{"action":"ping"}', self::SECRET);
    $request = $this->buildRequest('{"action":"job_post_deleted"}', [
      'HTTP_SIGNATURE' => 'sha256 ' . $signature,
    ]);

    $this->assertRejected($this->buildController(), $request);
  }

  /**
   * Tests rejection of malformed Signature header values.
   */
  #[DataProvider('malformedSignatureProvider')]
  public function testRejectsMalformedSignatureHeader(string $header): void {
    $request = $this->buildRequest('{"action":"ping"}', ['HTTP_SIGNATURE' => $header]);

    $this->assertRejected($this->buildController(), $request);
  }

  /**
   * Provides malformed Signature header values.
   */
  public static function malformedSignatureProvider(): array {
    $digest = hash_hmac('sha256', '{"action":"ping"}', self::SECRET);
    return [
      'digest without algorithm' => [$digest],
      'wrong algorithm' => ['sha1 ' . $digest],
      'truncated digest' => ['sha256 ' . substr($digest, 0, 32)],
      'non-hex digest' => ['sha256 ' . str_repeat('z', 64)],
      'empty' => [''],
    ];
  }

  /**
   * Tests that HTTP Basic Auth containing the secret is not accepted.
   */
  #[DataProvider('basicAuthProvider')]
  public function testRejectsBasicAuthWithSecret(array $server): void {
    $this->assertRejected(
      $this->buildController(),
      $this->buildRequest('{"action":"job_post_created"}', $server),
    );
  }

  /**
   * Provides Basic Auth credential placements that must be rejected.
   */
  public static function basicAuthProvider(): array {
    return [
      'secret as password' => [['PHP_AUTH_USER' => 'greenhouse', 'PHP_AUTH_PW' => self::SECRET]],
      'secret as username' => [['PHP_AUTH_USER' => self::SECRET, 'PHP_AUTH_PW' => '']],
      'authorization header' => [['HTTP_AUTHORIZATION' => 'Basic ' . base64_encode(':' . self::SECRET)]],
    ];
  }

  /**
   * Tests that signed but invalid payloads return 400.
   */
  #[DataProvider('invalidPayloadProvider')]
  public function testSignedInvalidPayloadReturnsBadRequest(string $body): void {
    $this->invalidator->expects($this->never())->method('invalidateTags');

    $response = $this->buildController()->handle($this->buildSignedRequest($body));

    $this->assertSame(400, $response->getStatusCode());
  }

  /**
   * Provides signed payloads that are malformed or missing an action.
   */
  public static function invalidPayloadProvider(): array {
    return [
      'empty body' => [''],
      'malformed json' => ['{not json'],
      'json scalar' => ['"ping"'],
      'missing action' => ['{"payload":{}}'],
      'empty action' => ['{"action":""}'],
      'non-string action' => ['{"action":["ping"]}'],
    ];
  }

}
