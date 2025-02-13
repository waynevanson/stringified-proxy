import { describe, test, expect, assert } from "vitest"
import { create } from "./index"

describe(create, () => {
  test("objects", () => {
    expect.assertions(1)

    const created = create({ name: "Jason Bjorne" })

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

    const created = create(["Jason Bjorne"])

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

    const created = create([["Jason Bjorne"]])

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

    const created = create({
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

test("object in object string splice", () => {
  expect.assertions(1)

  const item = {
    big: { booty: "Brucey!" },
  }
  const created = create(item)

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
