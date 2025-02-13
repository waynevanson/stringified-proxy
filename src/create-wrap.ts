import { JsonNonPrimitive, Json } from "./types"
import { Context, Payload, wrapper } from "./wrapper"

export interface Options {
  space: number
  onUpdate(payload: Payload): void
}

export function createContext(options: Options): Context {
  const newline = Number(!!options.space) as 0 | 1
  const stringify = (value: Json) => JSON.stringify(value, null, options.space)

  return { ...options, newline, stringify }
}

const state = { depth: 0, offset: 0 }

export function createWrap(options: Options) {
  return function wrap<T extends JsonNonPrimitive>(json: T): T {
    const context = createContext(options)
    return wrapper(json, context, state)
  }
}
