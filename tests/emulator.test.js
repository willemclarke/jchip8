const { Emulator } = require('../src/emulator.js');
const { parseOpcode } = require('../src/utils.js');
const _ = require('lodash');

test('0xAnnn', () => {
  const emulator = new Emulator();
  const parsedOpcode = parseOpcode(0xa2b4);
  const initialState = _.cloneDeep(emulator);
  emulator._Annn(parsedOpcode);

  expect(emulator.iRegister).toBe(parsedOpcode.nnn);
  expect(emulator.programCounter).toBe(initialState.programCounter + 2);
});

test('Ox2nnn', () => {
  const emulator = new Emulator();
  const initialState = _.cloneDeep(emulator);
  const parsedOpcode = parseOpcode(0x2123);
  emulator._2nnn(parsedOpcode);

  expect(emulator.stackPointer).toBe(initialState.stackPointer + 1);
  expect(emulator.stack).toEqual(initialState.stack.concat([initialState.programCounter]));
  expect(emulator.programCounter).toBe(parsedOpcode.nnn); //removed + 2 after .nnn
});

test('Ox6xkk', () => {
  const emulator = new Emulator();
  const initialState = _.cloneDeep(emulator);
  const parsedOpcode = parseOpcode(0x6123);
  emulator._6xkk(parsedOpcode);

  expect(emulator.vRegister[parsedOpcode.x]).toBe(parsedOpcode.kk);
  expect(emulator.programCounter).toBe(initialState.programCounter + 2);
});

test('0x00EE', () => {
  const emulator = new Emulator();
  const parsedOpcode = parseOpcode(0x00ee);
  emulator.stack = [0x200];
  const initialState = _.cloneDeep(emulator);
  emulator._00EE();

  expect(emulator.programCounter).toBe(initialState.stack.slice(-1)[0] + 2);
  expect(emulator.stackPointer).toBe(initialState.stackPointer - 1);
});

test('0x7xkk', () => {
  const emulator = new Emulator();
  const parsedOpcode = parseOpcode(0x7123);
  const initialState = _.cloneDeep(emulator);
  emulator._7xkk(parsedOpcode);

  expect(emulator.vRegister[parsedOpcode.x]).toBe(initialState.vRegister[parsedOpcode.x] + parsedOpcode.kk);
  expect(emulator.programCounter).toBe(initialState.programCounter + 2);
});

test('0x3xkk - if x = kk', () => {
  const emulator = new Emulator();
  const parsedOpcode = parseOpcode(0x3123);
  emulator.vRegister[0x1] = 0x23;
  const initialState = _.cloneDeep(emulator);
  emulator._3xkk(parsedOpcode);

  expect(emulator.programCounter).toBe(initialState.programCounter + 4);
});

test('0x3xkk - if x != kk', () => {
  const emulator = new Emulator();
  const parsedOpcode = parseOpcode(0x3123);
  emulator.vRegister[0x1] = 0x21;
  const initialState = _.cloneDeep(emulator);
  emulator._3xkk(parsedOpcode);

  expect(emulator.programCounter).toBe(initialState.programCounter + 2);
});

test('1nnn', () => {
  const emulator = new Emulator();
  const parsedOpcode = parseOpcode(0x1234);
  emulator._1nnn(parsedOpcode);

  expect(emulator.programCounter).toBe(parsedOpcode.nnn); //removed + 2 after .nnn
});

test('Cxkk', () => {
  const emulator = new Emulator();
  const randomNumber = Math.floor(Math.random() * 256);
  const parsedOpcode = parseOpcode(0xc470);
  const initialState = _.cloneDeep(emulator);
  emulator._Cxkk(parsedOpcode, randomNumber);

  expect(emulator.vRegister[parsedOpcode.x]).toBe(randomNumber & parsedOpcode.kk);
  expect(emulator.programCounter).toBe(initialState.programCounter + 2);
});

// Fx33 - LD B, Vx
// Store BCD representation of Vx in memory locations I, I+1, and I+2.

// The interpreter takes the decimal value of Vx, and places the hundreds digit in memory at location in I,
// the tens digit at location I+1, and the ones digit at location I+2.
