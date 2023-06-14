import type { CSSProperties } from 'vue'

type StringOrObject<T> = T extends string | number ? string : CSSProperties

export const addCssSuffix = <T extends string | number |  Record<string, string | number | null>>(input: T, suffix = 'px'): StringOrObject<T> => {
  if (typeof input === 'object' && input !== null) {
    return Object.keys(input).reduce((out, key) => {
      if (input[key] || input[key] === 0) {
        out[key] = addCssSuffix(input[key]!, suffix)
      }
      return out
    }, {} as Record<string, string | CSSProperties>) as unknown as StringOrObject<T>
  } else {
    return (input === null || isNaN(Number(input)) ? input.toString() : input + suffix) as StringOrObject<T>
  }
}
