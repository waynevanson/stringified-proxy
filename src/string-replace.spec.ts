import { fc, test } from "@fast-check/vitest"
import { isNonPrimitive, isPrimitive, Json, JsonNonPrimitive } from "./json.js"
import { createJuseStringReplacer } from "./string-replace.js"
import { expect } from "vitest"

function bind<T extends Record<string, any>, K extends string, U>(
  property: Exclude<K, keyof T>,
  kleisli: (previous: T) => fc.Arbitrary<U>
) {
  return (
    previous: T
  ): fc.Arbitrary<{
    [P in keyof T | K]: P extends keyof T ? T[P] : U
  }> => kleisli(previous).map((value) => ({ ...previous, [property]: value }))
}

function apply<T extends Record<string, any>, K extends string, U>(
  property: Exclude<K, keyof T>,
  arbitrary: fc.Arbitrary<U>
) {
  return (
    previous: T
  ): fc.Arbitrary<{
    [P in keyof T | K]: P extends keyof T ? T[P] : U
  }> =>
    //@ts-ignore
    arbitrary.map((result) => ({ ...previous, [property]: result }))
}

const space = fc.integer({ min: 0, max: 20 })

// non empty json objects
const jsonNonEmptyObjects = (constraints?: fc.JsonSharedConstraints) =>
  fc
    .jsonValue(constraints)
    .filter(
      (a) => isNonPrimitive(a as never) && Object.keys(a as never).length > 0
    )

const params = (constraints?: fc.JsonSharedConstraints) =>
  fc.record({
    space,
    input: jsonNonEmptyObjects(constraints) as fc.Arbitrary<Json>,
  })

const targetted = (constraints?: fc.JsonSharedConstraints) =>
  params(constraints).map(({ space, input }) => {
    const input_ = JSON.stringify(input, null, space)

    const stringified = {
      input: input_,
      output: input_,
    }

    const output = createJuseStringReplacer({
      space,
      onUpdate(string) {
        stringified.output = string
      },
    })(input as never) as JsonNonPrimitive

    return {
      space,
      // reference - copy the reference not it's contents.
      stringified,
      object: { input: input as JsonNonPrimitive, output: output },
    }
  })

function createFactory(constraints?: fc.JsonSharedConstraints) {
  return targetted(constraints)
    .chain(
      bind("accessors", ({ object }) => createAccessorsArbitrary(object.input))
    )
    .chain(apply("next", fc.jsonValue(constraints) as fc.Arbitrary<Json>))
    .chain(
      bind("prev", ({ object, accessors }) =>
        fc.constant(accessors.get(object.output))
      )
    )
    .map((params) => {
      params.accessors.set(params.object.output, params.next)
      return params
    })
}

/**
 * @summary
 * Applies a setting operation based on the input.
 */
export function createAccessorsArbitrary<T extends JsonNonPrimitive>(
  target: T
) {
  const paths = getPaths(target)
  const accessors = paths.map((path) => createAccessors(path))
  return fc.constantFrom(...accessors)
}

function createAccessors(path: Array<string>) {
  return {
    get: createGetter(path),
    set: (target: JsonNonPrimitive, value: Json) =>
      createSetter(target, path, value),
  }
}

function createGetter<T extends JsonNonPrimitive>(
  // nonempty
  path: Array<string>
) {
  return (target: T) => {
    // all but last
    const reference = path
      .slice(0, -1)
      .reduce((target, segment) => target[segment as never], target)

    // last
    const segment = path[path.length - 1]
    return reference[segment as never] as Json
  }
}

function createSetter<T extends JsonNonPrimitive>(
  target: T,
  // nonempty
  path: Array<string>,
  value: Json
) {
  // all but last
  const reference = path
    .slice(0, -1)
    .reduce((target, segment) => target[segment as never], target)

  // last
  const segment = path[path.length - 1]
  reference[segment as never] = value as never
}

// breadth first
function getPaths(json: JsonNonPrimitive): Array<Array<string>> {
  const paths: Array<Array<string>> = []

  for (const property in json) {
    paths.push([property])
  }

  for (const property in json) {
    const value = json[property as never] as Json

    if (isPrimitive(value)) {
      continue
    }

    const inners = getPaths(value)

    for (const inner of inners) {
      inner.unshift(property)
    }

    paths.push(...inners)
  }

  return paths
}

test.skip.prop([createFactory()], { timeout: 5000 })("", (params) => {
  expect(params.stringified.output).toEqual(params.stringified.input)
})
