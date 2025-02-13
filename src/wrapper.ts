import { isPrimitive, Json, JsonNonPrimitive } from "./types"

// [\n\s*\s*
function createArraySpacing(
  context: Pick<Context, "newline" | "space">,
  state: Pick<State, "depth">
) {
  return context.newline + state.depth * context.space + context.space + 2
}

// {\n\s*\s*"property":s
function createRecordSpacing(
  property: string,
  context: Pick<Context, "newline" | "space">,
  state: Pick<State, "depth">
) {
  return (
    context.newline +
    state.depth * context.space +
    context.space +
    property.length +
    5
  )
}

/**
 * @todo Conside how many lines we need to traverse.
 */
function createObjectSpacing(
  target: JsonNonPrimitive,
  property: string,
  context: Pick<Context, "newline" | "space">,
  state: Pick<State, "depth">
) {
  if (Array.isArray(target)) {
    return createArraySpacing(context, state)
  } else {
    return createRecordSpacing(property, context, state)
  }
}

// recursivley called that doesn't change over time.
export interface Context {
  onUpdate(payload: Payload): void
  newline: 0 | 1
  space: number
  stringify(value: Json): string
}

// recursively provided that changes over time.
export interface State {
  offset: number
  depth: number
}

export interface Payload {
  offset: number
  remove: number
  value: string
}

export function wrapper<T extends JsonNonPrimitive>(
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

      return wrapper(value, context, state)
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
