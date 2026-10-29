<?php

namespace Drupal\omnichannel\Hook;

use Drupal\Component\Utility\Html;
use Drupal\Component\Utility\UrlHelper;
use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Entity\Entity\EntityViewDisplay;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Security\Attribute\TrustedCallback;
use Drupal\file\FileInterface;
use Drupal\filter\Entity\FilterFormat;
use Drupal\image\Entity\ImageStyle;
use Drupal\media\MediaInterface;
use Drupal\node\NodeInterface;

/**
 * Hook implementations for omnichannel.
 */
class OmnichannelHooks {

  public function __construct(
    private readonly RouteMatchInterface $routeMatch,
  ) {}

  /**
   * Content types rendered with the full-width page container.
   *
   * Node bundles are listed by machine name. 'canvas_page' covers Canvas pages,
   * which are not nodes.
   */
  private const FULL_WIDTH_CONTENT_TYPES = [
    'canvas_page',
    'case_study',
  ];

  /**
   * @file
   * Functions to support theming.
   */

  /**
   * Implements hook_preprocess_image_widget().
   */
  #[Hook('preprocess_image_widget')]
  public function preprocessImageWidget(array &$variables): void {
    $data = &$variables['data'];
    // This prevents image widget templates from rendering preview container
    // HTML to users that do not have permission to access these previews.
    // @todo revisit in https://drupal.org/node/953034
    // @todo revisit in https://drupal.org/node/3114318
    if (isset($data['preview']['#access']) && $data['preview']['#access'] === FALSE) {
      unset($data['preview']);
    }
  }

  /**
   * Implements hook_preprocess_page().
   */
  #[Hook('preprocess_page')]
  public function preprocessPage(array &$variables): void {
    $route_match = \Drupal::routeMatch();
    $is_canvas_page = $route_match->getRouteName() === 'entity.canvas_page.canonical';
    $variables['is_canvas_page'] = $is_canvas_page;

    $node = $route_match->getParameter('node');
    $content_type = $is_canvas_page
      ? 'canvas_page'
      : ($node instanceof NodeInterface ? $node->bundle() : NULL);
    $variables['is_full_width'] = $content_type !== NULL
      && in_array($content_type, self::FULL_WIDTH_CONTENT_TYPES, TRUE);
  }

  /**
   * Implements hook_theme_suggestions_page_alter().
   */
  #[Hook('theme_suggestions_page_alter')]
  public function themeSuggestionsPageAlter(array &$suggestions, array $variables): void {
    if ($this->routeMatch->getRouteName() === 'system.404') {
      $suggestions[] = 'page__404';
    }
  }

  /**
   * Adds the total page count for legacy-style pager output.
   */
  #[Hook('preprocess_pager')]
  public function preprocessPager(array &$variables): void {
    $element = $variables['pager']['#element'] ?? NULL;
    if (!is_int($element)) {
      return;
    }

    $pager = \Drupal::service('pager.manager')->getPager($element);
    if ($pager !== NULL) {
      $variables['total_pages'] = $pager->getTotalPages();
    }
  }

  /**
   * Prepares SDC props for full and teaser content view modes.
   */
  #[Hook('preprocess_node')]
  public function preprocessNode(array &$variables): void {
    if (!($variables['node'] ?? NULL) instanceof NodeInterface) {
      return;
    }

    $node = $variables['node'];
    $view_mode = $variables['view_mode'] ?? '';
    if ($view_mode === 'full' && $node->bundle() === 'page') {
      $cacheability = CacheableMetadata::createFromRenderArray($variables);
      $variables['page_hero_summary'] = $this->getStringFieldValue($node, 'schema_short_description', $cacheability);
      $cacheability->applyTo($variables);
    }

    if ($view_mode === 'full' && $node->bundle() === 'case_study') {
      $cacheability = new CacheableMetadata();
      $variables['case_study_props'] = $this->buildCaseStudyFullProps($variables, $cacheability);
      $cacheability->applyTo($variables);
    }

    if ($view_mode !== 'teaser') {
      return;
    }

    $cacheability = new CacheableMetadata();
    $variables['teaser_props'] = match ($node->bundle()) {
      'person' => $this->buildPersonTeaserProps($node, $cacheability),
      'editorial' => $this->buildEditorialTeaserProps($node, $cacheability),
      'case_study' => $this->buildCaseStudyTeaserProps($node, $cacheability),
      default => [],
    };
    $cacheability->applyTo($variables);
  }

  /**
   * Builds the props used by the Person Teaser SDC.
   */
  private function buildPersonTeaserProps(NodeInterface $node, CacheableMetadata $cacheability): array {
    return [
      'heading_level' => 3,
      'name' => $node->label(),
      'role' => $this->getStringFieldValue($node, 'schema_job_title', $cacheability),
      'image' => $this->getImageProp($node, 'schema_image', $cacheability) ?? [
        'src' => '/themes/omnichannel/images/canvas-assets/quote-portrait.png',
        'alt' => 'CivicActions team member',
        'width' => 346,
        'height' => 446,
      ],
    ];
  }

  /**
   * Builds the props used by the Editorial Teaser SDC.
   */
  private function buildEditorialTeaserProps(NodeInterface $node, CacheableMetadata $cacheability): array {
    $url = $node->toUrl('canonical')->toString();
    $editorial_type = strtolower($this->getReferencedLabel($node, 'field_editorial_type', $cacheability));
    $variant = match ($editorial_type) {
      'news', 'whitepaper' => 'news',
      'article', 'highlight' => 'press',
      default => 'press',
    };
    $props = [
      'variant' => $variant,
      'title' => $node->label(),
      'description' => $this->getStringFieldValue($node, 'schema_short_description', $cacheability),
    ];

    $image = $this->getImageProp($node, 'schema_image', $cacheability);
    if ($image !== NULL) {
      $props['image'] = $image;
    }

    if ($variant === 'news') {
      $props['date'] = \Drupal::service('date.formatter')->format($node->getCreatedTime(), 'html_date');
      $props['fullstorylink'] = $url;
    }
    else {
      $props['layout'] = 'card';
      $props['teaserlink'] = $url;
    }

    return $props;
  }

  /**
   * Builds the props used by the Case Study Teaser SDC.
   */
  private function buildCaseStudyTeaserProps(NodeInterface $node, CacheableMetadata $cacheability): array {
    $props = [
      'teaserlink' => $node->toUrl('canonical')->toString(),
      'title' => $node->label(),
      'client' => $this->getReferencedLabel($node, 'schema_client', $cacheability),
      'summary' => $this->getStringFieldValue($node, 'schema_description', $cacheability),
    ];

    $image = $this->getImageProp($node, 'schema_image', $cacheability);
    if ($image !== NULL) {
      $props['image'] = $image;
    }

    return $props;
  }

  /**
   * Builds full-page props while preserving prepared field render arrays.
   */
  private function buildCaseStudyFullProps(array $variables, CacheableMetadata $cacheability): array {
    $props = [
      'title' => $variables['label'],
    ];

    foreach ([
      'client' => 'schema_client',
      'description' => 'schema_description',
      'hero_image' => 'field_hero_image',
      'body' => 'field_body',
      'expertise' => 'field_expertise',
      'tools' => 'field_tools',
      'team_members' => 'field_team_members',
      'keywords' => 'schema_keywords',
      'outcomes' => 'field_outcomes',
    ] as $prop => $field_name) {
      $props[$prop] = $variables['content'][$field_name] ?? [];
    }

    // The Proofpoints SDC receives scalar props rather than the field render
    // array, so its access and cache dependencies are applied to the preprocess
    // variables by the caller.
    $props['proofpoints_component_props'] = $this->buildProofpointsProps($variables['node'], $cacheability);

    return $props;
  }

  /**
   * Maps Proof point paragraphs to the Proofpoints SDC stat and label props.
   *
   * The SDC displays at most three stats, so additional paragraphs are ignored.
   */
  private function buildProofpointsProps(NodeInterface $node, CacheableMetadata $cacheability): array {
    if (!$node->hasField('field_proof_points')) {
      return [];
    }

    $field = $node->get('field_proof_points');
    $field_access = $field->access('view', NULL, TRUE);
    $cacheability->addCacheableDependency($field_access);
    if (!$field_access->isAllowed() || $field->isEmpty()) {
      return [];
    }

    $entity_repository = \Drupal::service('entity.repository');
    $props = [];
    $position = 0;
    foreach ($field->referencedEntities() as $paragraph) {
      if ($position === 3) {
        break;
      }

      $paragraph = $entity_repository->getTranslationFromContext($paragraph);
      $cacheability->addCacheableDependency($paragraph);
      $paragraph_access = $paragraph->access('view', NULL, TRUE);
      $cacheability->addCacheableDependency($paragraph_access);
      if (!$paragraph_access->isAllowed()) {
        continue;
      }

      $stat = trim($this->getParagraphStringValue($paragraph, 'field_value', $cacheability));
      $label = trim($this->getParagraphStringValue($paragraph, 'field_description', $cacheability, TRUE));
      if ($stat === '' || $label === '') {
        continue;
      }

      $position++;
      $props['stat_' . $position] = $stat;
      $props['label_' . $position] = $label;
    }

    return $props;
  }

  /**
   * Gets an accessible paragraph field value as plain text.
   *
   * Formatted text is run through its text format before tags are removed, so
   * the SDC string props receive filtered output.
   */
  private function getParagraphStringValue(EntityInterface $paragraph, string $field_name, CacheableMetadata $cacheability, bool $formatted = FALSE): string {
    if (!$paragraph->hasField($field_name)) {
      return '';
    }

    $field = $paragraph->get($field_name);
    $access = $field->access('view', NULL, TRUE);
    $cacheability->addCacheableDependency($access);
    if (!$access->isAllowed() || $field->isEmpty()) {
      return '';
    }

    if (!$formatted) {
      return (string) $field->value;
    }

    $format = $field->format;
    if ($format && ($filter_format = FilterFormat::load($format))) {
      $cacheability->addCacheableDependency($filter_format);
    }
    return Html::decodeEntities(strip_tags((string) $field->first()->processed));
  }

  /**
   * Gets a scalar string field value without assuming the field exists.
   */
  private function getStringFieldValue(NodeInterface $node, string $field_name, CacheableMetadata $cacheability): string {
    if (!$node->hasField($field_name)) {
      return '';
    }

    $field = $node->get($field_name);
    $access = $field->access('view', NULL, TRUE);
    $cacheability->addCacheableDependency($access);
    return !$access->isAllowed() || $field->isEmpty() ? '' : (string) $field->value;
  }

  /**
   * Gets the label of an entity reference field without assuming a target.
   */
  private function getReferencedLabel(NodeInterface $node, string $field_name, CacheableMetadata $cacheability): string {
    if (!$node->hasField($field_name)) {
      return '';
    }

    $field = $node->get($field_name);
    $field_access = $field->access('view', NULL, TRUE);
    $cacheability->addCacheableDependency($field_access);
    if (!$field_access->isAllowed() || $field->isEmpty()) {
      return '';
    }

    $entity = $field->entity;
    if (!$entity instanceof EntityInterface) {
      return '';
    }

    $cacheability->addCacheableDependency($entity);
    $entity_access = $entity->access('view', NULL, TRUE);
    $cacheability->addCacheableDependency($entity_access);
    return $entity_access->isAllowed() ? (string) $entity->label() : '';
  }

  /**
   * Converts a referenced Media image into the SDC image prop shape.
   */
  private function getImageProp(NodeInterface $node, string $field_name, CacheableMetadata $cacheability): ?array {
    if (!$node->hasField($field_name)) {
      return NULL;
    }

    $field = $node->get($field_name);
    $field_access = $field->access('view', NULL, TRUE);
    $cacheability->addCacheableDependency($field_access);
    if (!$field_access->isAllowed()) {
      return NULL;
    }

    $media = $field->isEmpty() ? NULL : $field->entity;
    if (!$media instanceof MediaInterface || !$media->hasField('field_media_image')) {
      return NULL;
    }

    $cacheability->addCacheableDependency($media);
    $media_access = $media->access('view', NULL, TRUE);
    $cacheability->addCacheableDependency($media_access);
    if (!$media_access->isAllowed()) {
      return NULL;
    }

    $image_field = $media->get('field_media_image');
    if (!$image_field instanceof FieldItemListInterface) {
      return NULL;
    }

    $image_field_access = $image_field->access('view', NULL, TRUE);
    $cacheability->addCacheableDependency($image_field_access);
    if (!$image_field_access->isAllowed() || $image_field->isEmpty()) {
      return NULL;
    }

    $image_item = $image_field->first();
    $file = $image_item?->entity;
    if (!$file instanceof FileInterface) {
      return NULL;
    }

    $cacheability->addCacheableDependency($file);
    $file_access = $file->access('view', NULL, TRUE);
    $cacheability->addCacheableDependency($file_access);
    if (!$file_access->isAllowed()) {
      return NULL;
    }

    $node_view_display = EntityViewDisplay::load('node.' . $node->bundle() . '.teaser');
    if (!$node_view_display) {
      return NULL;
    }
    $cacheability->addCacheableDependency($node_view_display);
    $node_image_component = $node_view_display?->getComponent($field_name);
    $media_view_mode = $node_image_component['settings']['view_mode'] ?? NULL;
    if (!is_string($media_view_mode) || $media_view_mode === '') {
      return NULL;
    }

    $media_view_display = EntityViewDisplay::load('media.' . $media->bundle() . '.' . $media_view_mode);
    if (!$media_view_display) {
      return NULL;
    }
    $cacheability->addCacheableDependency($media_view_display);
    $media_image_component = $media_view_display?->getComponent('field_media_image');
    $image_style_id = $media_image_component['settings']['image_style'] ?? NULL;
    if (!is_string($image_style_id) || $image_style_id === '') {
      return NULL;
    }

    $image_uri = $file->getFileUri();
    $image_style = ImageStyle::load($image_style_id);
    if (!$image_style) {
      return NULL;
    }
    $cacheability->addCacheableDependency($image_style);

    $dimensions = [
      'width' => max(1, (int) ($image_item->width ?? 0)),
      'height' => max(1, (int) ($image_item->height ?? 0)),
    ];
    $image_style->transformDimensions($dimensions, $image_uri);

    return [
      'src' => $image_style->buildUrl($image_uri),
      'alt' => (string) ($image_item->alt ?? ''),
      'width' => max(1, (int) $dimensions['width']),
      'height' => max(1, (int) $dimensions['height']),
    ];
  }

  /**
   * Adds URL protocol filtering to SDC component props.
   */
  #[Hook('element_info_alter')]
  public function elementInfoAlter(array &$info): void {
    $info['component']['#propsAlter'][] = [self::class, 'sanitizeComponentUrls'];
  }

  /**
   * Removes dangerous protocols from URL props before component rendering.
   *
   * @param array<string, mixed> $props
   *   Component properties.
   *
   * @return array<string, mixed>
   *   Sanitized component properties.
   */
  #[TrustedCallback]
  public static function sanitizeComponentUrls(array $props): array {
    $url_properties = [
      'src',
      'link',
      'icon',
      'primary_button_url',
      'secondary_button_url',
      'teaserlink',
      'fullstorylink',
      'transcript_url',
    ];
    foreach ($url_properties as $property) {
      if (isset($props[$property]) && is_string($props[$property])) {
        $props[$property] = UrlHelper::stripDangerousProtocols($props[$property]);
      }
    }

    if (isset($props['video_url']) && is_string($props['video_url'])) {
      $props['video_url'] = UrlHelper::stripDangerousProtocols($props['video_url']);
      $video_scheme = strtolower((string) parse_url($props['video_url'], PHP_URL_SCHEME));
      if ($video_scheme !== 'https') {
        unset($props['video_url']);
      }
    }

    if (isset($props['image']['src']) && is_string($props['image']['src'])) {
      $props['image']['src'] = UrlHelper::stripDangerousProtocols($props['image']['src']);
    }

    return $props;
  }

}
