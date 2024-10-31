import {
  CKB,
  
} from "@ickb/lumos-utils";
export function truncateString(str: string, frontChars: number, endChars: number): string {
  if (str.length <= frontChars + endChars) {
    return str;
  }
  return `${str.slice(0, frontChars)}...${str.slice(-endChars)}`;
}

export function truncateAddress(address: string, frontChars: number = 6, endChars: number = 4): string {
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

export function toBigInt(text: string) {
  const [decimal, ...fractionals] = text.split(".");
  return BigInt(
    (decimal ?? "0") + ((fractionals ?? []).join("") + "00000000").slice(0, 8),
  );
}
