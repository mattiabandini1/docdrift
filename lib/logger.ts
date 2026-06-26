export type LogLevel = "info" | "warn" | "error";

export function log(
  level: LogLevel,
  context: string,
  message: string,
  meta?: Record<string, unknown>
): void {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    context,
    message,
    ...meta,
  });

  if (level === "error") {
    console.error(entry);
  } else if (level === "warn") {
    console.warn(entry);
  } else {
    console.log(entry);
  }
}
