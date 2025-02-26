import { describe, test, expect, vi } from "vitest"
import { createJuse } from "./index.js"

describe(createJuse, () => {
  test("objects", () => {
    const onUpdate = vi.fn()
    const wrap = createJuse({ space: 2, onUpdate })

    const input = { name: "Jason Bjorne" }
    const output = wrap(input)

    output.name = "Jean"

    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith({
      offset: 12,
      previous: '"Jason Bjorne"',
      current: '"Jean"',
    })
  })

  test("arrays", () => {
    const onUpdate = vi.fn()
    const wrap = createJuse({ space: 2, onUpdate })

    const input = ["Jason Bjorne"]
    const output = wrap(input)

    output[0] = "Jean"

    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith({
      offset: 4,
      previous: '"Jason Bjorne"',
      current: '"Jean"',
    })
  })

  test("array in array", () => {
    const onUpdate = vi.fn()
    const wrap = createJuse({ space: 2, onUpdate })

    const input = [["Jason Bjorne"]]
    const output = wrap(input)

    output[0][0] = "Jean"

    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith({
      offset: 11,
      previous: '"Jason Bjorne"',
      current: '"Jean"',
    })
  })

  test("object in object", () => {
    const onUpdate = vi.fn()
    const wrap = createJuse({ space: 2, onUpdate })

    const input = {
      big: { booty: "Brucey!" },
    }
    const output = wrap(input)

    output.big.booty = "Marcey!"

    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith({
      offset: 27,
      previous: '"Brucey!"',
      current: '"Marcey!"',
    })
  })

  // middle insertion
  // todo: set, delete
  test("object multi property", () => {
    const onUpdate = vi.fn()
    const wrap = createJuse({ space: 2, onUpdate })

    const input = { hello: "World!", goodbye: "Earth!" }
    const output = wrap(input)

    output.goodbye = "Nature!"

    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith({
      offset: 36,
      previous: '"Earth!"',
      current: '"Nature!"',
    })
  })

  test("array multi property", () => {
    const onUpdate = vi.fn()
    const wrap = createJuse({ space: 2, onUpdate })

    const input = ["hello", "world!"]

    const output = wrap(input)

    output[1] = "earth"

    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith({
      offset: 15,
      previous: '"world!"',
      current: '"earth"',
    })
  })
})

test.todo("delete")

test.todo("symbol as property get")
test.todo("symbol as property set")
test.todo("symbol as property delete")

test.todo("get a primitive value")
