import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { applyDrift, isSyncCommit, parseConfigStatus, RoundTripError } from '../config-sync.mjs';

function dirs(exportFiles, configFiles) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'config-sync-'));
  const exportDir = path.join(root, 'export');
  const configDir = path.join(root, 'config');
  fs.mkdirSync(exportDir);
  fs.mkdirSync(configDir);
  for (const [name, content] of Object.entries({ 'core.extension': 'module: {}\n', ...exportFiles })) {
    fs.writeFileSync(path.join(exportDir, `${name}.yml`), content);
  }
  for (const [name, content] of Object.entries(configFiles)) {
    fs.writeFileSync(path.join(configDir, `${name}.yml`), content);
  }
  return { exportDir, configDir };
}

const read = (dir, name) => fs.readFileSync(path.join(dir, `${name}.yml`), 'utf8');

test('parseConfigStatus: reads drift around interleaved Drush log lines', () => {
  const raw = [
    ' [warning] Package Manager is available for early testing.',
    '{',
    '    "block.block.ai_chatbot": { "name": "block.block.ai_chatbot", "state": "Different" },',
    '    "canvas.component.block.x": { "name": "canvas.component.block.x", "state": "Only in DB" }',
    '}',
    ' [notice] Done.',
  ].join('\n');

  assert.deepEqual(parseConfigStatus(raw), [
    { name: 'block.block.ai_chatbot', state: 'Different' },
    { name: 'canvas.component.block.x', state: 'Only in DB' },
  ]);
});

test('parseConfigStatus: no JSON means no drift', () => {
  assert.deepEqual(parseConfigStatus(' [notice] No differences between DB and sync directory.\n'), []);
  assert.deepEqual(parseConfigStatus('[]\n'), []);
});

test('parseConfigStatus: rejects names that are not plain config names', () => {
  assert.throws(() => parseConfigStatus('{"x": {"name": "../settings", "state": "Different"}}'), /Unexpected config name/);
  assert.throws(() => parseConfigStatus('{"x": {"name": "a.b", "state": "Renamed"}}'), /Unsupported config:status state/);
});

test('applyDrift: copies only drifted items and deletes items only in git', () => {
  const { exportDir, configDir } = dirs(
    { 'a.updated': 'new: 1\n', 'b.created': 'created: 1\n', 'c.unrelated': 'value: "x"\n' },
    { 'a.updated': 'old: 1\n', 'c.unrelated': "value: 'x'\n", 'd.removed': 'gone: 1\n' },
  );

  const changed = applyDrift({
    drift: [
      { name: 'a.updated', state: 'Different' },
      { name: 'b.created', state: 'Only in DB' },
      { name: 'd.removed', state: 'Only in sync dir' },
    ],
    exportDir,
    configDir,
  });

  assert.deepEqual(changed.map((c) => c.name), ['a.updated', 'b.created', 'd.removed']);
  assert.equal(read(configDir, 'a.updated'), 'new: 1\n');
  assert.equal(read(configDir, 'b.created'), 'created: 1\n');
  assert.equal(fs.existsSync(path.join(configDir, 'd.removed.yml')), false);
  // Formatting-only differences outside the drift list are left alone.
  assert.equal(read(configDir, 'c.unrelated'), "value: 'x'\n");
});

test('applyDrift: no drift changes nothing', () => {
  const { exportDir, configDir } = dirs({}, { 'a.same': 'x: 1\n' });
  assert.deepEqual(applyDrift({ drift: [], exportDir, configDir }), []);
});

test('applyDrift: drift whose export matches git does not round-trip', () => {
  const { exportDir, configDir } = dirs({ 'a.stuck': 'x: 1\n' }, { 'a.stuck': 'x: 1\n' });
  assert.throws(
    () => applyDrift({ drift: [{ name: 'a.stuck', state: 'Different' }], exportDir, configDir }),
    RoundTripError,
  );
});

test('applyDrift: rejects an incomplete export', () => {
  const { exportDir, configDir } = dirs({}, {});
  fs.unlinkSync(path.join(exportDir, 'core.extension.yml'));
  assert.throws(() => applyDrift({ drift: [], exportDir, configDir }), /incomplete/);

  const complete = dirs({}, {});
  assert.throws(
    () => applyDrift({ drift: [{ name: 'a.missing', state: 'Different' }], ...complete }),
    /export does not contain it/,
  );
});

test('isSyncCommit: detects the trailer only at the start of a line', () => {
  assert.equal(isSyncCommit('chore(config): sync\n\nConfig-Sync: https://example.com/run/1\n'), true);
  assert.equal(isSyncCommit('chore(deps): bump drupal/ai\n\nMentions Config-Sync: in passing\n'), false);
});
