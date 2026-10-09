<?php

/**
 * @file
 * Post-update hooks for CivicActions Blog Migration.
 */

use Drupal\editor\Entity\Editor;
use Drupal\field\Entity\FieldConfig;
use Drupal\filter\Entity\FilterFormat;

/**
 * Creates a full-content format and applies it to Article body content.
 */
function civicactions_blog_migration_post_update_full_content_format(&$sandbox = NULL): string {
  $format_id = 'full_content';

  $format = FilterFormat::load($format_id);
  if (!$format) {
    $format = FilterFormat::create([
      'format' => $format_id,
      'name' => 'Full content',
      'status' => TRUE,
      'weight' => -5,
      'filters' => [
        'filter_align' => [
          'id' => 'filter_align',
          'provider' => 'filter',
          'status' => TRUE,
          'weight' => 0,
          'settings' => [],
        ],
        'filter_caption' => [
          'id' => 'filter_caption',
          'provider' => 'filter',
          'status' => TRUE,
          'weight' => 0,
          'settings' => [],
        ],
        'filter_autop' => [
          'id' => 'filter_autop',
          'provider' => 'filter',
          'status' => TRUE,
          'weight' => 1,
          'settings' => [],
        ],
        'filter_html' => [
          'id' => 'filter_html',
          'provider' => 'filter',
          'status' => FALSE,
          'weight' => -10,
          'settings' => [
            'allowed_html' => '',
            'filter_html_help' => FALSE,
            'filter_html_nofollow' => FALSE,
          ],
        ],
        'filter_htmlcorrector' => [
          'id' => 'filter_htmlcorrector',
          'provider' => 'filter',
          'status' => TRUE,
          'weight' => 10,
          'settings' => [],
        ],
        'filter_image_lazy_load' => [
          'id' => 'filter_image_lazy_load',
          'provider' => 'filter',
          'status' => TRUE,
          'weight' => 15,
          'settings' => [],
        ],
      ],
    ]);
    $format->save();
  }

  $editor = Editor::load($format_id);
  if (!$editor) {
    $editor = Editor::create([
      'format' => $format_id,
      'editor' => 'ckeditor5',
      'status' => TRUE,
      'settings' => [
        'toolbar' => [
          'items' => [
            'heading',
            'bold',
            'italic',
            'blockQuote',
            'link',
            'bulletedList',
            'numberedList',
            'indent',
            'outdent',
            'alignment',
            'insertTable',
            'drupalMedia',
            'undo',
            'redo',
            'removeFormat',
            'sourceEditing',
          ],
        ],
        'plugins' => [
          'ckeditor5_alignment' => [
            'enabled_alignments' => ['center', 'justify', 'left', 'right'],
          ],
          'ckeditor5_heading' => [
            'enabled_headings' => ['heading2', 'heading3', 'heading4', 'heading5', 'heading6'],
          ],
          'ckeditor5_list' => [
            'properties' => [
              'reversed' => TRUE,
              'startIndex' => TRUE,
              'styles' => FALSE,
            ],
            'multiBlock' => TRUE,
          ],
          'ckeditor5_sourceEditing' => [
            'allowed_tags' => [],
          ],
          'media_media' => [
            'allow_view_mode_override' => TRUE,
          ],
        ],
      ],
      'image_upload' => [
        'status' => FALSE,
      ],
    ]);
    $editor->save();
  }

  $field = FieldConfig::loadByName('node', 'article', 'schema_article_body');
  if ($field) {
    $settings = $field->getSettings();
    $settings['allowed_formats'] = [$format_id => $format_id];
    $field->set('settings', $settings);
    $field->save();
  }

  // Ensure previously imported rows use the new format.
  \Drupal::database()
    ->update('node__schema_article_body')
    ->fields(['schema_article_body_format' => $format_id])
    ->condition('schema_article_body_format', 'basic_html')
    ->execute();

  \Drupal::database()
    ->update('node_revision__schema_article_body')
    ->fields(['schema_article_body_format' => $format_id])
    ->condition('schema_article_body_format', 'basic_html')
    ->execute();

  return 'Created full_content text format and made it default for article body.';
}

/**
 * Ensures Editorial field_content allows the Body content paragraph bundle.
 */
function civicactions_blog_migration_post_update_editorial_content_paragraph_bundle(&$sandbox = NULL): string {
  $field = FieldConfig::loadByName('node', 'editorial', 'field_content');
  if (!$field) {
    return 'Skipped: Editorial field_content does not exist.';
  }

  if ($field->getType() !== 'entity_reference_revisions') {
    return 'Skipped: Editorial field_content is not an entity reference revisions field.';
  }

  $settings = $field->getSettings();
  $handler_settings = $settings['handler_settings'] ?? [];
  $target_bundles = $handler_settings['target_bundles'] ?? [];

  $paragraph_type_storage = \Drupal::entityTypeManager()->getStorage('paragraphs_type');
  $body_content_bundle = NULL;

  if ($paragraph_type_storage->load('body_content')) {
    $body_content_bundle = 'body_content';
  }
  else {
    foreach ($paragraph_type_storage->loadMultiple() as $bundle_id => $paragraph_type) {
      if (mb_strtolower((string) $paragraph_type->label()) === 'body content') {
        $body_content_bundle = (string) $bundle_id;
        break;
      }
    }
  }

  if ($body_content_bundle === NULL) {
    return 'Skipped: Body content paragraph bundle was not found.';
  }

  $target_bundles[$body_content_bundle] = $body_content_bundle;
  $handler_settings['target_bundles'] = $target_bundles;

  if (!isset($handler_settings['target_bundles_drag_drop'])) {
    $handler_settings['target_bundles_drag_drop'] = [];
  }
  if (!isset($handler_settings['target_bundles_drag_drop'][$body_content_bundle])) {
    $handler_settings['target_bundles_drag_drop'][$body_content_bundle] = [
      'weight' => 0,
      'enabled' => TRUE,
    ];
  }
  else {
    $handler_settings['target_bundles_drag_drop'][$body_content_bundle]['enabled'] = TRUE;
  }

  $settings['handler_settings'] = $handler_settings;
  $field->set('settings', $settings);
  $field->save();

  return 'Editorial field_content now allows the Body content paragraph bundle.';
}
