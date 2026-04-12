/**
 * Human-readable label maps for enum values used across the UI.
 * Centralised here to avoid duplication in individual components.
 */

export const currencyLabels: Record<string, string> = {
  GBP: "British Pound (£)",
  USD: "US Dollar ($)",
  EUR: "Euro (€)",
  CAD: "Canadian Dollar (CA$)",
  AUD: "Australian Dollar (A$)",
};

export const recurringPatternLabels: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  monthly: "Monthly",
  yearly: "Yearly",
};
