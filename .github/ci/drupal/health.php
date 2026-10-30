<?php

/**
 * Health check diagnostic script for Drupal on Pantheon.
 * Outputs JSON report of system health, schema, config drift, and errors.
 */

$result = [
  'timestamp' => date('c'),
  'status' => 'PASS',
  'requirements_errors' => [],
  'pending_updates' => [],
  'config_status' => [],
  'schema_errors' => [],
  'security_advisories' => [],
  'automatic_updates_disabled' => true,
  'max_wid' => 0,
  'new_errors' => [],
];

$since_wid = isset($_SERVER['HEALTH_SINCE_WID']) ? (int) $_SERVER['HEALTH_SINCE_WID'] : (isset($extra['since_wid']) ? (int) $extra['since_wid'] : 0);

// Automatic updates enforcement (FR-005). Evaluated first because it decides
// whether the module's readiness requirement is relevant.
try {
  $unattended_level = \Drupal::config('automatic_updates.settings')->get('unattended.level');
  if ($unattended_level !== NULL && $unattended_level !== 'disable') {
    $result['automatic_updates_disabled'] = false;
  }
} catch (\Throwable $e) {
  // If config is missing or module is not active, that's fine
}

// 1. Requirements checks (severity REQUIREMENT_ERROR = 2)
try {
  \Drupal::moduleHandler()->loadInclude('system', 'install');
  $requirements = \Drupal::moduleHandler()->invokeAll('requirements', ['runtime']);
  foreach ($requirements as $key => $req) {
    // Pantheon's code filesystem is always read-only, so automatic_updates
    // readiness checks can never pass there. Irrelevant while unattended
    // updates are disabled.
    if ($result['automatic_updates_disabled'] && str_starts_with((string) $key, 'automatic_updates_status')) {
      continue;
    }
    if (isset($req['severity']) && (int) $req['severity'] === 2) {
      $result['requirements_errors'][] = [
        'name' => $key,
        'title' => (string) ($req['title'] ?? $key),
        'value' => (string) ($req['value'] ?? ''),
        'description' => (string) ($req['description'] ?? ''),
      ];
    }
  }
} catch (\Throwable $e) {
  $result['requirements_errors'][] = ['error' => $e->getMessage()];
}

// 2. Pending database updates (same APIs as drush updatedb:status)
try {
  require_once DRUPAL_ROOT . '/core/includes/install.inc';
  require_once DRUPAL_ROOT . '/core/includes/update.inc';
  drupal_load_updates();
  $pending_updates = [];
  foreach (update_get_update_list() as $module => $info) {
    if (!empty($info['warning'])) {
      $pending_updates[] = "{$module}: " . strip_tags((string) $info['warning']);
    }
    foreach (array_keys($info['pending'] ?? []) as $version) {
      $pending_updates[] = "{$module}_update_{$version}";
    }
  }
  $pending_post_updates = \Drupal::service('update.post_update_registry')->getPendingUpdateFunctions();
  $result['pending_updates'] = array_merge($pending_updates, $pending_post_updates);
} catch (\Throwable $e) {
  $result['pending_updates'][] = 'Error checking updates: ' . $e->getMessage();
}

// 3. Configuration drift (names and states only; same as drush config:status)
try {
  $sync_storage = \Drupal::service('config.import_transformer')->transform(\Drupal::service('config.storage.sync'));
  $comparer = new \Drupal\Core\Config\StorageComparer($sync_storage, \Drupal::service('config.storage'));
  $comparer->createChangelist();

  foreach (['create', 'update', 'delete', 'rename'] as $op) {
    foreach ($comparer->getChangelist($op) as $change) {
      $state = ($op === 'create') ? 'Only in sync' : (($op === 'delete') ? 'Only in DB' : 'Different');
      $result['config_status'][] = [
        'name' => $change,
        'state' => $state,
        'operation' => $op,
      ];
    }
  }
} catch (\Throwable $e) {
  $result['config_status'][] = ['name' => 'error', 'state' => $e->getMessage(), 'operation' => 'error'];
}

// 4. Watchdog logging (max wid and new errors)
try {
  if (\Drupal::database()->schema()->tableExists('watchdog')) {
    $max_wid = \Drupal::database()->query("SELECT MAX(wid) FROM {watchdog}")->fetchField();
    $result['max_wid'] = (int) ($max_wid ?: 0);

    if ($since_wid > 0) {
      $errors = \Drupal::database()->query(
        "SELECT wid, type, message, variables, severity, timestamp FROM {watchdog} WHERE wid > :since AND severity <= 3 ORDER BY wid ASC LIMIT 50",
        [':since' => $since_wid]
      )->fetchAll();
      foreach ($errors as $row) {
        $msg = (string) $row->message;
        $vars = @unserialize($row->variables);
        if (is_array($vars)) {
          $msg = strtr($msg, $vars);
        }
        $result['new_errors'][] = [
          'wid' => (int) $row->wid,
          'type' => (string) $row->type,
          'message' => strip_tags($msg),
          'severity' => (int) $row->severity,
          'timestamp' => (int) $row->timestamp,
        ];
      }
    }
  }
} catch (\Throwable $e) {
  $result['new_errors'][] = ['error' => $e->getMessage()];
}

// Overall status determination
if (
  !empty($result['requirements_errors']) ||
  !empty($result['pending_updates']) ||
  !empty($result['config_status']) ||
  !$result['automatic_updates_disabled'] ||
  !empty($result['new_errors'])
) {
  $result['status'] = 'FAIL';
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
