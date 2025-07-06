/**
 * Date utility functions
 */

/**
 * Convert a Date object to an ISO string without milliseconds
 */
export function dateToISOString(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Convert a Date object to a formatted date string
 */
export function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * Calculate the difference between two dates in a human-readable format
 */
export function getDateDiff(
  startDate: Date,
  endDate: Date = new Date(),
): string {
  const diffMs = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(
    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}${
      diffHours > 0 ? `, ${diffHours} hour${diffHours !== 1 ? 's' : ''}` : ''
    }`;
  }

  if (diffHours > 0) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}${
      diffMinutes > 0
        ? `, ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`
        : ''
    }`;
  }

  return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
}

/**
 * Add a specified amount of time to a date
 */
export function addToDate(
  date: Date,
  amount: number,
  unit: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds',
): Date {
  const result = new Date(date);

  switch (unit) {
    case 'years':
      result.setFullYear(result.getFullYear() + amount);
      break;
    case 'months':
      result.setMonth(result.getMonth() + amount);
      break;
    case 'days':
      result.setDate(result.getDate() + amount);
      break;
    case 'hours':
      result.setHours(result.getHours() + amount);
      break;
    case 'minutes':
      result.setMinutes(result.getMinutes() + amount);
      break;
    case 'seconds':
      result.setSeconds(result.getSeconds() + amount);
      break;
  }

  return result;
}
