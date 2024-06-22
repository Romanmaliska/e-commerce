const CURRENCY_FORMATER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  minimumFractionDigits: 0,
});

export function formatCurrency(amount: number) {
  return CURRENCY_FORMATER.format(amount);
}

const NUMBER_FORMATER = new Intl.NumberFormat("en-US");

export function formatNumber(amount: number) {
  return NUMBER_FORMATER.format(amount);
}
