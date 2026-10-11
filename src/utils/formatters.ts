/**
 * Utility functions for formatting Indian currency (₹), numbers, and metrics
 */

export function formatINR(value: number, options?: { hideSymbol?: boolean; compact?: boolean }): string {
  if (isNaN(value)) return '₹0';
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const prefix = options?.hideSymbol ? '' : '₹';

  if (options?.compact && absValue >= 10000000) {
    return `${sign}${prefix}${(absValue / 10000000).toFixed(2)} Cr`;
  }
  if (options?.compact && absValue >= 100000) {
    return `${sign}${prefix}${(absValue / 100000).toFixed(2)} Lakh`;
  }

  // Standard Indian currency grouping (e.g. 1,23,456)
  const formatted = Math.round(absValue).toLocaleString('en-IN');
  return `${sign}${prefix}${formatted}`;
}

export function formatNumber(value: number): string {
  if (isNaN(value)) return '0';
  return Math.round(value).toLocaleString('en-IN');
}

export function formatDecimal(value: number, decimals = 2): string {
  if (isNaN(value)) return '0.00';
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
