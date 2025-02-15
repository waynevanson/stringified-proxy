export type JsonPrimitive = string | number | boolean | null

export type JsonArray = ReadonlyArray<Json> | Array<Json>

export type JsonRecord = {
  [Property in string]?: Json
}

export type JsonNonPrimitive = JsonArray | JsonRecord

export type Json = JsonNonPrimitive | JsonPrimitive

export function isPrimitive(json: Json): json is JsonPrimitive {
  return typeof json !== "object" || json === null
}
