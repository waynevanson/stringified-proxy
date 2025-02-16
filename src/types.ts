import { Json } from "./json.js"

export interface Payload {
  offset: number
  previous: string
  current: string
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
