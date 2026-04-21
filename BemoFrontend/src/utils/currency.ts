export const formatCurrency = (
  amount: number | string,
  currency = 'NGN'
): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(num)
}

export const formatNumber = (num: number): string =>
  new Intl.NumberFormat('en-NG').format(num)