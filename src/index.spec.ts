import { fc, test } from "@fast-check/vitest"
import { createJuse } from "./index.js"
import { expect, vi } from "vitest"
import { isPrimitive } from "./json.js"

// todo. different prev next values
test.skip.prop([fc.string({}), fc.jsonValue(), fc.jsonValue()])(
  "object depth should be good",
  (property, prev, next) => {
    const onUpdate = vi.fn()
    const space = 2
    const stringify = (value: any) => JSON.stringify(value, null, space)
    const constructor = createJuse({ onUpdate, space })

    const offset = 1 + 1 + space + stringify(property).length + 2

    const input = {
      [property]: prev,
    }

    const result = constructor(input)
    expect(onUpdate).not.toHaveBeenCalled()
    result[property] = next

    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith({
      offset,
      remove: stringify(prev).length,
      value: stringify(next),
    })
  }
)

test.skip.prop([fc.jsonValue(), fc.jsonValue()])(
  "array depth should be good",
  (prev, next) => {
    const onUpdate = vi.fn()
    const space = 2
    const stringify = (value: any) => JSON.stringify(value, null, space)
    const constructor = createJuse({ onUpdate, space })

    const offset = 1 + 1 + space

    const input = [prev]

    const result = constructor(input)
    expect(onUpdate).not.toHaveBeenCalled()
    result[0] = next

    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith({
      offset,
      remove: stringify(prev).length,
      value: stringify(next),
    })
  }
)

test.skip.prop([fc.jsonValue().filter((a) => !isPrimitive(a)), fc.jsonValue()])(
  "json string input -> output",
  (prev, next) => {
    const space = 2
    const stringify = (value: any) => JSON.stringify(value, null, space)

    const input = [prev]
    const before = stringify(input)

    let result = before

    const constructor = createJuse({
      space,
      onUpdate({ offset, remove, value }) {
        const left = result.slice(0, offset)
        const middle = value
        const right = result.slice(offset + remove)

        result = left + middle + right
      },
    })

    const json = constructor(input)

    json[0] = next

    const expected = stringify(json)

    expect(result).toStrictEqual(expected)
  }
)
