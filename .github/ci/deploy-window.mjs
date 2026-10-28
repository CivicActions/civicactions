import fs from 'node:fs';
import { isFederalHoliday } from './lib/holidays.mjs';

/**
 * Checks if the given timestamp falls inside the permitted deployment window.
 * Window format: { days: [1,2,3,4], start: "09:00", end: "15:00", tz: "America/Los_Angeles" }
 * Zero external dependencies. Uses Intl.DateTimeFormat for timezone conversion.
 */
export function checkDeployWindow(windowConfig, targetDate = new Date()) {
  const d = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const tz = windowConfig.tz || 'America/Los_Angeles';

  // Format date parts in target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  });

  const parts = formatter.formatToParts(d);
  const getPart = (type) => parts.find((p) => p.type === type)?.value || '';

  const weekdayStr = getPart('weekday'); // Mon, Tue, etc.
  const hour = parseInt(getPart('hour'), 10);
  const minute = parseInt(getPart('minute'), 10);
  const year = parseInt(getPart('year'), 10);
  const month = parseInt(getPart('month'), 10);
  const day = parseInt(getPart('day'), 10);

  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const currentDayOfWeek = weekdayMap[weekdayStr] ?? 0;

  // Check Federal Holiday in local timezone date
  const localDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00Z`;
  const holidayName = isFederalHoliday(localDateStr);

  const allowedDays = windowConfig.days || [1, 2, 3, 4]; // Default Mon-Thu
  const [startH, startM] = (windowConfig.start || '09:00').split(':').map((n) => parseInt(n, 10));
  const [endH, endM] = (windowConfig.end || '15:00').split(':').map((n) => parseInt(n, 10));

  const currentMinutes = hour * 60 + minute;
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  const isAllowedDay = allowedDays.includes(currentDayOfWeek);
  const isAllowedTime = currentMinutes >= startMinutes && currentMinutes < endMinutes;
  const isHoliday = !!holidayName;

  const open = isAllowedDay && isAllowedTime && !isHoliday;

  return {
    open,
    holiday: holidayName,
    current_day: weekdayStr,
    current_time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    tz,
  };
}

if (process.argv[1] && process.argv[1].endsWith('deploy-window.mjs')) {
  let windowJson = '{"days":[1,2,3,4],"start":"09:00","end":"15:00","tz":"America/Los_Angeles"}';
  let nowIso = new Date().toISOString();

  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--window') windowJson = process.argv[++i];
    if (process.argv[i] === '--now') nowIso = process.argv[++i];
  }

  const config = JSON.parse(windowJson);
  const result = checkDeployWindow(config, nowIso);
  console.log(JSON.stringify(result, null, 2));
}
