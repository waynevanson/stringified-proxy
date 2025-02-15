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

test.todo("delete")

test.todo("symbol as property get")
test.todo("symbol as property set")
test.todo("symbol as property delete")

test.todo("get a primitive value")

// middle insertion
test.todo("object multi property")
test.todo("array multi property")
