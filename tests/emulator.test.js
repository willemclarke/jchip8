const { Emulator } = require("../src/emulator.js")
const { parseOpcode } = require("../src/utils.js")
const _ = require("lodash");

describe("executeOpcode", () => {
  test("0xA", () => {
    const emulator = new Emulator()
    const initialState = _.cloneDeep(emulator)
    const parsedOpcode = parseOpcode(0xa2b4)
    emulator.executeOpcode(parsedOpcode)
    expect(emulator.iRegister).toBe(parsedOpcode.nnn)
    expect(emulator.programCounter).toBe(initialState.programCounter + 2)
  })
})
