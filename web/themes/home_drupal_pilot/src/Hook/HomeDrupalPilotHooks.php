<?php

namespace Drupal\home_drupal_pilot\Hook;

use Drupal\Component\Utility\UrlHelper;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Security\Attribute\TrustedCallback;

/**
 * Hook implementations for Home Drupal Pilot.
 */
class HomeDrupalPilotHooks {
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
    foreach (['src', 'primary_button_url', 'secondary_button_url', 'teaserlink'] as $property) {
      if (isset($props[$property]) && is_string($props[$property])) {
        $props[$property] = UrlHelper::stripDangerousProtocols($props[$property]);
      }
    }

    return $props;
  }

}
