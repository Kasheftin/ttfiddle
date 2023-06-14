export function safeJsonParse<T>(input: string, defaultValue: T): T {
  try {
    if (!input) {
      return defaultValue
    }
    return JSON.parse(input) || defaultValue
  } catch (error: any) {
    return defaultValue
  }
}
