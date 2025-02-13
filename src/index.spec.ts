import { describe, test, expect, vi } from "vitest"
import { createWrap } from "./index"

describe(createWrap, () => {
  test("objects", () => {
    expect.assertions(1)
    const onUpdate = vi.fn()

    const created = createWrap({ name: "Jason Bjorne" }, { space: 2, onUpdate })

    created.emitter.addEventListener("set", (data) => {
      expect(data.detail).toStrictEqual({
        offset: 12,
        remove: 14,
        stringified: '"Jean"',
      })
    })

    created.target.name = "Jean"
  })

  test("arrays", () => {
    expect.assertions(1)

    const created = createWrap(["Jason Bjorne"])

    created.emitter.addEventListener("set", (data) => {
      expect(data.detail).toStrictEqual({
        offset: 5,
        remove: 14,
        stringified: '"Jean"',
      })
    })

    created.target[0] = "Jean"
  })

  test("array in array", () => {
    expect.assertions(1)

    const created = createWrap([["Jason Bjorne"]])

    //[\n  [\n    "
    created.emitter.addEventListener("set", (data) => {
      expect(data.detail).toStrictEqual({
        offset: 12,
        remove: 14,
        stringified: '"Jean"',
      })
    })

    created.target[0][0] = "Jean"
  })

  test("object in object", () => {
    expect.assertions(1)

    const created = createWrap({
      big: { booty: "Brucey!" },
    })

    //{n  "big": {n    "booty":s
    created.emitter.addEventListener("set", (data) => {
      expect(data.detail).toStrictEqual({
        offset: 26,
        remove: 9,
        stringified: '"Marcey!"',
      })
    })

    created.target.big.booty = "Marcey!"
  })
})

test.skip("object in object string splice", () => {
  expect.assertions(1)

  const item = {
    big: { booty: "Brucey!" },
  }
  const created = createWrap(item)

  //{n  "big": {n    "booty":s
  created.emitter.addEventListener("set", (data) => {
    const str = JSON.stringify(item, null, 2).split("")

    str.splice(
      data.detail.offset,
      data.detail.remove,
      ...data.detail.stringified.split("")
    )

    expect(str.join("")).toBe("")
  })

  created.target.big.booty = "Marcey!"
})
