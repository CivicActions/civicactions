<?php

declare(strict_types=1);

namespace Drupal\civicactions_greenhouse\Form;

use Drupal\Core\Cache\Cache;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configure CivicActions Greenhouse settings for this site.
 */
final class GreenhouseSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'civicactions_greenhouse_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return ['civicactions_greenhouse.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->config('civicactions_greenhouse.settings');

    $form['heading'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Section Heading'),
      '#default_value' => $config->get('heading') ?? 'Open positions',
      '#description' => $this->t('The title displayed above the open jobs list.'),
      '#required' => TRUE,
    ];

    $form['intro'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Introductory Text'),
      '#default_value' => $config->get('intro') ?? 'CivicActions is an equal opportunity employer. We do not discriminate on the basis of race, color, religion, sex, sexual orientation, gender identity, national origin, disability, or veteran status.',
      '#description' => $this->t('Introductory or disclaimer text displayed below the section heading.'),
      '#rows' => 4,
    ];

    $form['board_token'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Greenhouse Board Token'),
      '#default_value' => $config->get('board_token') ?? 'civicactions',
      '#description' => $this->t('The identifier for the Greenhouse job board (e.g. "civicactions").'),
      '#required' => TRUE,
    ];

    $form['webhook_secret'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Webhook Secret Key'),
      '#default_value' => $config->get('webhook_secret') ?? '',
      '#description' => $this->t('The shared secret key used to authenticate incoming Greenhouse webhooks via HTTP Basic Authentication. Can be overridden in settings.php via $config["civicactions_greenhouse.settings"]["webhook_secret"].'),
      '#attributes' => [
        'autocomplete' => 'new-password',
      ],
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $this->config('civicactions_greenhouse.settings')
      ->set('heading', trim((string) $form_state->getValue('heading')))
      ->set('intro', trim((string) $form_state->getValue('intro')))
      ->set('board_token', trim((string) $form_state->getValue('board_token')))
      ->set('webhook_secret', trim((string) $form_state->getValue('webhook_secret')))
      ->save();

    // Invalidate jobs cache tags so heading, intro, or board token updates
    // take effect immediately.
    Cache::invalidateTags(['civicactions_greenhouse:jobs', 'config:civicactions_greenhouse.settings']);

    parent::submitForm($form, $form_state);
  }

}
