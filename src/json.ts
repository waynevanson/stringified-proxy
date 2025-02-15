export type JsonPrimitive = string | number | boolean | null

export type JsonArray = Array<Json>

export interface JsonRecord {
  [property: string]: Json
}

export type JsonNonPrimitive = JsonArray | JsonRecord

export type Json = JsonNonPrimitive | JsonPrimitive

export function isPrimitive(json: Json): json is JsonPrimitive {
  return typeof json !== "object" || json === null
}
