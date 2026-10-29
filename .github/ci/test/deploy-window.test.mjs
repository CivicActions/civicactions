import test from 'node:test';
import assert from 'node:assert/strict';
import { checkDeployWindow } from '../deploy-window.mjs';

const config = {
  days: [1, 2, 3, 4], // Mon - Thu
  start: '09:00',
  end: '15:00',
  tz: 'America/Los_Angeles',
};

test('checkDeployWindow: Tuesday at 10:30 AM PT is open', () => {
  // 2026-10-27 is a Tuesday. 10:30 AM PDT = 17:30 UTC
  const result = checkDeployWindow(config, '2026-10-27T17:30:00Z');
  assert.equal(result.open, true);
  assert.equal(result.holiday, null);
});

test('checkDeployWindow: Tuesday at 08:30 AM PT is closed (too early)', () => {
  // 08:30 AM PDT = 15:30 UTC
  const result = checkDeployWindow(config, '2026-10-27T15:30:00Z');
  assert.equal(result.open, false);
});

test('checkDeployWindow: Tuesday at 03:30 PM PT is closed (too late)', () => {
  // 15:30 PDT = 22:30 UTC
  const result = checkDeployWindow(config, '2026-10-27T22:30:00Z');
  assert.equal(result.open, false);
});

test('checkDeployWindow: Friday at 11:00 AM PT is closed (Friday not in window)', () => {
  // 2026-10-30 is a Friday. 11:00 AM PDT = 18:00 UTC
  const result = checkDeployWindow(config, '2026-10-30T18:00:00Z');
  assert.equal(result.open, false);
});

test('checkDeployWindow: Sunday at 11:00 AM PT is closed (Weekend)', () => {
  // 2026-11-01 is a Sunday.
  const result = checkDeployWindow(config, '2026-11-01T19:00:00Z');
  assert.equal(result.open, false);
});

test('checkDeployWindow: Thanksgiving Day (Thursday) is closed due to holiday', () => {
  // 2026-11-26 is Thanksgiving. 10:00 AM PST = 18:00 UTC
  const result = checkDeployWindow(config, '2026-11-26T18:00:00Z');
  assert.equal(result.open, false);
  assert.equal(result.holiday, 'Thanksgiving Day');
});

test('checkDeployWindow: Observed holiday (July 4 on Saturday, observed Friday July 3)', () => {
  // In 2026, July 4 is Saturday, so observed on Friday July 3.
  const result = checkDeployWindow(config, '2026-07-03T18:00:00Z');
  assert.equal(result.holiday, 'Independence Day');
});
