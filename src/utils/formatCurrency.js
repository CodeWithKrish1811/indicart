/**
 * Central currency formatting utility for Indicart E-Commerce
 * Formats numerical values into Indian Rupee (₹) representation.
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || typeof amount === 'boolean') return '₹0.00';
  const num = Number(amount);
  if (!Number.isFinite(num)) return '₹0.00';
  if (num < 0) {
    return `-₹${Math.abs(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatPriceShort = (amount) => {
  if (amount === null || amount === undefined || typeof amount === 'boolean') return '₹0';
  const num = Number(amount);
  if (!Number.isFinite(num)) return '₹0';
  if (num < 0) {
    return `-₹${Math.round(Math.abs(num)).toLocaleString('en-IN')}`;
  }
  return `₹${Math.round(num).toLocaleString('en-IN')}`;
};
