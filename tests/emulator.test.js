const Emulator = require('../src/emulator.js');
const { parseOpcode } = require('../src/utils.js');
const _ = require('lodash');

describe('00 series opcodes', () => {
  test('00EE', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x00ee);
    emulator.stack = [0x200];
    const initialState = _.cloneDeep(emulator);
    emulator._00EE();

    expect(emulator.programCounter).toBe(initialState.stack.slice(-1)[0] + 2);
    expect(emulator.stackPointer).toBe(initialState.stackPointer - 1);
  });
});

test('1nnn', () => {
  const emulator = new Emulator();
  const parsedOpcode = parseOpcode(0x1234);
  emulator._1nnn(parsedOpcode);

  expect(emulator.programCounter).toBe(parsedOpcode.nnn); //removed + 2 after .nnn
});

test('2nnn', () => {
  const emulator = new Emulator();
  const initialState = _.cloneDeep(emulator);
  const parsedOpcode = parseOpcode(0x2123);
  emulator._2nnn(parsedOpcode);

  expect(emulator.stackPointer).toBe(initialState.stackPointer + 1);
  expect(emulator.stack).toEqual(initialState.stack.concat([initialState.programCounter]));
  expect(emulator.programCounter).toBe(parsedOpcode.nnn); //removed + 2 after .nnn
});

describe('3xkk - Both outcomes', () => {
  test('3xkk - if x = kk', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x3123);
    emulator.vRegister[0x1] = 0x23;
    const initialState = _.cloneDeep(emulator);
    emulator._3xkk(parsedOpcode);

    expect(emulator.programCounter).toBe(initialState.programCounter + 4);
  });

  test('3xkk - if x != kk', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x3123);
    emulator.vRegister[0x1] = 0x21;
    const initialState = _.cloneDeep(emulator);
    emulator._3xkk(parsedOpcode);

    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });
});

describe('4xkk - Both outcomes', () => {
  test('4xkk - if x != kk', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x4123);
    emulator.vRegister[parsedOpcode.x] = 0x4;
    const initialState = _.cloneDeep(emulator);
    emulator._4xkk(parsedOpcode);

    expect(emulator.programCounter).toBe(initialState.programCounter + 4);
  });

  test('4xkk - if x === kk', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x4123);
    emulator.vRegister[parsedOpcode.x] = 0x23;
    const initialState = _.cloneDeep(emulator);
    emulator._4xkk(parsedOpcode);

    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });
});

describe('5xy0 --- Both outcomes', () => {
  test('5xy0 --- Vx === Vy, PC + 4', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x5340);
    emulator.vRegister[parsedOpcode.x] = 0x4;
    emulator.vRegister[parsedOpcode.y] = 0x4;
    const initialState = _.cloneDeep(emulator);
    emulator._5xy0(parsedOpcode);

    expect(emulator.programCounter).toBe(initialState.programCounter + 4);
  });

  test('5xy0 --- Vx != Vy, PC + 2', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x5340);
    emulator.vRegister[parsedOpcode.x] = 0x4;
    emulator.vRegister[parsedOpcode.y] = 0x3;
    const initialState = _.cloneDeep(emulator);
    emulator._5xy0(parsedOpcode);

    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });
});

test('6xkk', () => {
  const emulator = new Emulator();
  const initialState = _.cloneDeep(emulator);
  const parsedOpcode = parseOpcode(0x6123);
  emulator._6xkk(parsedOpcode);

  expect(emulator.vRegister[parsedOpcode.x]).toBe(parsedOpcode.kk);
  expect(emulator.programCounter).toBe(initialState.programCounter + 2);
});

test('7xkk', () => {
  const emulator = new Emulator();
  const parsedOpcode = parseOpcode(0x7123);
  const initialState = _.cloneDeep(emulator);
  emulator._7xkk(parsedOpcode);

  expect(emulator.vRegister[parsedOpcode.x]).toBe(initialState.vRegister[parsedOpcode.x] + parsedOpcode.kk);
  expect(emulator.programCounter).toBe(initialState.programCounter + 2);
});

describe('8 Series Opcodes', () => {
  test('8xy0', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x8120);
    const initialState = _.cloneDeep(emulator);
    emulator._8xy0(parsedOpcode);

    expect(emulator.vRegister[parsedOpcode.x]).toBe(initialState.vRegister[parsedOpcode.y]);
    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });

  test('8xy1', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x8541);
    emulator.vRegister[parsedOpcode.x] = 0x8;
    emulator.vRegister[parsedOpcode.y] = 0x6;
    const initialState = _.cloneDeep(emulator);
    emulator._8xy1(parsedOpcode);

    expect(emulator.vRegister[parsedOpcode.x]).toBe(
      initialState.vRegister[parsedOpcode.x] | initialState.vRegister[parsedOpcode.y],
    );
    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });

  test('8xy2', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x8312);
    emulator.vRegister[parsedOpcode.x] = 0x7;
    emulator.vRegister[parsedOpcode.y] = 0x5;
    const initialState = _.cloneDeep(emulator);
    emulator._8xy2(parsedOpcode);

    expect(emulator.vRegister[parsedOpcode.x]).toBe(
      initialState.vRegister[parsedOpcode.x] & initialState.vRegister[parsedOpcode.y],
    );
    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });

  test('8xy3', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x8673);
    emulator.vRegister[parsedOpcode.x] = 0x7;
    emulator.vRegister[parsedOpcode.y] = 0x5;
    const initialState = _.cloneDeep(emulator);
    emulator._8xy3(parsedOpcode);

    expect(emulator.vRegister[parsedOpcode.x]).toBe(
      initialState.vRegister[parsedOpcode.x] ^ initialState.vRegister[parsedOpcode.y],
    );
    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });

  test('8xy4 --- if > 8 bits VF = 1', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x8674);
    emulator.vRegister[parsedOpcode.x] = 0x80;
    emulator.vRegister[parsedOpcode.y] = 0x80;
    const initialState = _.cloneDeep(emulator);
    emulator._8xy4(parsedOpcode);

    expect(emulator.vRegister[0xf]).toBe(1);
    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });

  test('8xy4 --- if < 8 bits VF = 0', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x8674);
    const initialState = _.cloneDeep(emulator);
    emulator.vRegister[parsedOpcode.x] = 0x7d;
    emulator.vRegister[parsedOpcode.y] = 0x7d;
    emulator._8xy4(parsedOpcode);

    expect(emulator.vRegister[0xf]).toBe(0);
    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });

  test('8xy5 --- if vx > vy VF = 1', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x8675);
    const initialState = _.cloneDeep(emulator);
    emulator.vRegister[parsedOpcode.x] = 0xc8;
    emulator.vRegister[parsedOpcode.y] = 0x7d;
    emulator._8xy5(parsedOpcode);

    expect(emulator.vRegister[0xf]).toBe(1);
    expect(emulator.vRegister[parsedOpcode.x]).toBe(0x4b);
    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });

  test('8xy5 --- if vx < vy VF = 0', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x8675);
    const initialState = _.cloneDeep(emulator);
    emulator.vRegister[parsedOpcode.x] = 0x7d;
    emulator.vRegister[parsedOpcode.y] = 0xc8;
    emulator._8xy5(parsedOpcode);

    expect(emulator.vRegister[0xf]).toBe(0);
    expect(emulator.vRegister[parsedOpcode.x]).toBe(-0x4b);
    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });

  test('8xy6 --- if LSbit === 1, VF = 1', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x8676);
    emulator.vRegister[parsedOpcode.x] = 0x1; // 0x1 & 1 = 1
    const initialState = _.cloneDeep(emulator);
    emulator._8xy6(parsedOpcode);

    expect(emulator.vRegister[0xf]).toBe(0x1);
    expect(emulator.vRegister[parsedOpcode.x]).toBe(initialState.vRegister[parsedOpcode.x] / 2);
    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });

  test('8xy6 --- if LSbit === 0, VF = 0', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x8676);
    emulator.vRegister[parsedOpcode.x] = 0x2; // 0x2 & 1 = 0
    const initialState = _.cloneDeep(emulator);
    emulator._8xy6(parsedOpcode);

    expect(emulator.vRegister[0xf]).toBe(0);
    expect(emulator.vRegister[parsedOpcode.x]).toBe(initialState.vRegister[parsedOpcode.x] / 2);
    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });

  test('8xy7 --- if vy > vx VF = 1', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x8677);
    const initialState = _.cloneDeep(emulator);
    emulator.vRegister[parsedOpcode.y] = 0xc8;
    emulator.vRegister[parsedOpcode.x] = 0x7d;
    emulator._8xy7(parsedOpcode);

    expect(emulator.vRegister[0xf]).toBe(1);
    expect(emulator.vRegister[parsedOpcode.x]).toBe(0x4b);
    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });

  test('8xy7 --- if vy < vx VF = 0', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0x8677);
    const initialState = _.cloneDeep(emulator);
    emulator.vRegister[parsedOpcode.y] = 0x7d;
    emulator.vRegister[parsedOpcode.x] = 0xc8;
    emulator._8xy7(parsedOpcode);

    expect(emulator.vRegister[0xf]).toBe(0);
    expect(emulator.vRegister[parsedOpcode.x]).toBe(-0x4b);
    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });

  describe('9 Series Opcodes', () => {
    test('9xy0 --- if Vx != Vy - PC + 4', () => {
      const emulator = new Emulator();
      const parsedOpcode = parseOpcode(0x9450);
      const initialState = _.cloneDeep(emulator);
      emulator.vRegister[parsedOpcode.x] = 0x1;
      emulator.vRegister[parsedOpcode.y] = 0x3;
      emulator._9xy0(parsedOpcode);

      expect(emulator.programCounter).toBe(initialState.programCounter + 4);
    });

    test('9xy0 --- if Vx === Vy, PC + 2', () => {
      const emulator = new Emulator();
      const parsedOpcode = parseOpcode(0x9450);
      const initialState = _.cloneDeep(emulator);
      emulator.vRegister[parsedOpcode.x] = 0x3;
      emulator.vRegister[parsedOpcode.y] = 0x3;
      emulator._9xy0(parsedOpcode);

      expect(emulator.programCounter).toBe(initialState.programCounter + 2);
    });
  });

  test('Annn', () => {
    const emulator = new Emulator();
    const parsedOpcode = parseOpcode(0xa2b4);
    const initialState = _.cloneDeep(emulator);
    emulator._Annn(parsedOpcode);

    expect(emulator.iRegister).toBe(parsedOpcode.nnn);
    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });

  test('Bnnn', () => {});

  test('Cxkk', () => {
    const emulator = new Emulator();
    const randomNumber = Math.floor(Math.random() * 256);
    const parsedOpcode = parseOpcode(0xc470);
    const initialState = _.cloneDeep(emulator);
    emulator._Cxkk(parsedOpcode, randomNumber);

    expect(emulator.vRegister[parsedOpcode.x]).toBe(randomNumber & parsedOpcode.kk);
    expect(emulator.programCounter).toBe(initialState.programCounter + 2);
  });

  describe('ExA1- both outcomes', () => {
    test('ExA1 - key is not pressed', () => {
      const emulator = new Emulator();
      const parsedOpcode = parseOpcode(0xe2a1);
      emulator.vRegister[parsedOpcode.x] = 0x9;
      const initialState = _.cloneDeep(emulator);
      emulator._ExA1(parsedOpcode);

      expect(emulator.keyInput[emulator.vRegister[parsedOpcode.x]]).toBe(false);
      expect(emulator.programCounter).toBe(initialState.programCounter + 4);
    });

    test('ExA1 - key is pressed', () => {
      const emulator = new Emulator();
      const parsedOpcode = parseOpcode(0xe2a1);
      emulator.vRegister[parsedOpcode.x] = 0x9;
      emulator.keyInput[emulator.vRegister[parsedOpcode.x]] = true;
      const initialState = _.cloneDeep(emulator);
      emulator._ExA1(parsedOpcode);

      expect(emulator.keyInput[emulator.vRegister[parsedOpcode.x]]).toBe(true);
      expect(emulator.programCounter).toBe(initialState.programCounter + 2);
    });
  });

  describe('Ex9E - both outcomes', () => {
    test('Ex9E - key is pressed', () => {
      const emulator = new Emulator();
      const parsedOpcode = parseOpcode(0xe29e);
      emulator.vRegister[parsedOpcode.x] = 0x9;
      emulator.keyInput[emulator.vRegister[parsedOpcode.x]] = true;
      const initialState = _.cloneDeep(emulator);
      emulator._Ex9E(parsedOpcode);

      expect(emulator.keyInput[emulator.vRegister[parsedOpcode.x]]).toBe(true);
      expect(emulator.programCounter).toBe(initialState.programCounter + 4);
    });

    test('Ex9E - key is not pressed', () => {
      const emulator = new Emulator();
      const parsedOpcode = parseOpcode(0xe29e);
      emulator.vRegister[parsedOpcode.x] = 0x9;
      emulator.keyInput[emulator.vRegister[parsedOpcode.x]] = false;
      const initialState = _.cloneDeep(emulator);
      emulator._Ex9E(parsedOpcode);

      expect(emulator.keyInput[emulator.vRegister[parsedOpcode.x]]).toBe(false);
      expect(emulator.programCounter).toBe(initialState.programCounter + 2);
    });
  });

  describe('F series opcodes', () => {
    test('Fx07', () => {
      const emulator = new Emulator();
      const parsedOpcode = parseOpcode(0xf207);
      const initialState = _.cloneDeep(emulator);
      emulator._Fx07(parsedOpcode);

      expect(emulator.vRegister[parsedOpcode.x]).toBe(emulator.delayTimer);
      expect(emulator.programCounter).toBe(initialState.programCounter + 2);
    });

    test('fx15', () => {
      const emulator = new Emulator();
      const parsedOpcode = parseOpcode(0xf015);
      emulator.vRegister[parsedOpcode.x] = 0x5;
      const initialState = _.cloneDeep(emulator);
      emulator._Fx15(parsedOpcode);

      expect(emulator.delayTimer).toBe(initialState.vRegister[parsedOpcode.x]);
      expect(emulator.programCounter).toBe((initialState.programCounter += 2));
    });

    test('fx18', () => {
      const emulator = new Emulator();
      const parsedOpcode = parseOpcode(0xf218);
      emulator.vRegister[parsedOpcode.x] = 0x5;
      const initialState = _.cloneDeep(emulator);
      emulator._Fx18(parsedOpcode);

      expect(emulator.soundTimer).toBe(initialState.vRegister[parsedOpcode.x]);
      expect(emulator.programCounter).toBe(initialState.programCounter + 2);
    });

    test('Fx1E', () => {
      const emulator = new Emulator();
      const parsedOpcode = parseOpcode(0xf21e);
      emulator.vRegister[parsedOpcode.x] = 0x2;
      const initialState = _.cloneDeep(emulator);
      emulator._Fx1E(parsedOpcode);

      expect(emulator.iRegister).toBe(initialState.iRegister + emulator.vRegister[parsedOpcode.x]);
      expect(emulator.programCounter).toBe(initialState.programCounter + 2);
    });

    test('Fx33', () => {
      const emulator = new Emulator();
      const parsedOpcode = parseOpcode(0xf133);
      emulator.vRegister[parsedOpcode.x] = 0x200;
      const initialState = _.cloneDeep(emulator);
      emulator._Fx33(parsedOpcode);

      expect(emulator.memory[emulator.iRegister]).toBe(5);
      expect(emulator.memory[emulator.iRegister + 1]).toBe(1);
      expect(emulator.memory[emulator.iRegister + 2]).toBe(2);
      expect(emulator.programCounter).toBe(initialState.programCounter + 2);
    });
  });

  // test('8xyE --- if MSb of vx === 1, VF = 1', () => {
  //   const emulator = new Emulator();
  //   const parsedOpcode = parseOpcode(0x867e);
  //   const initialState = _.cloneDeep(emulator);
  //   emulator._8xyE(parsedOpcode);

  //   expect().toBe();
  //   expect().toBe();
  //   expect().toBe();
  // });

  // test('8xyE --- if MSb of vx === 0, VF = 0', () => {
  //   const emulator = new Emulator();
  //   const parsedOpcode = parseOpcode(0x867e);
  //   const initialState = _.cloneDeep(emulator);
  //   emulator._8xyE(parsedOpcode);

  //   expect().toBe();
  //   expect().toBe();
  //   expect().toBe();
  // });
});

/*
Dxyn - DRW Vx, Vy, nibble
Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision.

The interpreter reads n bytes from memory, starting at the address stored in I. These bytes are then displayed as sprites on screen at coordinates (Vx, Vy). Sprites are XORed onto the existing screen. If this causes any pixels to be erased, VF is set to 1, otherwise it is set to 0. If the sprite is positioned so part of it is outside the coordinates of the display, it wraps around to the opposite side of the screen. See instruction 8xy3 for more information on XOR, and section 2.4, Display, for more information on the Chip-8 screen and sprites.

*/

// test('dxyn', () => {
//   const emulator = new Emulator();
//   const parsedOpcode = parseOpcode(0xd123);
//   emulator.iRegister = 0x200;
//   emulator.memory = [...Array(0x200).fill(0x0), Array(parsedOpcode.n).fill(0x1)];
//   emulator.vRegister[parsedOpcode.x] = 0x6;
//   emulator.vRegister[parsedOpcode.y] = 0x7;
//   const initialState = _.cloneDeep(emulator);
//   emulator._Dxyn(parsedOpcode);

//   expect(emulator.screen[6][7]).toBe(1);
// });

//XOR
// Performs a bitwise exclusive OR on the values of Vx and Vy, then stores the result in Vx. An exclusive OR compares the corrseponding bits from two values, and if the bits are not both the same, then the corresponding bit in the result is set to 1. Otherwise, it is 0.
