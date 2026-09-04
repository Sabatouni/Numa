export function waLink(number: string, text?: string): string {
  const clean = number.replace(/[^0-9]/g, "");
  const base = `https://wa.me/${clean}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

interface OrderMessageInput {
  productName: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPriceLabel: string;
  totalPriceLabel: string;
  orderNumber: string;
  customerName: string;
  customerWhatsapp: string;
  customerMobile: string;
  customerEmail: string;
  trackingUrl: string;
  note?: string;
}

/** Builds the full WhatsApp order-request message: order details, customer
 *  details, status, and a tracking link. No UUIDs, raw JSON, database
 *  internals, or RLS/security details ever go in this text -- the tracking
 *  URL (which embeds the tracking token) is the only "secret" it carries,
 *  and that's by design so the customer can open it. */
export function buildOrderMessage(o: OrderMessageInput): string {
  const lines = [
    "NUMA — ORDER REQUEST",
    "",
    "ORDER",
    "----------------",
    `Product: ${o.productName}`,
    o.size ? `Size: ${o.size}` : null,
    o.color ? `Color: ${o.color}` : null,
    `Quantity: ${o.quantity}`,
    `Unit Price: ${o.unitPriceLabel}`,
    `Total: ${o.totalPriceLabel}`,
    `Order Reference: ${o.orderNumber}`,
    o.note ? `Notes: ${o.note}` : null,
    "",
    "CUSTOMER",
    "----------------",
    `Name: ${o.customerName}`,
    `WhatsApp: ${o.customerWhatsapp}`,
    `Mobile: ${o.customerMobile}`,
    `Email: ${o.customerEmail}`,
    "",
    "ORDER STATUS",
    "----------------",
    "Pending",
    "",
    "TRACK ORDER",
    "----------------",
    o.trackingUrl,
    "",
    "Thank you for ordering from Numa! We'll confirm delivery and payment here in this chat.",
  ].filter((l): l is string => l !== null);
  return lines.join("\n");
}

export function buildReviewMessage(siteName: string): string {
  return `Hello ${siteName}! I would like to leave a review about my order:\n\n`;
}
