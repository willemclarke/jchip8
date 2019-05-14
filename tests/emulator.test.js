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
    console.log(initialState.vRegister[parsedOpcode.x]);
    console.log(parsedOpcode.kk);
    console.log(emulator.vRegister[parsedOpcode.x]);
    expect(emulator.vRegister[parsedOpcode.x]).toBe(initialState.vRegister[parsedOpcode.x] + parsedOpcode.kk);
    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });
});

//7xkk - ADD Vx, byte
// Set Vx = Vx + kk.
// Adds the value kk to the value of register Vx, then stores the result in Vx.
