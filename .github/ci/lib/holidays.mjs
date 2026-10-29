/**
 * US Federal Holidays calculation including observed dates.
 * Zero external dependencies.
 */

function getNthDayOfMonth(year, month, dayOfWeek, n) {
  // month: 0-indexed (0 = Jan, 11 = Dec)
  // dayOfWeek: 0 = Sun, 1 = Mon, ..., 6 = Sat
  let count = 0;
  for (let day = 1; day <= 31; day++) {
    const d = new Date(Date.UTC(year, month, day));
    if (d.getUTCMonth() !== month) break;
    if (d.getUTCDay() === dayOfWeek) {
      count++;
      if (count === n) {
        return d;
      }
    }
  }
  return null;
}

function getLastDayOfMonth(year, month, dayOfWeek) {
  let last = null;
  for (let day = 1; day <= 31; day++) {
    const d = new Date(Date.UTC(year, month, day));
    if (d.getUTCMonth() !== month) break;
    if (d.getUTCDay() === dayOfWeek) {
      last = d;
    }
  }
  return last;
}

function adjustObserved(date) {
  // If holiday falls on Saturday, observed on Friday before
  // If holiday falls on Sunday, observed on Monday after
  const day = date.getUTCDay();
  if (day === 6) {
    const observed = new Date(date);
    observed.setUTCDate(date.getUTCDate() - 1);
    return observed;
  } else if (day === 0) {
    const observed = new Date(date);
    observed.setUTCDate(date.getUTCDate() + 1);
    return observed;
  }
  return date;
}

function toYMD(date) {
  return date.toISOString().split('T')[0];
}

export function getFederalHolidays(year) {
  const holidays = new Map();

  // 1. New Year's Day (Jan 1)
  holidays.set(toYMD(adjustObserved(new Date(Date.UTC(year, 0, 1)))), "New Year's Day");

  // 2. MLK Day (3rd Mon in Jan)
  const mlk = getNthDayOfMonth(year, 0, 1, 3);
  if (mlk) holidays.set(toYMD(mlk), 'Martin Luther King Jr. Day');

  // 3. Washington's Birthday (3rd Mon in Feb)
  const wash = getNthDayOfMonth(year, 1, 1, 3);
  if (wash) holidays.set(toYMD(wash), "Washington's Birthday");

  // 4. Memorial Day (last Mon in May)
  const mem = getLastDayOfMonth(year, 4, 1);
  if (mem) holidays.set(toYMD(mem), 'Memorial Day');

  // 5. Juneteenth (June 19)
  holidays.set(toYMD(adjustObserved(new Date(Date.UTC(year, 5, 19)))), 'Juneteenth National Independence Day');

  // 6. Independence Day (July 4)
  holidays.set(toYMD(adjustObserved(new Date(Date.UTC(year, 6, 4)))), 'Independence Day');

  // 7. Labor Day (1st Mon in Sep)
  const labor = getNthDayOfMonth(year, 8, 1, 1);
  if (labor) holidays.set(toYMD(labor), 'Labor Day');

  // 8. Columbus Day (2nd Mon in Oct)
  const col = getNthDayOfMonth(year, 9, 1, 2);
  if (col) holidays.set(toYMD(col), 'Columbus Day');

  // 9. Veterans Day (Nov 11)
  holidays.set(toYMD(adjustObserved(new Date(Date.UTC(year, 10, 11)))), 'Veterans Day');

  // 10. Thanksgiving Day (4th Thu in Nov)
  const thanks = getNthDayOfMonth(year, 10, 4, 4);
  if (thanks) holidays.set(toYMD(thanks), 'Thanksgiving Day');

  // 11. Christmas Day (Dec 25)
  holidays.set(toYMD(adjustObserved(new Date(Date.UTC(year, 11, 25)))), 'Christmas Day');

  return holidays;
}

export function isFederalHoliday(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getUTCFullYear();
  const holidays = getFederalHolidays(year);
  const ymd = toYMD(d);
  return holidays.get(ymd) || null;
}
