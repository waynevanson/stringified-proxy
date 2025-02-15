import { fc, test } from "@fast-check/vitest"
import { createJuse } from "./index.js"
import { expect, vi } from "vitest"

// todo. different prev next values
test.prop([fc.string({}), fc.jsonValue(), fc.jsonValue()])(
  "%s",
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
