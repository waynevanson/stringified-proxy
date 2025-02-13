import { describe, test, expect, vi } from "vitest"
import { createWrap } from "./index.js"

describe(createWrap, () => {
  test("objects", () => {
    const onUpdate = vi.fn()
    const wrap = createWrap({ space: 2, onUpdate })

    const input = { name: "Jason Bjorne" }
    const output = wrap(input)

    output.name = "Jean"

    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith({
      offset: 12,
      remove: 14,
      value: '"Jean"',
    })
  })

  test("arrays", () => {
    const onUpdate = vi.fn()
    const wrap = createWrap({ space: 2, onUpdate })

    const input = ["Jason Bjorne"]
    const output = wrap(input)

    output[0] = "Jean"

    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith({
      offset: 5,
      remove: 14,
      value: '"Jean"',
    })
  })

  test("array in array", () => {
    const onUpdate = vi.fn()
    const wrap = createWrap({ space: 2, onUpdate })

    const input = [["Jason Bjorne"]]
    const output = wrap(input)

    output[0][0] = "Jean"

    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith({
      offset: 12,
      remove: 14,
      value: '"Jean"',
    })
  })

  test("object in object", () => {
    const onUpdate = vi.fn()
    const wrap = createWrap({ space: 2, onUpdate })

    const input = {
      big: { booty: "Brucey!" },
    }
    const output = wrap(input)

    output.big.booty = "Marcey!"

    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith({
      offset: 26,
      remove: 9,
      value: '"Marcey!"',
    })
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

test.todo("delete")
