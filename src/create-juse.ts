import { JsonNonPrimitive, Json } from "./json.js"
import { Context, Payload } from "./types.js"
import { wrapper } from "./juse.js"

export interface Options {
  space: number
  onUpdate(payload: Payload): void
}

export function createContextFromOptions(options: Options): Context {
  const newline = Number(!!options.space) as 0 | 1
  const stringify = (value: Json) => JSON.stringify(value, null, options.space)

  return { ...options, newline, stringify }
}

const state = { depth: 0, offset: 0 }

/**
 * @summary
 * Creates a wrapper with prefilled options for listening to changes that affect JSON values.
 *
 * @param options
 * @returns
 */
export function createWrap(options: Options) {
  return function wrap<T extends JsonNonPrimitive>(json: T): T {
    const context = createContextFromOptions(options)
    return wrapper(json, context, state)
  }
}
