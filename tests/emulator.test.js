const { Emulator } = require("../src/emulator.js");
const { parseOpcode } = require("../src/utils.js");
const _ = require("lodash");

describe("executeOpcode", () => {
  test("0x00EE", () => {
    const emulator = new Emulator();
    const initialState = _.cloneDeep(emulator);
    const parsedOpcode = parseOpcode(0x00ee);
    emulator.stack = [0x200];
    emulator.executeOpcode(parsedOpcode);
    expect(emulator.programCounter).toBe(emulator.stack.slice(-1)[0]);
    expect(emulator.stackPointer).toBe((emulator.stackPointer -= 1));
  });
});
