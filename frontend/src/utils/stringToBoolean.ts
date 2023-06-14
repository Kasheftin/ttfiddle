import { safeJsonParse } from "./safeJsonParse"

export const stringToBoolean = (value: string | number) => {
  return !!(value && safeJsonParse(value.toString(), false))
}
