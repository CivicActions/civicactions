<?php

declare(strict_types=1);

namespace Drupal\civicactions_blog_migration;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\State\StateInterface;
use Drupal\path_alias\AliasManagerInterface;

/**
 * Creates and rolls back legacy redirects for migrated Medium articles.
 */
final class MediumLegacyRedirectSync {

  private const STATE_KEY = 'civicactions_blog_migration.medium_legacy_redirect_rids';

  /**
   * Constructs a redirect sync helper.
   */
  public function __construct(
    private readonly Connection $database,
    private readonly EntityTypeManagerInterface $entityTypeManager,
    private readonly AliasManagerInterface $pathAliasManager,
    private readonly ModuleHandlerInterface $moduleHandler,
    private readonly StateInterface $state,
  ) {}

  /**
   * Creates redirects from Medium slug-hash paths to current editorial aliases.
   *
   * @return array<string, int|string>
   *   Summary statistics.
   */
  public function sync(bool $dry_run = FALSE): array {
    if (!$this->moduleHandler->moduleExists('redirect')) {
      return ['status' => 'skipped', 'reason' => 'Redirect module is not enabled.'];
    }

    $posts = $this->loadMetadataPosts();
    if ($posts === NULL) {
      return ['status' => 'skipped', 'reason' => 'metadata-unreadable'];
    }
    if (!$this->database->schema()->tableExists('migrate_map_civicactions_medium_articles')) {
      return ['status' => 'skipped', 'reason' => 'migration-map-missing'];
    }

    $node_storage = $this->entityTypeManager->getStorage('node');
    $path_alias_storage = $this->entityTypeManager->getStorage('path_alias');
    $redirect_storage = $this->entityTypeManager->getStorage('redirect');

    $created = 0;
    $invalid_source = 0;
    $missing_map = 0;
    $missing_node = 0;
    $not_article_editorial = 0;
    $conflict_alias = 0;
    $conflict_redirect = 0;
    $self_target = 0;
    $created_rids = [];

    foreach ($posts as $post) {
      $source_id = (string) ($post['id'] ?? '');
      $source_url = (string) ($post['source_url'] ?? '');
      $legacy_path = $this->extractMediumLegacyPath($source_url);
      if ($source_id === '' || $legacy_path === NULL) {
        $invalid_source++;
        continue;
      }

      $legacy_source = ltrim($legacy_path, '/');
      $nid = $this->database->select('migrate_map_civicactions_medium_articles', 'm')
        ->fields('m', ['destid1'])
        ->condition('sourceid1', $source_id)
        ->range(0, 1)
        ->execute()
        ->fetchField();

      if (!$nid) {
        $missing_map++;
        continue;
      }

      $node = $node_storage->load((int) $nid);
      if (!$node || $node->bundle() !== 'editorial') {
        $missing_node++;
        continue;
      }
      if (!$node->hasField('field_editorial_type')) {
        $not_article_editorial++;
        continue;
      }

      $is_article_editorial = FALSE;
      foreach ($node->get('field_editorial_type')->referencedEntities() as $term) {
        if ($term->bundle() === 'editorial_type' && $term->label() === 'Article') {
          $is_article_editorial = TRUE;
          break;
        }
      }
      if (!$is_article_editorial) {
        $not_article_editorial++;
        continue;
      }

      $target_alias = $this->pathAliasManager->getAliasByPath('/node/' . $node->id(), $node->language()->getId());
      if ($target_alias === $legacy_path) {
        $self_target++;
        continue;
      }

      $alias_conflict = $path_alias_storage->getQuery()
        ->accessCheck(FALSE)
        ->condition('alias', $legacy_path)
        ->range(0, 1)
        ->execute();
      if (!empty($alias_conflict)) {
        $conflict_alias++;
        continue;
      }

      $redirect_conflict = $redirect_storage->getQuery()
        ->accessCheck(FALSE)
        ->condition('redirect_source.path', $legacy_source)
        ->range(0, 1)
        ->execute();
      if (!empty($redirect_conflict)) {
        $conflict_redirect++;
        continue;
      }

      $created++;
      if ($dry_run) {
        continue;
      }

      $redirect = $redirect_storage->create([
        'type' => 'redirect',
        'language' => $node->language()->getId(),
        'status_code' => 301,
        'redirect_source' => ['path' => $legacy_source],
        'redirect_redirect' => ['uri' => 'internal:' . $target_alias],
      ]);
      $redirect->save();
      $created_rids[] = (int) $redirect->id();
    }

    if (!$dry_run && !empty($created_rids)) {
      $existing_rids = $this->state->get(self::STATE_KEY, []);
      if (!is_array($existing_rids)) {
        $existing_rids = [];
      }
      $this->state->set(self::STATE_KEY, array_values(array_unique(array_merge($existing_rids, $created_rids))));
    }

    return [
      'status' => $dry_run ? 'dry-run' : 'done',
      'created' => $created,
      'invalid_source' => $invalid_source,
      'missing_map' => $missing_map,
      'missing_node' => $missing_node,
      'not_article_editorial' => $not_article_editorial,
      'conflict_alias' => $conflict_alias,
      'conflict_redirect' => $conflict_redirect,
      'self_target' => $self_target,
    ];
  }

  /**
   * Rolls back redirects created by this sync command.
   *
   * @return array<string, int|string>
   *   Summary statistics.
   */
  public function rollback(bool $dry_run = FALSE): array {
    $redirect_storage = $this->entityTypeManager->getStorage('redirect');
    $tracked_rids = $this->state->get(self::STATE_KEY, []);
    if (!is_array($tracked_rids)) {
      $tracked_rids = [];
    }

    $tracked_rids = array_values(array_unique(array_map('intval', $tracked_rids)));
    if (empty($tracked_rids)) {
      return ['status' => 'done', 'deleted' => 0, 'tracked' => 0];
    }

    $entities = $redirect_storage->loadMultiple($tracked_rids);
    $delete_count = count($entities);

    if ($dry_run) {
      return [
        'status' => 'dry-run',
        'deleted' => $delete_count,
        'tracked' => count($tracked_rids),
      ];
    }

    if (!empty($entities)) {
      $redirect_storage->delete($entities);
    }

    $this->state->set(self::STATE_KEY, []);

    return [
      'status' => 'done',
      'deleted' => $delete_count,
      'tracked' => count($tracked_rids),
    ];
  }

  /**
   * Loads blog archive posts from metadata.
   *
   * @return array<int, array<string, mixed>>|null
   *   Post records, or NULL if the file cannot be read.
   */
  private function loadMetadataPosts(): ?array {
    $metadata_path = dirname(DRUPAL_ROOT) . '/blog_archive/metadata.json';
    if (!is_readable($metadata_path)) {
      return NULL;
    }

    $raw = file_get_contents($metadata_path);
    if ($raw === FALSE) {
      return NULL;
    }

    $decoded = Json::decode($raw);
    if (!is_array($decoded) || !isset($decoded['posts']) || !is_array($decoded['posts'])) {
      return NULL;
    }

    $posts = [];
    foreach ($decoded['posts'] as $post) {
      if (is_array($post)) {
        $posts[] = $post;
      }
    }
    return $posts;
  }

  /**
   * Builds a legacy local path from a Medium source URL.
   */
  private function extractMediumLegacyPath(string $source_url): ?string {
    if ($source_url === '') {
      return NULL;
    }

    $source_path = parse_url($source_url, PHP_URL_PATH);
    if (!is_string($source_path) || $source_path === '') {
      return NULL;
    }

    $slug_hash = basename(trim($source_path, '/'));
    if ($slug_hash === '' || $slug_hash === '.' || $slug_hash === '..') {
      return NULL;
    }

    return '/' . $slug_hash;
  }

}
