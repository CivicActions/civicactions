<?php

namespace Drupal\civicactions_blog_migration\Plugin\migrate\source;

use Drupal\Component\Serialization\Json;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\file\Entity\File;
use Drupal\media\Entity\Media;
use Drupal\migrate\Plugin\MigrationInterface;
use Drupal\migrate\Plugin\migrate\source\SourcePluginBase;
use Drupal\taxonomy\Entity\Term;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Local source plugin for CivicActions people archive profiles.
 *
 * @MigrateSource(
 *   id = "civicactions_people_archive_profiles"
 * )
 */
final class PeopleArchiveProfiles extends SourcePluginBase implements ContainerFactoryPluginInterface {

  /**
   * Drupal file system service.
   */
  protected FileSystemInterface $fileSystem;

  /**
   * Logger channel for migration diagnostics.
   */
  protected $logger;

  /**
   * Public asset destination directory.
   */
  protected string $assetPublicDirectory;

  /**
   * Cached team-page-category vocabulary id.
   */
  protected ?string $memberOfVocabularyId = NULL;

  /**
   * Cached category term ids by label.
   */
  protected array $memberOfTermIds = [];

  /**
   * Cached worksFor organization node id.
   */
  protected ?int $worksForOrganizationNodeId = NULL;

  /**
   * PeopleArchiveProfiles constructor.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    MigrationInterface $migration,
    FileSystemInterface $file_system,
    LoggerChannelFactoryInterface $logger_factory,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $migration);
    $this->fileSystem = $file_system;
    $this->logger = $logger_factory->get('civicactions_blog_migration');
    $this->assetPublicDirectory = (string) ($configuration['asset_public_directory'] ?? 'public://people_archive_assets');
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition, ?MigrationInterface $migration = NULL): self {
    $migration = $migration ?? ($configuration['migration'] ?? NULL);
    if (!$migration instanceof MigrationInterface) {
      throw new \InvalidArgumentException('Missing migration configuration for civicactions_people_archive_profiles source plugin.');
    }

    return new self(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $migration,
      $container->get('file_system'),
      $container->get('logger.factory'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function fields(): array {
    return [
      'id' => $this->t('Archive profile id.'),
      'title' => $this->t('Person name for node title.'),
      'job_title' => $this->t('Person job title.'),
      'schema_image_target_id' => $this->t('Media image entity id associated with the person image.'),
      'schema_member_of_items' => $this->t('Team page category taxonomy term references.'),
      'schema_works_for_target_id' => $this->t('Organization node id for schema_works_for.'),
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getIds(): array {
    return [
      'id' => [
        'type' => 'string',
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  protected function initializeIterator(): \Iterator {
    $rows = [];
    $repo_root = dirname(DRUPAL_ROOT);
    $metadata_relative = (string) ($this->configuration['metadata_path'] ?? 'people_archive/metadata.json');
    $metadata_path = $repo_root . '/' . ltrim($metadata_relative, '/');

    if (!is_file($metadata_path) || !is_readable($metadata_path)) {
      $this->logger->warning('Cannot read people archive metadata at @path.', ['@path' => $metadata_path]);
      return new \ArrayIterator([]);
    }

    $raw = file_get_contents($metadata_path);
    if ($raw === FALSE) {
      $this->logger->warning('Failed reading people archive metadata file @path.', ['@path' => $metadata_path]);
      return new \ArrayIterator([]);
    }

    $decoded = Json::decode($raw);
    if (!is_array($decoded) || empty($decoded['people']) || !is_array($decoded['people'])) {
      $this->logger->warning('People archive metadata is invalid or missing people[] at @path.', ['@path' => $metadata_path]);
      return new \ArrayIterator([]);
    }

    $archive_root = dirname($metadata_path);
    $this->fileSystem->prepareDirectory($this->assetPublicDirectory, FileSystemInterface::CREATE_DIRECTORY | FileSystemInterface::MODIFY_PERMISSIONS);

    $works_for_target_id = $this->resolveWorksForOrganizationNodeId('CivicActions');
    $seen_ids = [];

    foreach ($decoded['people'] as $person) {
      if (!is_array($person)) {
        continue;
      }

      $name = trim((string) ($person['name'] ?? ''));
      if ($name === '') {
        continue;
      }

      $job_title = trim((string) ($person['job_title'] ?? ''));
      $image_relative_path = trim((string) ($person['image'] ?? ''));
      $schema_image_target_id = NULL;
      if ($image_relative_path !== '') {
        $schema_image_target_id = $this->ensureMediaImageFromArchiveRelativePath($archive_root, $image_relative_path, $name);
      }

      $category_labels = [];
      if (!empty($person['team_page_categories']) && is_array($person['team_page_categories'])) {
        foreach ($person['team_page_categories'] as $category_label) {
          $category_label = trim((string) $category_label);
          if ($category_label !== '') {
            $category_labels[] = $category_label;
          }
        }
      }

      $rows[] = [
        'id' => $this->buildProfileId($name, $seen_ids),
        'title' => $name,
        'job_title' => $job_title,
        'schema_image_target_id' => $schema_image_target_id,
        'schema_member_of_items' => $this->resolveMemberOfItems($category_labels),
        'schema_works_for_target_id' => $works_for_target_id,
      ];
    }

    return new \ArrayIterator($rows);
  }

  /**
   * Builds a deterministic unique source id for a profile name.
   */
  protected function buildProfileId(string $name, array &$seen_ids): string {
    $base_id = mb_strtolower(trim((string) preg_replace('/[^a-z0-9]+/i', '-', $name), '-'));
    if ($base_id === '') {
      $base_id = 'person';
    }

    if (!isset($seen_ids[$base_id])) {
      $seen_ids[$base_id] = 1;
      return $base_id;
    }

    $seen_ids[$base_id]++;
    return $base_id . '-' . $seen_ids[$base_id];
  }

  /**
   * Creates or reuses a media image for an archive-relative image path.
   */
  protected function ensureMediaImageFromArchiveRelativePath(string $archive_root, string $relative_path, string $title): ?int {
    $resolved_src = realpath($archive_root . '/' . ltrim($relative_path, '/'));
    if ($resolved_src === FALSE || !is_file($resolved_src) || !is_readable($resolved_src)) {
      $this->logger->warning('Skipping unreadable people image @path.', ['@path' => $relative_path]);
      return NULL;
    }

    $target_uri = rtrim($this->assetPublicDirectory, '/') . '/' . basename($resolved_src);
    if (!file_exists($target_uri)) {
      $this->fileSystem->copy($resolved_src, $target_uri, FileSystemInterface::EXISTS_REPLACE);
    }

    return $this->ensureMediaImageFromUri($target_uri, $title);
  }

  /**
   * Creates or reuses a media image entity for a public file URI.
   */
  protected function ensureMediaImageFromUri(string $image_uri, string $title): ?int {
    if (!file_exists($image_uri)) {
      return NULL;
    }

    $file_storage = \Drupal::entityTypeManager()->getStorage('file');
    $existing_files = $file_storage->loadByProperties(['uri' => $image_uri]);
    $file = $existing_files ? reset($existing_files) : NULL;

    if (!$file instanceof File) {
      $file = File::create([
        'uri' => $image_uri,
        'status' => 1,
      ]);
      $file->save();
    }

    $media_storage = \Drupal::entityTypeManager()->getStorage('media');
    $existing_media = $media_storage->loadByProperties([
      'bundle' => 'image',
      'field_media_image.target_id' => $file->id(),
    ]);
    $media = $existing_media ? reset($existing_media) : NULL;

    if (!$media instanceof Media) {
      $media = Media::create([
        'bundle' => 'image',
        'name' => $title !== '' ? $title : basename($image_uri),
        'status' => 1,
        'field_media_image' => [
          'target_id' => $file->id(),
          'alt' => $title !== '' ? $title : basename($image_uri),
        ],
      ]);
      $media->save();
    }

    return (int) $media->id();
  }

  /**
   * Resolves category labels into schema_member_of term reference items.
   */
  protected function resolveMemberOfItems(array $category_labels): array {
    $items = [];
    foreach (array_unique($category_labels) as $category_label) {
      $term_id = $this->ensureMemberOfTermId($category_label);
      if ($term_id !== NULL) {
        $items[] = ['target_id' => $term_id];
      }
    }
    return $items;
  }

  /**
   * Gets or creates a taxonomy term id in the schema_member_of vocabulary.
   */
  protected function ensureMemberOfTermId(string $category_label): ?int {
    $key = mb_strtolower($category_label);
    if (isset($this->memberOfTermIds[$key])) {
      return $this->memberOfTermIds[$key];
    }

    $vocabulary_id = $this->resolveMemberOfVocabularyId();
    if ($vocabulary_id === NULL) {
      return NULL;
    }

    $term_storage = \Drupal::entityTypeManager()->getStorage('taxonomy_term');
    $existing = $term_storage->loadByProperties([
      'vid' => $vocabulary_id,
      'name' => $category_label,
    ]);
    $term = $existing ? reset($existing) : NULL;

    if (!$term instanceof Term) {
      $term = Term::create([
        'vid' => $vocabulary_id,
        'name' => $category_label,
      ]);
      $term->save();
    }

    $this->memberOfTermIds[$key] = (int) $term->id();
    return $this->memberOfTermIds[$key];
  }

  /**
   * Resolves the configured schema_member_of target vocabulary on Person.
   */
  protected function resolveMemberOfVocabularyId(): ?string {
    if ($this->memberOfVocabularyId !== NULL) {
      return $this->memberOfVocabularyId;
    }

    $field_definitions = \Drupal::service('entity_field.manager')->getFieldDefinitions('node', 'person');
    if (!isset($field_definitions['schema_member_of'])) {
      $this->logger->warning('Person field schema_member_of was not found.');
      return NULL;
    }

    $settings = $field_definitions['schema_member_of']->getSettings();
    $target_bundles = array_keys($settings['handler_settings']['target_bundles'] ?? []);
    if (empty($target_bundles)) {
      $this->logger->warning('No target taxonomy bundles configured for Person schema_member_of.');
      return NULL;
    }

    $this->memberOfVocabularyId = (string) reset($target_bundles);
    return $this->memberOfVocabularyId;
  }

  /**
   * Resolves the organization node id by title for schema_works_for.
   */
  protected function resolveWorksForOrganizationNodeId(string $organization_title): ?int {
    if ($this->worksForOrganizationNodeId !== NULL) {
      return $this->worksForOrganizationNodeId;
    }

    $node_storage = \Drupal::entityTypeManager()->getStorage('node');
    $existing = $node_storage->loadByProperties([
      'type' => 'organization',
      'title' => $organization_title,
    ]);
    $node = $existing ? reset($existing) : NULL;

    if ($node) {
      $this->worksForOrganizationNodeId = (int) $node->id();
      return $this->worksForOrganizationNodeId;
    }

    $this->logger->warning('Organization node titled @title was not found for schema_works_for.', ['@title' => $organization_title]);
    return NULL;
  }

  /**
   * {@inheritdoc}
   */
  public function __toString(): string {
    return (string) $this->pluginId;
  }

}
