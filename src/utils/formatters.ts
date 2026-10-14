/**
 * Utility functions for currency, percentage, and date formatting
 * customized for Indian Financial Markets (₹ INR)
 */

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatINR(amount: number, showDecimals: boolean = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0.00';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  // Use en-IN locale for Indian numbering system (Lakhs and Crores)
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(absAmount);

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function formatCompactINR(amount: number): string {
  const absAmount = Math.abs(amount);
  const prefix = amount < 0 ? '-' : '';

  if (absAmount >= 10000000) {
    // Crores (1 Cr = 1,00,00,000)
    return `${prefix}₹${(absAmount / 10000000).toFixed(2)} Cr`;
  }
  if (absAmount >= 100000) {
    // Lakhs (1 Lakh = 1,00,000)
    return `${prefix}₹${(absAmount / 100000).toFixed(2)} L`;
  }
  if (absAmount >= 1000) {
    return `${prefix}₹${(absAmount / 1000).toFixed(1)}k`;
  }
  return `${prefix}₹${absAmount.toFixed(2)}`;
}

export function formatPercent(value: number, includeSign: boolean = true): string {
  if (isNaN(value)) return '0.00%';
  const prefix = includeSign && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
}

/**
 * Format timestamp into Asia/Kolkata timezone standard display
 */
export function formatKolkataDateTime(dateInput: Date | number | string): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'N/A';
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(d) + ' IST';
  } catch {
    return 'N/A';
  }
}

/**
 * Format trading date (YYYY-MM-DD) into readable Indian date
 */
export function formatTradingDate(dateStr: string): string {
  try {
    if (!dateStr) return 'N/A';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}
