<?php

namespace Drupal\civicactions_blog_migration\Plugin\migrate\source;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\migrate\Plugin\MigrationInterface;
use Drupal\migrate\Plugin\migrate\source\SourcePluginBase;
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
      'body_html' => $this->t('Article body HTML with localized image URLs.'),
      'published_at' => $this->t('Published datetime in ISO format.'),
      'source_url' => $this->t('Original source URL.'),
      'author' => $this->t('Author name.'),
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

      $article_markup = $this->extractArticleMarkup($html_path);
      if ($article_markup === '') {
        $this->logger->warning('Skipping @file because no <article> content could be extracted.', ['@file' => $html_path]);
        continue;
      }

      $rows[] = [
        'id' => $entry['id'] !== '' ? $entry['id'] : $relative_html_file,
        'title' => $entry['title'] !== '' ? $entry['title'] : $this->guessTitleFromHtml($html_path),
        'body_html' => $article_markup,
        'published_at' => $this->normalizePublishedAt((string) $entry['published_at']),
        'source_url' => $entry['source_url'],
        'author' => $entry['author'],
      ];
    }

    return new \ArrayIterator($rows);
  }

  /**
   * Extracts and normalizes article HTML from archived file.
   */
  protected function extractArticleMarkup(string $html_path): string {
    $html_raw = file_get_contents($html_path);
    if ($html_raw === FALSE || $html_raw === '') {
      return '';
    }

    libxml_use_internal_errors(TRUE);
    $dom = new \DOMDocument('1.0', 'UTF-8');
    $loaded = $dom->loadHTML($html_raw, LIBXML_NOWARNING | LIBXML_NOERROR);
    if (!$loaded) {
      return '';
    }

    $xpath = new \DOMXPath($dom);
    $article = $xpath->query('//article')->item(0);
    if (!$article instanceof \DOMElement) {
      return '';
    }

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

        $public_url = $this->fileUrlGenerator->generateString($target_uri);
        $image_node->setAttribute('src', $public_url);
      }
    }

    return $this->getInnerHtml($article);
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
