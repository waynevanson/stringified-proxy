export type JsonPrimitive = string | number | boolean | null

export type JsonArray = ReadonlyArray<Json>

export interface JsonRecord {
  readonly [property: string]: Json
}

export type JsonNonPrimitive = JsonArray | JsonRecord

export type Json = JsonNonPrimitive | JsonPrimitive

export function isPrimitive(json: Json): json is JsonPrimitive {
  return typeof json !== "object" || json === null
}
