<?php

declare(strict_types=1);

namespace Drupal\civicactions_greenhouse\Controller;

use Drupal\civicactions_greenhouse\Client\GreenhouseClientInterface;
use Drupal\Core\Cache\CacheTagsInvalidatorInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Controller\ControllerBase;
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
      $container->get('logger.channel.civicactions_greenhouse')
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
      $this->logger->warning('Rejected unauthorized Greenhouse webhook request from @ip', [
        '@ip' => $request->getClientIp(),
      ]);
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Invalid or missing webhook credentials.',
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

    $action = $payload['action'] ?? NULL;
    if (!$action) {
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
   * Authenticates the webhook request against the configured secret.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The incoming request.
   *
   * @return bool
   *   TRUE if authenticated, FALSE otherwise.
   */
  protected function authenticate(Request $request): bool {
    $configured_secret = (string) $this->configFactory->get('civicactions_greenhouse.settings')->get('webhook_secret');
    $configured_secret = trim($configured_secret);

    // If no secret has been configured, reject all webhook requests.
    if ($configured_secret === '') {
      return FALSE;
    }

    $user = $request->getUser();
    $password = $request->getPassword();

    // Check password or username against configured secret using constant-time
    // comparison.
    if ($password !== NULL && hash_equals($configured_secret, $password)) {
      return TRUE;
    }

    if ($user !== NULL && hash_equals($configured_secret, $user)) {
      return TRUE;
    }

    // Check direct server variables (e.g. when username is omitted or in test
    // requests).
    $server_pw = $request->server->get('PHP_AUTH_PW');
    if ($server_pw !== NULL && hash_equals($configured_secret, (string) $server_pw)) {
      return TRUE;
    }

    $server_user = $request->server->get('PHP_AUTH_USER');
    if ($server_user !== NULL && hash_equals($configured_secret, (string) $server_user)) {
      return TRUE;
    }

    // Support Authorization header if not extracted into PHP_AUTH_* by server.
    $auth_header = $request->headers->get('Authorization', '');
    if (str_starts_with($auth_header, 'Basic ')) {
      $decoded = base64_decode(substr($auth_header, 6), TRUE);
      if ($decoded !== FALSE) {
        $parts = explode(':', $decoded, 2);
        $header_user = $parts[0];
        $header_pw = $parts[1] ?? '';

        if (hash_equals($configured_secret, $header_pw) || hash_equals($configured_secret, $header_user)) {
          return TRUE;
        }
      }
    }

    return FALSE;
  }

}
