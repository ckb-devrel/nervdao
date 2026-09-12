function safeStringify(value: object): string | undefined {
  const seen = new WeakSet<object>();

  try {
    return JSON.stringify(value, (_key, item: unknown) => {
      if (typeof item === "bigint") return item.toString();
      if (typeof item !== "object" || item === null) return item;
      if (seen.has(item)) return "[Circular]";
      seen.add(item);
      return item;
    });
  } catch {
    return undefined;
  }
}

function meaningfulString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const message = value.trim();
  return message && message !== "[object Object]" ? message : undefined;
}

function formatErrorValue(
  error: unknown,
  visited: WeakSet<object>,
): string | undefined {
  const directMessage = meaningfulString(error);
  if (directMessage) return directMessage;

  if (
    typeof error === "number" ||
    typeof error === "boolean" ||
    typeof error === "bigint"
  ) {
    return String(error);
  }

  if (typeof error !== "object" || error === null) return undefined;
  if (visited.has(error)) return "[Circular]";
  visited.add(error);

  if (error instanceof Error) {
    const message = meaningfulString(error.message) ?? error.name;
    const cause = formatErrorValue(error.cause, visited);
    return cause && cause !== message ? `${message}: ${cause}` : message;
  }

  const value = error as Record<string, unknown>;
  const message =
    meaningfulString(value.message) ??
    formatErrorValue(value.error, visited) ??
    formatErrorValue(value.reason, visited);
  const code =
    typeof value.code === "string" || typeof value.code === "number"
      ? String(value.code)
      : undefined;
  const data = formatErrorValue(value.data, visited);

  if (message) {
    const codeSuffix = code ? ` (code: ${code})` : "";
    const dataSuffix = data && data !== message ? ` — ${data}` : "";
    return `${message}${codeSuffix}${dataSuffix}`;
  }

  return safeStringify(error);
}

export function formatError(error: unknown): string {
  return formatErrorValue(error, new WeakSet<object>()) ?? "Unknown error";
}
