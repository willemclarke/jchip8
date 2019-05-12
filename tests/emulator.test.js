const { Emulator } = require('../src/emulator.js');
const { parseOpcode } = require('../src/utils.js');
const _ = require('lodash');

describe('executeOpcode', () => {
  test('0xA', () => {
    const emulator = new Emulator();
    const initialState = _.cloneDeep(emulator);
    const parsedOpcode = parseOpcode(0xa2b4);
    emulator.executeOpcode(parsedOpcode);

    expect(emulator.iRegister).toBe(parsedOpcode.nnn);
    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });

  test('Ox2', () => {
    const emulator = new Emulator();
    const initialState = _.cloneDeep(emulator);
    const parsedOpcode = parseOpcode(0x2123);
    emulator.executeOpcode(parsedOpcode);

    expect(emulator.stackPointer).toBe(initialState.stackPointer + 1);
    expect(emulator.stack).toEqual(initialState.stack.concat([initialState.programCounter]));
    expect(emulator.programCounter).toBe(parsedOpcode.nnn);
  });

  // test("Ox6", () => {
  //   const emulator = new Emulator();
  //   const initialState = _.cloneDeep(emulator);
  //   const parsedOpcode = parseOpcode(0x6);
  // });

  test('0x00EE', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x00ee);
    emulator.stack = [0x200];
    const initialState = _.cloneDeep(emulator);
    emulator.executeOpcode(parsedOpcode);

    expect(emulator.programCounter).toBe(initialState.stack.slice(-1)[0] + 2);
    expect(emulator.stackPointer).toBe(initialState.stackPointer - 1);
  });
});
