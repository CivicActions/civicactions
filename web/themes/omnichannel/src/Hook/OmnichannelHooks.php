<?php

namespace Drupal\omnichannel\Hook;

use Drupal\Component\Utility\UrlHelper;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Security\Attribute\TrustedCallback;
use Drupal\media\MediaInterface;
use Drupal\node\NodeInterface;

/**
 * Hook implementations for omnichannel.
 */
class OmnichannelHooks {
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
    $variables['is_canvas_page'] = \Drupal::routeMatch()->getRouteName() === 'entity.canvas_page.canonical';
  }

  /**
   * Prepares SDC props for content teaser view modes.
   */
  #[Hook('preprocess_node')]
  public function preprocessNode(array &$variables): void {
    if (($variables['view_mode'] ?? '') !== 'teaser' || !($variables['node'] ?? NULL) instanceof NodeInterface) {
      return;
    }

    $node = $variables['node'];
    $variables['teaser_props'] = match ($node->bundle()) {
      'person' => $this->buildPersonTeaserProps($node),
      'editorial' => $this->buildEditorialTeaserProps($node),
      'case_study' => $this->buildCaseStudyTeaserProps($node),
      default => [],
    };
  }

  /**
   * Builds the props used by the Person Teaser SDC.
   */
  private function buildPersonTeaserProps(NodeInterface $node): array {
    return [
      'heading_level' => 3,
      'name' => $node->label(),
      'role' => $this->getStringFieldValue($node, 'schema_job_title'),
      'image' => $this->getImageProp($node, 'schema_image') ?? [
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
  private function buildEditorialTeaserProps(NodeInterface $node): array {
    $url = $node->toUrl('canonical')->toString();
    $editorial_type = strtolower($this->getReferencedLabel($node, 'field_editorial_type'));
    $variant = match ($editorial_type) {
      'news', 'whitepaper' => 'news',
      'article', 'highlight' => 'press',
      default => 'press',
    };
    $props = [
      'variant' => $variant,
      'title' => $node->label(),
      'description' => $this->getStringFieldValue($node, 'schema_short_description'),
    ];

    $image = $this->getImageProp($node, 'schema_image');
    if ($image !== NULL) {
      $props['image'] = $image;
    }

    if ($variant === 'news') {
      $props['date'] = \Drupal::service('date.formatter')->format($node->getCreatedTime(), 'custom', 'Y-m-d');
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
  private function buildCaseStudyTeaserProps(NodeInterface $node): array {
    $props = [
      'teaserlink' => $node->toUrl('canonical')->toString(),
      'title' => $node->label(),
      'client' => $this->getReferencedLabel($node, 'schema_client'),
      'summary' => $this->getStringFieldValue($node, 'schema_description'),
    ];

    $image = $this->getImageProp($node, 'schema_image');
    if ($image !== NULL) {
      $props['image'] = $image;
    }

    return $props;
  }

  /**
   * Gets a scalar string field value without assuming the field exists.
   */
  private function getStringFieldValue(NodeInterface $node, string $field_name): string {
    if (!$node->hasField($field_name)) {
      return '';
    }

    $field = $node->get($field_name);
    return $field->isEmpty() ? '' : (string) $field->value;
  }

  /**
   * Gets the label of an entity reference field without assuming a target.
   */
  private function getReferencedLabel(NodeInterface $node, string $field_name): string {
    if (!$node->hasField($field_name)) {
      return '';
    }

    $field = $node->get($field_name);
    $entity = $field->isEmpty() ? NULL : $field->entity;
    return $entity && method_exists($entity, 'label') ? (string) $entity->label() : '';
  }

  /**
   * Converts a referenced Media image into the SDC image prop shape.
   */
  private function getImageProp(NodeInterface $node, string $field_name): ?array {
    if (!$node->hasField($field_name)) {
      return NULL;
    }

    $field = $node->get($field_name);
    $media = $field->isEmpty() ? NULL : $field->entity;
    if (!$media instanceof MediaInterface || !$media->hasField('field_media_image')) {
      return NULL;
    }

    $image_field = $media->get('field_media_image');
    if (!$image_field instanceof FieldItemListInterface || $image_field->isEmpty()) {
      return NULL;
    }

    $image_item = $image_field->first();
    $file = $image_item?->entity;
    if (!$file || !method_exists($file, 'getFileUri')) {
      return NULL;
    }

    return [
      'src' => \Drupal::service('file_url_generator')->generateString($file->getFileUri()),
      'alt' => (string) ($image_item->alt ?? ''),
      'width' => max(1, (int) ($image_item->width ?? 0)),
      'height' => max(1, (int) ($image_item->height ?? 0)),
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
    foreach (['src', 'link', 'icon', 'primary_button_url', 'secondary_button_url', 'teaserlink', 'fullstorylink', 'transcript_url'] as $property) {
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
