export type JsonPrimitive = string | number | boolean | null

export type JsonArray = Array<Json>

export interface JsonRecord {
  [property: string]: Json
}

export type JsonNonPrimitive = JsonRecord | JsonArray

export type Json = JsonNonPrimitive | JsonPrimitive

export function isPrimitive(json: Json): json is JsonPrimitive {
  return typeof json !== "object" || json === null
}

export function isNonPrimitive(json: Json): json is JsonNonPrimitive {
  return !isPrimitive(json)
}

export function match<T extends Json, U>(
  json: T,
  cases: {
    string(value: string): U
    number(value: number): U
    boolean(value: boolean): U
    null(value: null): U
    object<V extends JsonRecord>(value: V, children: Record<keyof V, U>): U
    array<V extends JsonArray>(value: V, children: { [P in keyof V]: V[P] }): U
  }
): U {
  switch (typeof json) {
    case "boolean":
      return cases.boolean(json)
    case "number":
      return cases.number(json)
    case "string":
      return cases.string(json)
    case "object":
      if (json === null) {
        return cases.null(json)
      }

      if (Array.isArray(json)) {
        const children = json.map((value) => match(value, cases))
        return cases.array(json, children as never)
      }

      const children = {} as Record<keyof T, U>

      for (const property in json) {
        const value = json[property]
        const child = match(value, cases)
        children[property] = child
      }

      return cases.object(json, children)

    default: {
      throw new Error("")
    }
  }
}
