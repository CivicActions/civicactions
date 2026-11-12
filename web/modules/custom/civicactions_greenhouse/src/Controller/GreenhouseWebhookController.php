<?php

declare(strict_types=1);

namespace Drupal\civicactions_greenhouse\Controller;

use Drupal\civicactions_greenhouse\Client\GreenhouseClientInterface;
use Drupal\Core\Cache\CacheTagsInvalidatorInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Controller\ControllerBase;
use Drupal\key\KeyRepositoryInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Handles incoming Greenhouse webhook requests for cache invalidation.
 */
final class GreenhouseWebhookController extends ControllerBase {

  /**
   * Constructs a new GreenhouseWebhookController instance.
   */
  public function __construct(
    ConfigFactoryInterface $config_factory,
    protected readonly GreenhouseClientInterface $greenhouseClient,
    protected readonly CacheTagsInvalidatorInterface $cacheTagsInvalidator,
    protected readonly LoggerInterface $logger,
    protected readonly KeyRepositoryInterface $keyRepository,
  ) {
    $this->configFactory = $config_factory;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): static {
    return new static(
      $container->get('config.factory'),
      $container->get('civicactions_greenhouse.client'),
      $container->get('cache_tags.invalidator'),
      $container->get('logger.channel.civicactions_greenhouse'),
      $container->get('key.repository')
    );
  }

  /**
   * Handles incoming webhook POST request.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The incoming request.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   */
  public function handle(Request $request): JsonResponse {
    if (!$this->authenticate($request)) {
      $this->logger->warning(
        'Rejected Greenhouse webhook request from @ip (Signature header @sig).',
        [
          '@ip' => $request->getClientIp(),
          '@sig' => $request->headers->has('Signature') ? 'invalid' : 'missing',
        ]
      );
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Invalid or missing webhook signature.',
      ], 403);
    }

    $content = $request->getContent();
    if (empty($content)) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Empty request payload.',
      ], 400);
    }

    try {
      $payload = json_decode($content, TRUE, 512, JSON_THROW_ON_ERROR);
    }
    catch (\Throwable) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Malformed JSON payload.',
      ], 400);
    }

    $action = is_array($payload) ? ($payload['action'] ?? NULL) : NULL;
    if (!is_string($action) || $action === '') {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Missing action field.',
      ], 400);
    }

    // Handle initial ping / registration from Greenhouse.
    if ($action === 'ping') {
      return new JsonResponse([
        'status' => 'success',
        'message' => 'Webhook ping acknowledged.',
      ], 200);
    }

    // Handle job post modification events.
    $relevant_actions = [
      'job_post_created',
      'job_post_updated',
      'job_post_deleted',
    ];

    if (in_array($action, $relevant_actions, TRUE)) {
      // 1. Invalidate cache tag immediately.
      $this->cacheTagsInvalidator->invalidateTags(['civicactions_greenhouse:jobs']);

      // 2. Proactively re-warm the cache so the next visitor gets
      // instant response.
      $this->greenhouseClient->warmCache();

      $this->logger->info(
        'Processed Greenhouse webhook @action: cache invalidated and re-warmed.',
        ['@action' => $action]
      );

      return new JsonResponse([
        'status' => 'success',
        'message' => 'Cache invalidated and jobs re-warmed successfully.',
        'action' => $action,
      ], 200);
    }

    // Default response for unhandled action.
    return new JsonResponse([
      'status' => 'success',
      'message' => "Received action {$action}, no cache invalidation required.",
      'action' => $action,
    ], 200);
  }

  /**
   * Resolves the webhook secret from the configured Key entity.
   *
   * @return string
   *   The secret with surrounding whitespace removed, or an empty string if
   *   no key is configured or the key has no value.
   */
  protected function getSecret(): string {
    $key_id = (string) $this->configFactory
      ->get('civicactions_greenhouse.settings')
      ->get('webhook_key');
    if ($key_id === '') {
      return '';
    }

    $key = $this->keyRepository->getKey($key_id);
    return $key ? trim((string) $key->getKeyValue()) : '';
  }

  /**
   * Verifies the Greenhouse HMAC SHA-256 signature of the request body.
   *
   * Greenhouse sends "Signature: sha256 <hex digest>", where the digest is
   * hash_hmac('sha256', <raw body>, <secret key>).
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The incoming request.
   *
   * @return bool
   *   TRUE if the signature matches, FALSE otherwise.
   */
  protected function authenticate(Request $request): bool {
    $secret = $this->getSecret();
    if ($secret === '') {
      return FALSE;
    }

    $header = trim((string) $request->headers->get('Signature', ''));
    if (!preg_match('/^sha256 ([0-9a-f]{64})$/i', $header, $matches)) {
      return FALSE;
    }

    $expected = hash_hmac('sha256', (string) $request->getContent(), $secret);
    return hash_equals($expected, strtolower($matches[1]));
  }

}
