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
        throw new Error("Expected property to be a string")
      }

      const value = Reflect.get(target, property, receiver) as Json

      if (isPrimitive(value)) {
        return value
      }

      const spacing = createObjectSpacing(target, property, context, state)
      const offset = state.offset + spacing
      const depth = state.depth + 1
      state = { offset, depth }

      return juser(value, context, state)
    },
    set(target, property, value) {
      if (typeof property !== "string") {
        throw new Error("Expected property to be a string")
      }

      const remove = context.stringify(target[property as never]).length

      const spacing = createObjectSpacing(target, property, context, state)
      const stringified = context.stringify(value)
      const offset = state.offset + spacing
      const payload = { offset, remove, value: stringified }

      context.onUpdate(payload)

      return Reflect.set(target, property, value)
    },
    deleteProperty(target, property) {
      if (typeof property !== "string") {
        throw new Error("Expected property to be a string")
      }

      const remove = context.stringify(target[property as never]).length

      context.onUpdate({ offset: state.offset, remove, value: "" })

      return Reflect.deleteProperty(target, property)
    },
  })
}
