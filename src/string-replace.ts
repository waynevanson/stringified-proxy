import { createContextFromOptions, createJuse } from "./create-juse.js"
import { JsonNonPrimitive } from "./json.js"
import { juser } from "./juser.js"

export interface CreateJuseStringReplacerOptions {
  space: number
  onUpdate(string: string): void
}

export function createJuseStringReplacer(
  options: CreateJuseStringReplacerOptions
): <T extends JsonNonPrimitive>(json: T) => T {
  return function juseString(json) {
    let result = ""

    const context = createContextFromOptions({
      space: options.space,
      onUpdate({ offset, previous, current }) {
        const left = result.slice(0, offset)
        const middle = current
        const right = result.slice(offset + previous.length)

        result = left + middle + right
        options.onUpdate(result)
      },
    })

    result = context.stringify(json)

    return juser(json, context, { depth: 0, offset: 0 })
  }
}
