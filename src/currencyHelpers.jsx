import { DollarSign, Euro, PoundSterling } from "lucide-react";

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

export function NairaSign({ className, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M6 4v16" />
      <path d="M18 4v16" />
      <path d="M6 4l12 16" />
      <path d="M4 10h16" />
      <path d="M4 14h16" />
    </svg>
  );
}

export function getCurrencyIcon(currency = "NGN") {
  switch (currency) {
    case "USD":
      return DollarSign;
    case "EUR":
      return Euro;
    case "GBP":
      return PoundSterling;
    case "NGN":
    default:
      return NairaSign;
  }
}
