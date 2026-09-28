export const CURRENCY_SYMBOLS = {
  NGN: "₦",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export const CURRENCY_OPTIONS = [
  { value: "NGN", label: "NGN (₦) - Nigerian Naira" },
  { value: "USD", label: "USD ($) - US Dollar" },
  { value: "EUR", label: "EUR (€) - Euro" },
  { value: "GBP", label: "GBP (£) - British Pound" },
];

export function getCurrencySymbol(currency = "NGN") {
  return CURRENCY_SYMBOLS[currency] || currency || "₦";
}

export function formatMoney(amount, currency = "NGN") {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return "—";
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${Number(amount).toLocaleString()}`;
}
