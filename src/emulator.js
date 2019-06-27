const _ = require('lodash');
const fs = require('fs');
const { parseOpcode } = require('./utils');

class Emulator {
  constructor() {
    this.reset();
  }

  reset() {
    this.memory = [];
    this.programCounter = 0x200;
    this.stackPointer = 0;
    this.stack = [];
    this.vRegister = Array(0xf).fill(0);
    this.iRegister = 0;
    this.soundTimer = 0;
    this.delayTimer = 0;
    this.keyInput = {
      0: false,
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
      7: false,
      8: false,
      9: false,
      A: false,
      B: false,
      C: false,
      D: false,
      E: false,
      F: false,
    };
    this.scale = 10;
    this.width = 64;
    this.height = 32;
    this.screen = [...Array(this.width)].map((e) => Array(this.height).fill(0));
  }

  loadRom(rom) {
    this.memory = Array(0x200)
      .fill(0x0)
      .concat(Array.from(rom));
  }

  run() {
    const rawOpcode = (this.memory[this.programCounter] << 8) | this.memory[this.programCounter + 1];
    const parsedOpcode = parseOpcode(rawOpcode);
    this.trace(parsedOpcode);
    this.executeOpcode(parsedOpcode);
  }

  trace(parsedOpcode) {
    const stack = _.map(this.stack, (value) => value.toString(16));
    const vRegister = _.map(this.vRegister, (value) => value.toString(16));
    console.log(
      `Opcode: ${parsedOpcode.pretty}`,
      `PC: ${this.programCounter.toString(16)}`,
      `iRegister: ${this.iRegister.toString(16)}`,
      `vRegister: [${vRegister}]`,
      `stackPointer: ${this.stackPointer.toString(16)}`,
      `stack: [${stack}] soundT: ${this.soundTimer.toString(16)}`,
      `delayT: ${this.delayTimer.toString(16)}`,
    );
  }
  _00E0() {
    for (let x = 0; x < this.screen.length; x++) {
      for (let y = 0; y < this.screen.length; y++) {
        this.screen[x][y] = 0;
      }
    }
    this.programCounter += 2;
  }

  _00EE() {
    this.programCounter = this.stack.pop() + 2;
    this.stackPointer -= 1;
  }

  _1nnn(parsedOpcode) {
    this.programCounter = parsedOpcode.nnn; // testing without + 2 after parsedOpcode.nnn
  }

  _2nnn(parsedOpcode) {
    this.stackPointer += 1;
    this.stack.push(this.programCounter);
    this.programCounter = parsedOpcode.nnn; // testing without + 2 after parsedOpcode.nnn
  }

  _3xkk(parsedOpcode) {
    if (this.vRegister[parsedOpcode.x] === parsedOpcode.kk) {
      this.programCounter += 4;
    } else {
      this.programCounter += 2;
    }
  }

  _4xkk(parsedOpcode) {
    if (this.vRegister[parsedOpcode.x] != parsedOpcode.kk) {
      this.programCounter += 4;
    } else {
      this.programCounter += 2;
    }
  }

  _5xy0(parsedOpcode) {}

  _6xkk(parsedOpcode) {
    this.vRegister[parsedOpcode.x] = parsedOpcode.kk;
    this.programCounter += 2;
  }

  _7xkk(parsedOpcode) {
    this.vRegister[parsedOpcode.x] = (this.vRegister[parsedOpcode.x] + parsedOpcode.kk) & 0xff;
    this.programCounter += 2;
  }

  _8xy0(parsedOpcode) {
    this.vRegister[parsedOpcode.x] = this.vRegister[parsedOpcode.y];
    this.programCounter += 2;
  }

  _8xy1(parsedOpcode) {
    this.vRegister[parsedOpcode.x] |= this.vRegister[parsedOpcode.y];
    this.programCounter += 2;
  }

  _8xy2(parsedOpcode) {
    this.vRegister[parsedOpcode.x] &= this.vRegister[parsedOpcode.y];
    this.programCounter += 2;
  }

  _8xy3(parsedOpcode) {
    this.vRegister[parsedOpcode.x] ^= this.vRegister[parsedOpcode.y];
    this.programCounter += 2;
  }

  _8xy4(parsedOpcode) {
    const result = this.vRegister[parsedOpcode.x] + this.vRegister[parsedOpcode.y];
    if (result > 255) {
      this.vRegister[0xf] = 1;
    } else {
      this.vRegister[0xf] = 0;
    }
    this.vRegister[parsedOpcode.x] = result & 0xff;
    this.programCounter += 2;
  }

  _8xy5(parsedOpcode) {
    const result = this.vRegister[parsedOpcode.x] - this.vRegister[parsedOpcode.y];
    if (this.vRegister[parsedOpcode.x] > this.vRegister[parsedOpcode.y]) {
      this.vRegister[0xf] = 1;
    } else {
      this.vRegister[0xf] = 0;
    }
    this.vRegister[parsedOpcode.x] = result;
    this.programCounter += 2;
  }

  _8xy6(parsedOpcode) {
    const leastSignificantBit = this.vRegister[parsedOpcode.x] & 1;
    if (leastSignificantBit === 1) {
      this.vRegister[0xf] = 1;
    } else {
      this.vRegister[0xf] = 0;
    }
    this.vRegister[parsedOpcode.x] /= 2;
    this.programCounter += 2;
  }

  _8xy7(parsedOpcode) {
    const result = this.vRegister[parsedOpcode.y] - this.vRegister[parsedOpcode.x];
    if (this.vRegister[parsedOpcode.y] > this.vRegister[parsedOpcode.x]) {
      this.vRegister[0xf] = 1;
    } else {
      this.vRegister[0xf] = 0;
    }
    this.vRegister[parsedOpcode.x] = result;
    this.programCounter += 2;
  }

  _8xyE(parsedOpcode) {}

  _9xy0(parsedOpcode) {
    if (this.vRegister[parsedOpcode.x] != this.vRegister[parsedOpcode.y]) {
      this.programCounter += 4;
    } else {
      this.programCounter += 2;
    }
  }

  _Annn(parsedOpcode) {
    this.iRegister = parsedOpcode.nnn;
    this.programCounter += 2;
  }

  _Bnnn(parsedOpcode) {}

  _Cxkk(parsedOpcode, randomNumber) {
    const vxOperation = randomNumber & parsedOpcode.kk;
    this.vRegister[parsedOpcode.x] = vxOperation; // or this.vRegister = this.vRegister.push(vxOperation)
    this.programCounter += 2;
  }

  _Dxyn(parsedOpcode) {
    var row,
      col,
      sprite,
      width = 8,
      height = parsedOpcode.n;

    this.vRegister[0xf] = 0;

    for (row = 0; row < height; row++) {
      sprite = this.memory[this.iRegister + row];

      for (col = 0; col < width; col++) {
        if ((sprite & 0x80) > 0) {
          this.screen[this.vRegister[parsedOpcode.y] + row][this.vRegister[parsedOpcode.x] + col] = 1;

          const int_x = (this.vRegister[parsedOpcode.x] + col) & 0xff;
          const int_y = (this.vRegister[parsedOpcode.y] + row) & 0xff;

          const previousPixel = this.screen[int_y][int_x];
          const newPixel = previousPixel ^ ((sprite & (1 << (7 - i))) != 0); // XOR

          this.screen[int_y][int_x] = 1;

          if (previousPixel && !newPixel) {
            this.vRegister[0xf] = 0x01;
          }
        }

        sprite = sprite << 1;
      }
    }

    this.programCounter += 2;
  }

  _Ex9E(parsedOpcode) {
    if (this.keyInput[this.vRegister[parsedOpcode.x]]) {
      this.programCounter += 4;
    } else {
      this.programCounter += 2;
    }
  }

  _ExA1(parsedOpcode) {
    if (!this.keyInput[this.vRegister[parsedOpcode.x]]) {
      this.programCounter += 4;
    } else {
      this.programCounter += 2;
    }
  }

  _Fx07(parsedOpcode) {
    this.vRegister[parsedOpcode.x] = this.delayTimer;
    this.programCounter += 2;
  }

  _Fx0A(parsedOpcode) {}

  _Fx15(parsedOpcode) {
    this.delayTimer = this.vRegister[parsedOpcode.x];
    this.programCounter += 2;
  }

  _Fx18(parsedOpcode) {
    this.soundTimer = this.vRegister[parsedOpcode.x];
    this.programCounter += 2;
  }

  _Fx1E(parsedOpcode) {
    this.iRegister = this.iRegister + this.vRegister[parsedOpcode.x];
    this.programCounter += 2;
  }

  _Fx29(parsedOpcode) {}

  _Fx33(parsedOpcode) {
    const hundreds = Math.floor(this.vRegister[parsedOpcode.x] / 100);
    const tens = Math.floor((this.vRegister[parsedOpcode.x] % 100) / 10);
    const ones = (this.vRegister[parsedOpcode.x] % 100) % 10;
    this.memory[this.iRegister] = hundreds;
    this.memory[this.iRegister + 1] = tens;
    this.memory[this.iRegister + 2] = ones;
    this.programCounter += 2;
  }

  _Fx55(parsedOpcode) {}

  _Fx65(parsedOpcode) {}

  executeOpcode(parsedOpcode) {
    switch (parsedOpcode.i) {
      case 0x0:
        switch (parsedOpcode.kk) {
          case 0x00e0:
            return this._00E0();
          case 0x00ee:
            return this._00EE();
        }
      case 0x1:
        return this._1nnn(parsedOpcode);
      case 0x2:
        return this._2nnn(parsedOpcode);
      case 0x3:
        return this._3xkk(parsedOpcode);
      case 0x4:
        return this._4xkk(parsedOpcode);
      case 0x6:
        return this._6xkk(parsedOpcode);
      case 0x7:
        return this._7xkk(parsedOpcode);
      case 0x8:
        switch (parsedOpcode.n) {
          case 0x0:
            return this._8xy0(parsedOpcode);
          case 0x0001:
            return this._8xy1(parsedOpcode);
          case 0x0002:
            return this._8xy2(parsedOpcode);
          case 0x0003:
            return this._8xy3(parsedOpcode);
          case 0x0004:
            return this._8xy3(parsedOpcode);
          case 0x0005:
            return this._8xy5(parsedOpcode);
          case 0x0006:
            return this._8xy6(parsedOpcode);
          case 0x0007:
            return this._8xy7(parsedOpcode);
        }
      case 0x9:
        return this._9xy0(parsedOpcode);
      case 0xa:
        return this._Annn(parsedOpcode);
      case 0xc:
        const randomNumber = Math.floor(Math.random() * 256);
        return this._Cxkk(parsedOpcode, randomNumber);
      case 0xd:
        return this._Dxyn(parsedOpcode);
      case 0xe:
        switch (parsedOpcode.kk) {
          case 0x00a1:
            return this._ExA1(parsedOpcode);
          case 0x009e:
            return this._Ex9E(parsedOpcode);
        }
      case 0xf:
        switch (parsedOpcode.kk) {
          case 0x0015:
            return this._Fx15(parsedOpcode);
          case 0x0007:
            return this._Fx07(parsedOpcode);
          case 0x001e:
            return this._Fx1E(parsedOpcode);
          case 0x0033:
            return this._Fx33(parsedOpcode);
          case 0x0018:
            return this._Fx18(parsedOpcode);
        }
      default:
        throw new Error('Unknown opcode: ' + JSON.stringify(parsedOpcode));
    }
  }
}

module.exports = Emulator;
