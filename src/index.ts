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

function isNonPrimitive(json: Json): json is JsonNonPrimitive {
  return !isPrimitive(json)
}

// [\n\s*\s*
function createArraySpacing(newline: number, space: number, depth: number) {
  return newline + depth * space + space + 2
}

// {\n\s*\s*"property":s
function createRecordSpacing(
  newline: number,
  space: number,
  depth: number,
  property: string
) {
  return newline + depth * space + space + property.length + 5
}

function createObjectSpacing(
  target: JsonNonPrimitive,
  newline: number,
  space: number,
  depth: number,
  property: string
) {
  if (Array.isArray(target)) {
    return createArraySpacing(newline, space, depth)
  } else {
    return createRecordSpacing(newline, space, depth, property)
  }
}

export function factory<T extends JsonNonPrimitive>(
  object: T,
  context: { events: EventTarget; offset: number; depths: number }
): T {
  const newline = 1
  const space = 2

  return new Proxy(object, {
    get(target, property, receiver) {
      if (typeof property !== "string") {
        throw new Error("Expected property to be a string")
      }

      const value = Reflect.get(target, property, receiver) as Json

      if (isPrimitive(value)) {
        return value
      }

      let left = createObjectSpacing(
        target,
        newline,
        space,
        context.depths,
        property
      )

      const result = factory(value, {
        events: context.events,
        offset: context.offset + left,
        depths: context.depths + 1,
      })

      return result
    },
    set(target, property, value) {
      if (typeof property !== "string") {
        throw new Error("Expected property to be a string")
      }

      let left = createObjectSpacing(
        target,
        newline,
        space,
        context.depths,
        property
      )

      const remove = JSON.stringify(
        target[property as never],
        null,
        space
      ).length

      const stringified = JSON.stringify(value, null, space)

      context.events.dispatchEvent(
        new CustomEvent("set", {
          detail: { offset: context.offset + left, remove, stringified },
        })
      )

      return Reflect.set(target, property, value)
    },
  })
}

// assume 2 for space fr now.
export function create<T extends JsonRecord | JsonArray>(
  object: T
): { emitter: EventTarget; target: T } {
  const emitter = new EventTarget()
  const target = factory(object, { events: emitter, offset: 0, depths: 0 })

  return { emitter, target }
}
