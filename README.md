# `@waynevanson/juse`

An acronym for JSON update stringify emitter.

Listen to events for updating stringified JSON on compatible JavaScript objects.

Only compatible with `JSON.stringify`.

## Usage

```ts
import { createJuse } from "@waynevanson/juse"

const juse = createJuse({
  space: 2,
  onUpdate({ offset, remove, value }) {
    const message =
      `At index ${offset},` +
      `delete ${remove} bytes,` +
      `replacing it with ${value}`

    console.log(message)
  },
})

// this value now console logs when values change
const json = juse({
  firstName: "Sara",
  lastName: "Van Der Haans"
  partner: ["Johannes"],
})

// Happy Valentines day!
// looks like someone's getting a divorce..
delete json.partner[0] // console logs
json.lastName = "Ruiter" // console logs

```
