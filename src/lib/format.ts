export function money(amount: number, symbol = "TSh"): string {
  return `${symbol} ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount)}`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

/** Customer-facing label for an order status. The database/admin keep the
 *  internal values (new/contacted/completed/cancelled) unchanged -- this is
 *  purely a display translation for the confirmation screen and the public
 *  tracking page. */
const ORDER_STATUS_LABELS: Record<string, string> = {
  new: "Pending",
  contacted: "Contacted",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}
