/**
 * Safe date formatter that will never throw RangeError: Invalid time value
 */
export function safeFormatDate(
  dateInput?: string | number | Date | null,
  options?: Intl.DateTimeFormatOptions,
  locale = 'ru-RU'
): string {
  if (!dateInput || dateInput === 'undefined' || dateInput === 'null') {
    return '';
  }

  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      return '';
    }
    return d.toLocaleDateString(locale, options);
  } catch {
    return '';
  }
}
