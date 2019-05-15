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
    expect(emulator.programCounter).toBe(parsedOpcode.nnn + 2);
  });

  test('Ox6', () => {
    const emulator = new Emulator();
    const initialState = _.cloneDeep(emulator);
    const parsedOpcode = parseOpcode(0x6123);
    emulator.executeOpcode(parsedOpcode);

    expect(emulator.vRegister[parsedOpcode.x]).toBe(parsedOpcode.kk);
    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });

  test('0x00EE', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x00ee);
    emulator.stack = [0x200];
    const initialState = _.cloneDeep(emulator);
    emulator.executeOpcode(parsedOpcode);

    expect(emulator.programCounter).toBe(initialState.stack.slice(-1)[0] + 2);
    expect(emulator.stackPointer).toBe(initialState.stackPointer - 1);
  });

  test('0x7xkk', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x7123);
    const initialState = _.cloneDeep(emulator);
    emulator.executeOpcode(parsedOpcode);

    expect(emulator.vRegister[parsedOpcode.x]).toBe(initialState.vRegister[parsedOpcode.x] + parsedOpcode.kk);
    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });

  test('0x3 - if x = kk', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x3123);
    emulator.vRegister[0x1] = 0x23;
    const initialState = _.cloneDeep(emulator);
    emulator.executeOpcode(parsedOpcode);

    expect(emulator.vRegister[parsedOpcode.x]).toBe(parsedOpcode.kk);
    expect(emulator.programCounter).toBe(initialState.programCounter + 4);
  });

  test('0x3 - x != kk', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x3123);
    emulator.vRegister[0x1] = 0x21;
    const initialState = _.cloneDeep(emulator);
    emulator.executeOpcode(parsedOpcode);

    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });

  test('1nnn', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x1234);
    emulator.executeOpcode(parsedOpcode);

    expect(emulator.programCounter).toBe(parsedOpcode.nnn + 2);
  });
});

// 1nnn - JP addr
// Jump to location nnn.

// The interpreter sets the program counter to nnn.
