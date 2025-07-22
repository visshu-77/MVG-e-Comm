export function formatINR(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0.00';
  return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
} 