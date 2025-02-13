export type JsonPrimitive = string | number | boolean | null

export type JsonArray = Array<Json>

export interface JsonRecord {
  [property: string]: Json
}

export type JsonNonPrimitive = JsonArray | JsonRecord

export type Json = JsonNonPrimitive | JsonPrimitive

function isPrimitive(json: Json): json is JsonPrimitive {
  return typeof json !== "object" || json === null
}

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
interface Context {
  events: EventTarget
  newline: 0 | 1
  space: number
}

// recursively provided that changes over time.
interface State {
  offset: number
  depth: number
}

export function factory<T extends JsonNonPrimitive>(
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

      let spacing = createObjectSpacing(target, property, context, state)

      const result = factory(value, context, {
        offset: state.offset + spacing,
        depth: state.depth + 1,
      })

      return result
    },
    set(target, property, value) {
      if (typeof property !== "string") {
        throw new Error("Expected property to be a string")
      }

      let spacing = createObjectSpacing(target, property, context, state)

      const remove = JSON.stringify(
        target[property as never],
        null,
        context.space
      ).length

      const stringified = JSON.stringify(value, null, context.space)

      context.events.dispatchEvent(
        new CustomEvent("set", {
          detail: { offset: state.offset + spacing, remove, stringified },
        })
      )

      return Reflect.set(target, property, value)
    },
  })
}

// assume 2 for space fr now.
export function create<T extends JsonRecord | JsonArray>(
  object: T,
  space: number = 2
): { emitter: EventTarget; target: T } {
  const emitter = new EventTarget()
  const newline = Number(!!space) as 0 | 1
  const target = factory(
    object,
    { events: emitter, newline, space },
    { depth: 0, offset: 0 }
  )

  return { emitter, target }
}
