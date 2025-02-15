import { JsonArray, JsonNonPrimitive, JsonRecord } from "./json.js"
import { Context, State } from "./types.js"

// [\n\s*\s*
export function createArraySpacing(
  target: JsonArray,
  property: string,
  context: Pick<Context, "newline" | "space" | "stringify">,
  state: Pick<State, "depth">
) {
  const index = Number(property)
  const count = index + 1

  // end of each property
  const commas = index

  const values = Object.values(target)
    .slice(0, index)
    .map((json) => context.stringify(json).length)
    .reduce((left, right) => left + right, 0)

  const prefix = context.newline + (state.depth + 1) * context.space
  const prefixes = count * prefix
  const left = 1

  return left + values + commas + prefixes
}

// {\n\s*\s*"property":s
export function createRecordSpacing(
  target: JsonRecord,
  property: string,
  context: Pick<Context, "newline" | "space" | "stringify">,
  state: Pick<State, "depth">
) {
  const index = Object.keys(target).indexOf(property)
  const count = index + 1

  const properties = Object.keys(target)
    .slice(0, count)
    .map((property) => property.length + 2)
    .reduce((left, right) => left + right, 0)

  // end of each property
  const commas = index
  // before each property value
  const colons = count
  // before each property value
  const spaces = count

  const values = Object.values(target)
    .slice(0, index)
    .map((json) => context.stringify(json).length)
    .reduce((left, right) => left + right, 0)

  const prefix = context.newline + (state.depth + 1) * context.space
  const prefixes = count * prefix
  const left = 1

  return left + properties + values + commas + colons + spaces + prefixes
}

export function createObjectSpacing(
  target: JsonNonPrimitive,
  property: string,
  context: Pick<Context, "newline" | "space" | "stringify">,
  state: Pick<State, "depth">
) {
  if (Array.isArray(target)) {
    return createArraySpacing(target as JsonArray, property, context, state)
  } else {
    return createRecordSpacing(target as JsonRecord, property, context, state)
  }
}
