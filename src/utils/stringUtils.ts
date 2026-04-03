import {
  CKB,
  
} from "@ickb/lumos-utils";
export function truncateString(str: string, frontChars: number, endChars: number): string {
  if (str.length <= frontChars + endChars) {
    return str;
  }
  return `${str.slice(0, frontChars)}...${str.slice(-endChars)}`;
}

export function truncateAddress(address: string, frontChars = 6, endChars = 4): string {
  return truncateString(address, frontChars, endChars);
}

export function formatBalance(balanceStr: string): string {
  const number = parseFloat(balanceStr);
  if (isNaN(number)) {
    return '0.00';
  }
  return number.toFixed(2);
}
export function toText(n: bigint) {
  return String(n / CKB) + String(Number(n % CKB) / Number(CKB)).slice(1);
}

/**
 * Sanitize a numeric string input for amount fields.
 * - Only allows digits and a single decimal point
 * - Strips leading zeros (e.g. "011" → "11", keeps "0.x")
 * - Limits decimal places to maxDecimals (default 8)
 */
export function sanitizeNumericInput(raw: string, maxDecimals = 8): string {
  let value = raw.replace(/[^0-9.]/g, "");

  const parts = value.split(".");
  if (parts.length > 2) {
    value = parts[0] + "." + parts.slice(1).join("");
  }

  if (parts[0].length > 1 && parts[0].startsWith("0")) {
    parts[0] = parts[0].replace(/^0+/, "") || "0";
    value = parts.length === 2 ? parts[0] + "." + parts[1] : parts[0];
  }

  if (parts.length === 2 && parts[1].length > maxDecimals) {
    value = parts[0] + "." + parts[1].slice(0, maxDecimals);
  }

  // "." → "0.", ".5" → "0.5"
  if (value.startsWith(".")) {
    value = "0" + value;
  }

  return value;
}

export function toBigInt(text: string) {
  const [decimal, ...fractionals] = text.split(".");
  return BigInt(
    (decimal ?? "0") + ((fractionals ?? []).join("") + "00000000").slice(0, 8),
  );
}
