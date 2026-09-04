/** Lightweight, dependency-free validation for the customer-details step in
 *  OrderPanel. Deliberately loose on phone formatting (spaces, dashes,
 *  parentheses, a leading +) since customers type numbers every which way --
 *  it only rejects things that are clearly not a phone number. */

export function isValidName(value: string): boolean {
  return value.trim().length >= 2;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/[^0-9]/g, "");
  return digits.length >= 9 && digits.length <= 15;
}
