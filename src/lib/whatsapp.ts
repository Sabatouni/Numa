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
  priceLabel: string;
  productUrl: string;
  note?: string;
}

export function buildOrderMessage(o: OrderMessageInput): string {
  const lines = [
    "Hello Numa! I would like to order:",
    "",
    `• Product: ${o.productName}`,
    o.size ? `• Size: ${o.size}` : null,
    o.color ? `• Color: ${o.color}` : null,
    `• Quantity: ${o.quantity}`,
    `• Price: ${o.priceLabel}`,
    `• Link: ${o.productUrl}`,
    o.note ? `• Notes: ${o.note}` : null,
    "",
    "Thank you!",
  ].filter((l): l is string => l !== null);
  return lines.join("\n");
}

export function buildReviewMessage(siteName: string): string {
  return `Hello ${siteName}! I would like to leave a review about my order:\n\n`;
}
