import { isPrimitive, Json, JsonNonPrimitive } from "./json.js"
import { createObjectSpacing } from "./spacing.js"
import { Context, State } from "./types.js"

export function juser<T extends JsonNonPrimitive>(
  object: T,
  context: Context,
  state: State
): T {
  return new Proxy(object, {
    get(target, property, receiver) {
      if (typeof property !== "string") {
        return Reflect.get(target, property, receiver)
      }

      const value = Reflect.get(target, property, receiver) as Json

      if (isPrimitive(value)) {
        return value
      }

      const spacing = createObjectSpacing(target, property, context, state)
      const offset = state.offset + spacing + 1
      const depth = state.depth + 1
      state = { offset, depth }

      return juser(value, context, state)
    },
    set(target, property, value) {
      if (typeof property !== "string") {
        throw new Error("Expected property to be a string")
      }

      // what happens when we go deeper?
      // json stringify doesn't account for being in a really deep object
      const previous = context
        .stringify(target[property as never])
        .replaceAll(/\n/g, "\n".padEnd(state.depth * context.space + 1, " "))

      // \n that are not in ""; \n out of ""

      const spacing = createObjectSpacing(target, property, context, state)
      const stringified = context.stringify(value)
      const offset = state.offset + spacing
      const payload = { offset, previous, current: stringified }

      context.onUpdate(payload)

      return Reflect.set(target, property, value)
    },
    deleteProperty(target, property) {
      if (typeof property !== "string") {
        throw new Error("Expected property to be a string")
      }

      const previous = context
        .stringify(target[property as never])
        .replaceAll(/\n/g, "\n".padEnd(state.depth * context.space + 1, " "))

      context.onUpdate({ offset: state.offset, previous, current: "" })

      return Reflect.deleteProperty(target, property)
    },
  })
}
