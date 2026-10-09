<?php

namespace Drupal\omnichannel\Hook;

use Drupal\Component\Utility\UrlHelper;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Security\Attribute\TrustedCallback;

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
