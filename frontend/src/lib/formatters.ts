/**
 * Formats a numeric value as Nigerian Naira currency (₦)
 */
export function formatNaira(
  amount: number | string | null | undefined,
  showDecimals = false,
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₦0';
  }

  const num = Number(amount);
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  })
    .format(num)
    .replace('NGN', '₦');
}

/**
 * Format numbers with comma separation
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(val: number): string {
  return `${val.toFixed(1)}%`;
}

/**
 * Month names lookup
 */
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1] || 'Unknown';
}
