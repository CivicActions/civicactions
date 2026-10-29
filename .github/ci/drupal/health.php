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

// 1. Requirements checks (severity REQUIREMENT_ERROR = 2)
try {
  \Drupal::moduleHandler()->loadInclude('system', 'install');
  $requirements = \Drupal::moduleHandler()->invokeAll('requirements', ['runtime']);
  foreach ($requirements as $key => $req) {
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

// 2. Pending database updates
try {
  $update_registry = \Drupal::service('update.post_update_registry');
  $pending_post_updates = $update_registry->getPendingUpdateFunctions();
  $pending_updates = [];
  foreach (\Drupal::moduleHandler()->getModuleList() as $module => $extension) {
    \Drupal::moduleHandler()->loadInclude($module, 'install');
    $updates = drupal_get_schema_versions($module);
    $installed_version = drupal_get_installed_schema_version($module);
    if (!empty($updates)) {
      foreach ($updates as $version) {
        if ($version > $installed_version) {
          $pending_updates[] = "{$module}_{$version}";
        }
      }
    }
  }
  $result['pending_updates'] = array_merge($pending_updates, $pending_post_updates);
} catch (\Throwable $e) {
  $result['pending_updates'][] = 'Error checking updates: ' . $e->getMessage();
}

// 3. Configuration drift (names and states only)
try {
  $active_storage = \Drupal::service('config.storage');
  $sync_storage = \Drupal::service('config.import_transformer')->transform($active_storage);
  $target_sync = \Drupal::service('config.storage.sync');
  $comparer = new \Drupal\Core\Config\StorageComparer($sync_storage, $target_sync);
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

// 4. Automatic updates enforcement (FR-005)
try {
  $unattended_level = \Drupal::config('automatic_updates.settings')->get('unattended.level');
  if ($unattended_level !== 'disable') {
    $result['automatic_updates_disabled'] = false;
  }
} catch (\Throwable $e) {
  // If config is missing or module is not active, that's fine
}

// 5. Watchdog logging (max wid and new errors)
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
