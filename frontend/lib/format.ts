const currencyFormatter = new Intl.NumberFormat("es-SV", {
  style: "currency",
  currency: "USD",
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

const dateFormatter = new Intl.DateTimeFormat("es-SV", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return dateFormatter.format(new Date(iso));
}
