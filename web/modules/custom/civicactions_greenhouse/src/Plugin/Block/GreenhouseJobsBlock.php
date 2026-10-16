<?php

declare(strict_types=1);

namespace Drupal\civicactions_greenhouse\Plugin\Block;

use Drupal\civicactions_greenhouse\Client\GreenhouseClientInterface;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Provides a block displaying active Greenhouse career opportunities.
 *
 * @Block(
 *   id = "civicactions_greenhouse_jobs",
 *   admin_label = @Translation("Greenhouse Job Listings"),
 *   category = @Translation("CivicActions")
 * )
 */
final class GreenhouseJobsBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Constructs a new GreenhouseJobsBlock instance.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    protected GreenhouseClientInterface $greenhouseClient,
    protected ConfigFactoryInterface $configFactory,
    protected RequestStack $requestStack,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): static {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('civicactions_greenhouse.client'),
      $container->get('config.factory'),
      $container->get('request_stack')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build(): array {
    $config = $this->configFactory->get('civicactions_greenhouse.settings');
    $heading = $config->get('heading') ?? 'Open positions';
    $intro = $config->get('intro') ?? '';

    // Inspect incoming referral parameter.
    $request = $this->requestStack->getCurrentRequest();
    $gh_src = $request ? $request->query->get('gh_src') : NULL;
    $sanitized_gh_src = is_string($gh_src) && !empty(trim($gh_src)) ? trim($gh_src) : NULL;

    $fetch_result = $this->greenhouseClient->fetchJobs();
    $raw_jobs = $fetch_result['jobs'] ?? [];
    $error = $fetch_result['error'] ?? NULL;

    $jobs = [];
    foreach ($raw_jobs as $job) {
      $url = $job['url'] ?? '';
      if ($sanitized_gh_src && !empty($url)) {
        $separator = str_contains($url, '?') ? '&' : '?';
        $url .= $separator . 'gh_src=' . rawurlencode($sanitized_gh_src);
      }

      $jobs[] = [
        'id' => $job['id'] ?? NULL,
        'title' => $job['title'] ?? '',
        'url' => $url,
        'location' => $job['location'] ?? '',
      ];
    }

    return [
      '#theme' => 'civicactions_greenhouse_jobs',
      '#heading' => $heading,
      '#intro' => $intro,
      '#jobs' => $jobs,
      '#empty_message' => $this->t('No positions are currently open. Please check back again soon!'),
      '#error_message' => $error ? $this->t('@error', ['@error' => $error]) : NULL,
      '#attached' => [
        'library' => [
          'civicactions_greenhouse/civicactions-greenhouse-jobs',
        ],
      ],
      '#cache' => [
        'tags' => [
          'civicactions_greenhouse:jobs',
          'config:civicactions_greenhouse.settings',
        ],
        'contexts' => [
          'url.query_args:gh_src',
        ],
      ],
    ];
  }

}
