<?php

namespace Drupal\civicactions_blog_migration\Plugin\migrate\source;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\file\Entity\File;
use Drupal\media\Entity\Media;
use Drupal\migrate\Plugin\MigrationInterface;
use Drupal\migrate\Plugin\migrate\source\SourcePluginBase;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\taxonomy\Entity\Term;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Local source plugin for CivicActions Medium blog archive posts.
 *
 * @MigrateSource(
 *   id = "civicactions_blog_archive_posts"
 * )
 */
final class BlogArchivePosts extends SourcePluginBase implements ContainerFactoryPluginInterface {

  /**
   * Drupal file system service.
   */
  protected FileSystemInterface $fileSystem;

  /**
   * Drupal file URL generator service.
   */
  protected FileUrlGeneratorInterface $fileUrlGenerator;

  /**
   * Logger channel for migration diagnostics.
   */
  protected $logger;

  /**
   * Public asset destination directory.
   */
  protected string $assetPublicDirectory;

  /**
   * Cached taxonomy term id for the Editorial type "Article".
   */
  protected ?int $editorialTypeTermId = NULL;

  /**
   * Cached Person node ids keyed by normalized title.
   */
  protected ?array $personNodeIdsByTitle = NULL;

  /**
   * BlogArchivePosts constructor.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    MigrationInterface $migration,
    FileSystemInterface $file_system,
    FileUrlGeneratorInterface $file_url_generator,
    LoggerChannelFactoryInterface $logger_factory,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $migration);
    $this->fileSystem = $file_system;
    $this->fileUrlGenerator = $file_url_generator;
    $this->logger = $logger_factory->get('civicactions_blog_migration');
    $this->assetPublicDirectory = (string) ($configuration['asset_public_directory'] ?? 'public://blog_archive_assets');
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition, ?MigrationInterface $migration = NULL): self {
    $migration = $migration ?? ($configuration['migration'] ?? NULL);
    if (!$migration instanceof MigrationInterface) {
      throw new \InvalidArgumentException('Missing migration configuration for civicactions_blog_archive_posts source plugin.');
    }

    return new self(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $migration,
      $container->get('file_system'),
      $container->get('file_url_generator'),
      $container->get('logger.factory'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function fields(): array {
    return [
      'id' => $this->t('Archive item id.'),
      'title' => $this->t('Article title.'),
      'subtitle' => $this->t('Article subtitle.'),
      'body_html' => $this->t('Article body HTML with localized image URLs.'),
      'published_at' => $this->t('Published datetime in ISO format.'),
      'source_url' => $this->t('Original source URL.'),
      'author' => $this->t('Author name.'),
      'schema_author_target_id' => $this->t('Person node id matching the author name.'),
      'editorial_type_target_id' => $this->t('Editorial type term id for Article.'),
      'schema_image_target_id' => $this->t('Media image entity id associated with article image.'),
      'field_content_items' => $this->t('Body content paragraph reference-revision items for field_content.'),
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
    $metadata_relative = (string) ($this->configuration['metadata_path'] ?? 'blog_archive/metadata.json');
    $metadata_path = $repo_root . '/' . ltrim($metadata_relative, '/');

    if (!is_file($metadata_path) || !is_readable($metadata_path)) {
      $this->logger->warning('Cannot read archive metadata at @path.', ['@path' => $metadata_path]);
      return new \ArrayIterator([]);
    }

    $raw = file_get_contents($metadata_path);
    if ($raw === FALSE) {
      $this->logger->warning('Failed reading archive metadata file @path.', ['@path' => $metadata_path]);
      return new \ArrayIterator([]);
    }

    $decoded = Json::decode($raw);
    if (!is_array($decoded)) {
      $this->logger->warning('Archive metadata is invalid JSON at @path.', ['@path' => $metadata_path]);
      return new \ArrayIterator([]);
    }

    $archive_root = dirname($metadata_path);
    $entries = [];

    if (isset($decoded['posts']) && is_array($decoded['posts'])) {
      foreach ($decoded['posts'] as $post) {
        if (is_array($post)) {
          $entries[] = [
            'id' => (string) ($post['id'] ?? ''),
            'title' => (string) ($post['title'] ?? ''),
            'subtitle' => (string) ($post['subtitle'] ?? ''),
            'published_at' => (string) ($post['published_at'] ?? ''),
            'source_url' => (string) ($post['source_url'] ?? ''),
            'author' => (string) ($post['author'] ?? ''),
            'relative_html_file' => (string) ($post['file'] ?? ''),
          ];
        }
      }
    }
    elseif (isset($decoded['articles']) && is_array($decoded['articles'])) {
      foreach ($decoded['articles'] as $article) {
        if (is_array($article)) {
          $entries[] = [
            'id' => (string) ($article['id'] ?? ''),
            'title' => (string) ($article['title'] ?? ''),
            'subtitle' => (string) ($article['subtitle'] ?? ''),
            'published_at' => (string) ($article['published_at'] ?? ''),
            'source_url' => (string) ($article['url'] ?? ''),
            'author' => (string) ($article['author_name'] ?? ''),
            'relative_html_file' => (string) ($article['html_file'] ?? ''),
          ];
        }
      }
    }

    $this->fileSystem->prepareDirectory($this->assetPublicDirectory, FileSystemInterface::CREATE_DIRECTORY | FileSystemInterface::MODIFY_PERMISSIONS);

    foreach ($entries as $entry) {
      $relative_html_file = ltrim((string) ($entry['relative_html_file'] ?? ''), '/');
      if ($relative_html_file === '') {
        continue;
      }

      $html_path = $archive_root . '/' . $relative_html_file;
      if (!is_file($html_path) || !is_readable($html_path)) {
        $this->logger->warning('Skipping unreadable HTML file @file.', ['@file' => $html_path]);
        continue;
      }

      $article_data = $this->extractArticleMarkup($html_path);
      $article_markup = $article_data['body_html'] ?? '';
      if ($article_markup === '') {
        $this->logger->warning('Skipping @file because no <article> content could be extracted.', ['@file' => $html_path]);
        continue;
      }

      $schema_image_target_id = NULL;
      $first_image_uri = (string) ($article_data['first_image_uri'] ?? '');
      if ($first_image_uri !== '') {
        $schema_image_target_id = $this->ensureMediaImageFromUri($first_image_uri, (string) $entry['title']);
      }

      $paragraph_reference = $this->ensureBodyContentParagraph($article_markup);

      $rows[] = [
        'id' => $entry['id'] !== '' ? $entry['id'] : $relative_html_file,
        'title' => $entry['title'] !== '' ? $entry['title'] : $this->guessTitleFromHtml($html_path),
        'subtitle' => (string) ($entry['subtitle'] ?? ''),
        'body_html' => $article_markup,
        'published_at' => $this->normalizePublishedAt((string) $entry['published_at']),
        'source_url' => $entry['source_url'],
        'author' => $entry['author'],
        'schema_author_target_id' => $this->resolveSchemaAuthorTargetId((string) $entry['author']),
        'editorial_type_target_id' => $this->resolveEditorialTypeTermId(),
        'schema_image_target_id' => $schema_image_target_id,
        'field_content_items' => !empty($paragraph_reference) ? [$paragraph_reference] : [],
      ];
    }

    return new \ArrayIterator($rows);
  }

  /**
   * Extracts and normalizes article HTML from archived file.
   */
  protected function extractArticleMarkup(string $html_path): array {
    $html_raw = file_get_contents($html_path);
    if ($html_raw === FALSE || $html_raw === '') {
      return [];
    }

    libxml_use_internal_errors(TRUE);
    $dom = new \DOMDocument('1.0', 'UTF-8');
    $loaded = $dom->loadHTML($html_raw, LIBXML_NOWARNING | LIBXML_NOERROR);
    if (!$loaded) {
      return [];
    }

    $xpath = new \DOMXPath($dom);
    $article = $xpath->query('//article')->item(0);
    if (!$article instanceof \DOMElement) {
      return [];
    }

    $first_image_uri = '';
    $image_nodes = $xpath->query('.//img[@src]', $article);
    if ($image_nodes !== FALSE) {
      foreach ($image_nodes as $image_node) {
        if (!$image_node instanceof \DOMElement) {
          continue;
        }
        $src = trim($image_node->getAttribute('src'));
        if ($src === '' || preg_match('@^(https?:)?//@i', $src) || str_starts_with($src, 'data:')) {
          continue;
        }

        $resolved_src = realpath(dirname($html_path) . '/' . $src);
        if ($resolved_src === FALSE || !is_file($resolved_src) || !is_readable($resolved_src)) {
          continue;
        }

        $filename = basename($resolved_src);
        $target_uri = rtrim($this->assetPublicDirectory, '/') . '/' . $filename;
        if (!file_exists($target_uri)) {
          $this->fileSystem->copy($resolved_src, $target_uri, FileSystemInterface::EXISTS_REPLACE);
        }

        if ($first_image_uri === '') {
          $first_image_uri = $target_uri;
        }

        $public_url = $this->fileUrlGenerator->generateString($target_uri);
        $image_node->setAttribute('src', $public_url);
      }
    }

    return [
      'body_html' => $this->getInnerHtml($article),
      'first_image_uri' => $first_image_uri,
    ];
  }

  /**
   * Gets or creates the editorial type taxonomy term id for "Article".
   */
  protected function resolveEditorialTypeTermId(): ?int {
    if ($this->editorialTypeTermId !== NULL) {
      return $this->editorialTypeTermId;
    }

    $field_definitions = \Drupal::service('entity_field.manager')->getFieldDefinitions('node', 'editorial');
    if (!isset($field_definitions['field_editorial_type'])) {
      return NULL;
    }

    $settings = $field_definitions['field_editorial_type']->getSettings();
    $target_bundles = array_keys($settings['handler_settings']['target_bundles'] ?? []);

    $term_storage = \Drupal::entityTypeManager()->getStorage('taxonomy_term');
    foreach ($target_bundles as $vid) {
      $existing = $term_storage->loadByProperties([
        'vid' => $vid,
        'name' => 'Article',
      ]);
      $term = $existing ? reset($existing) : NULL;
      if ($term instanceof Term) {
        $this->editorialTypeTermId = (int) $term->id();
        return $this->editorialTypeTermId;
      }
    }

    if (!empty($target_bundles)) {
      $term = Term::create([
        'vid' => reset($target_bundles),
        'name' => 'Article',
      ]);
      $term->save();
      $this->editorialTypeTermId = (int) $term->id();
      return $this->editorialTypeTermId;
    }

    $existing = $term_storage->loadByProperties(['name' => 'Article']);
    $term = $existing ? reset($existing) : NULL;
    if ($term instanceof Term) {
      $this->editorialTypeTermId = (int) $term->id();
      return $this->editorialTypeTermId;
    }

    return NULL;
  }

  /**
   * Resolves author name to a Person node id for schema_author.
   */
  protected function resolveSchemaAuthorTargetId(string $author): ?int {
    $author = trim($author);
    if ($author === '') {
      return NULL;
    }

    // Skip organization bylines like "CivicActions".
    if (preg_match('/^civic\s*actions$/i', $author)) {
      return NULL;
    }

    if ($this->personNodeIdsByTitle === NULL) {
      $this->personNodeIdsByTitle = [];
      $node_storage = \Drupal::entityTypeManager()->getStorage('node');
      $people = $node_storage->loadByProperties(['type' => 'person']);
      foreach ($people as $person_node) {
        $title = trim((string) $person_node->label());
        if ($title === '') {
          continue;
        }
        $this->personNodeIdsByTitle[mb_strtolower($title)] = (int) $person_node->id();
      }
    }

    $normalized_author = mb_strtolower($author);
    return $this->personNodeIdsByTitle[$normalized_author] ?? NULL;
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
   * Creates a Body content paragraph from article HTML for field_content.
   */
  protected function ensureBodyContentParagraph(string $body_html): array {
    if ($body_html === '' || !class_exists(Paragraph::class)) {
      return [];
    }

    $bundle = $this->resolveBodyContentParagraphBundle();
    if ($bundle === NULL) {
      $this->logger->warning('Unable to determine a paragraph bundle for Editorial field_content.');
      return [];
    }

    $paragraph = Paragraph::create(['type' => $bundle]);
    $text_field = $this->resolveParagraphTextField($bundle);
    if ($text_field === NULL) {
      $this->logger->warning('No text field found for paragraph bundle @bundle.', ['@bundle' => $bundle]);
      return [];
    }

    $value = ['value' => $body_html];
    $field_definition = $paragraph->getFieldDefinition($text_field);
    if (in_array($field_definition->getType(), ['text', 'text_long', 'text_with_summary'], TRUE)) {
      $value['format'] = $this->resolveTextFormatForField($field_definition->getSetting('allowed_formats') ?? []);
    }

    $paragraph->set($text_field, $value);
    $paragraph->save();

    return [
      'target_id' => (int) $paragraph->id(),
      'target_revision_id' => (int) $paragraph->getRevisionId(),
    ];
  }

  /**
   * Resolves the paragraph bundle machine name for "Body content".
   */
  protected function resolveBodyContentParagraphBundle(): ?string {
    $storage = \Drupal::entityTypeManager()->getStorage('paragraphs_type');
    $field_definitions = \Drupal::service('entity_field.manager')->getFieldDefinitions('node', 'editorial');

    $target_bundles = [];

    // Prefer field_content when it exists.
    if (isset($field_definitions['field_content']) && $field_definitions['field_content']->getType() === 'entity_reference_revisions') {
      $target_bundles = $this->extractTargetParagraphBundles($field_definitions['field_content']->getSettings());
    }

    // Fallback: detect any editorial ERR field that targets paragraphs.
    if (empty($target_bundles)) {
      foreach ($field_definitions as $field_name => $field_definition) {
        if ($field_definition->getType() !== 'entity_reference_revisions') {
          continue;
        }
        $settings = $field_definition->getSettings();
        if (($settings['target_type'] ?? '') !== 'paragraph') {
          continue;
        }

        $bundles = $this->extractTargetParagraphBundles($settings);
        if (!empty($bundles)) {
          $target_bundles = $bundles;
          break;
        }
      }
    }

    if (empty($target_bundles)) {
      return NULL;
    }

    if (in_array('body_content', $target_bundles, TRUE) && $storage->load('body_content')) {
      return 'body_content';
    }

    foreach ($target_bundles as $bundle_id) {
      $type = $storage->load($bundle_id);
      if ($type && mb_strtolower((string) $type->label()) === 'body content') {
        return (string) $bundle_id;
      }
    }

    // Fall back to the first configured/allowed bundle for field_content.
    foreach ($target_bundles as $bundle_id) {
      if ($storage->load($bundle_id)) {
        return (string) $bundle_id;
      }
    }

    return NULL;
  }

  /**
   * Extracts paragraph bundle IDs from field handler settings.
   */
  protected function extractTargetParagraphBundles(array $settings): array {
    $bundles = [];
    $handler_settings = $settings['handler_settings'] ?? [];

    foreach (array_keys($handler_settings['target_bundles'] ?? []) as $bundle_id) {
      $bundles[] = (string) $bundle_id;
    }

    // Some sites only configure target_bundles_drag_drop.
    if (empty($bundles) && !empty($handler_settings['target_bundles_drag_drop'])) {
      foreach ($handler_settings['target_bundles_drag_drop'] as $bundle_id => $bundle_settings) {
        if (!is_array($bundle_settings)) {
          continue;
        }
        if (array_key_exists('enabled', $bundle_settings) && $bundle_settings['enabled'] === FALSE) {
          continue;
        }
        $bundles[] = (string) $bundle_id;
      }
    }

    return array_values(array_unique(array_filter($bundles)));
  }

  /**
   * Finds a usable text field on the paragraph bundle.
   */
  protected function resolveParagraphTextField(string $bundle): ?string {
    $fields = \Drupal::service('entity_field.manager')->getFieldDefinitions('paragraph', $bundle);
    foreach ($fields as $field_name => $field_definition) {
      if (in_array($field_definition->getType(), ['text', 'text_long', 'text_with_summary'], TRUE)) {
        return (string) $field_name;
      }
    }
    return NULL;
  }

  /**
   * Chooses a valid text format based on field allowed formats.
   */
  protected function resolveTextFormatForField(array $allowed_formats): string {
    if (isset($allowed_formats['full_content']) || in_array('full_content', $allowed_formats, TRUE)) {
      return 'full_content';
    }

    if (!empty($allowed_formats)) {
      $first_key = array_key_first($allowed_formats);
      $first_value = $allowed_formats[$first_key];
      if (is_string($first_key) && $first_key !== '') {
        return $first_key;
      }
      if (is_string($first_value) && $first_value !== '') {
        return $first_value;
      }
    }

    return 'basic_html';
  }

  /**
   * Gets the inner HTML for a DOM node.
   */
  protected function getInnerHtml(\DOMNode $node): string {
    $html = '';
    foreach ($node->childNodes as $child_node) {
      $html .= $node->ownerDocument->saveHTML($child_node);
    }
    return trim($html);
  }

  /**
   * Best-effort fallback title extraction from HTML <h1> or <title>.
   */
  protected function guessTitleFromHtml(string $html_path): string {
    $html_raw = file_get_contents($html_path);
    if ($html_raw === FALSE || $html_raw === '') {
      return '';
    }

    libxml_use_internal_errors(TRUE);
    $dom = new \DOMDocument('1.0', 'UTF-8');
    if (!$dom->loadHTML($html_raw, LIBXML_NOWARNING | LIBXML_NOERROR)) {
      return '';
    }

    $xpath = new \DOMXPath($dom);
    $h1 = $xpath->query('//header//h1')->item(0);
    if ($h1 instanceof \DOMElement) {
      return trim($h1->textContent);
    }

    $title = $xpath->query('//title')->item(0);
    if ($title instanceof \DOMElement) {
      return trim($title->textContent);
    }

    return '';
  }

  /**
   * Normalizes publication datetime for format_date process plugin.
   */
  protected function normalizePublishedAt(string $published_at): string {
    $published_at = trim($published_at);
    if ($published_at === '') {
      return gmdate('Y-m-d\\TH:i:s.000000\\Z');
    }

    $timestamp = strtotime($published_at);
    if ($timestamp === FALSE) {
      return gmdate('Y-m-d\\TH:i:s.000000\\Z');
    }

    return gmdate('Y-m-d\\TH:i:s.000000\\Z', $timestamp);
  }

  /**
   * {@inheritdoc}
   */
  public function __toString(): string {
    return (string) $this->pluginId;
  }

}
