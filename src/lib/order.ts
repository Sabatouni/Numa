/** Client-side order-reference and tracking-token generation.
 *
 *  Both are generated synchronously (Web Crypto's getRandomValues, no
 *  network round-trip) so they're ready before OrderPanel calls
 *  window.open() for the WhatsApp handoff -- generating either of these via
 *  a database round-trip would mean awaiting that call first, which would
 *  break iOS Safari's popup blocker (it only allows window.open() when it
 *  runs synchronously inside the click that triggered it). See
 *  OrderPanel.tsx for the full sequencing. */

// No 0/O/1/I -- avoids characters that are easy to misread when a customer
// reads their order number aloud or retypes it from a screenshot.
const ORDER_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length: number): string {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (n) => ORDER_CODE_ALPHABET[n % ORDER_CODE_ALPHABET.length]).join("");
}

/** Human-readable order reference, e.g. NUMA-260904-A7F3K2. Not a security
 *  credential -- safe to show in the WhatsApp message, the confirmation
 *  screen, admin, and CSV exports. Uniqueness is enforced by a database
 *  constraint; a collision is astronomically unlikely (32^6 combinations
 *  per day) and simply surfaces as an insert error the UI already handles. */
export function generateOrderNumber(now: Date = new Date()): string {
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `NUMA-${yy}${mm}${dd}-${randomCode(6)}`;
}

/** High-entropy secret (192 bits, hex-encoded) used only for public order
 *  lookup via numa_track_order(). Unguessable by design -- never derive it
 *  from the order number, a sequence, or anything predictable. */
export function generateTrackingToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
