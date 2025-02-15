import { JsonNonPrimitive } from "./json.js"
import { Context, State } from "./types.js"

// [\n\s*\s*
export function createArraySpacing(
  context: Pick<Context, "newline" | "space">,
  state: Pick<State, "depth">
) {
  return context.newline + state.depth * context.space + context.space + 2
}

// {\n\s*\s*"property":s
export function createRecordSpacing(
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

export function createObjectSpacing(
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
