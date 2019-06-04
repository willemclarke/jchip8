const _ = require('lodash');
const fs = require('fs');
const { parseOpcode } = require('./utils');

class Emulator {
  constructor() {
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
    this.screen = Array(32).fill(Array(64).fill(0));
  }

  loadRom(path) {
    const reserved = Array(0x200).fill(0x0);
    const rom = Array.from(Uint8Array.from(fs.readFileSync(path)));
    this.memory = reserved.concat(rom);
  }

  run() {
    const rawOpcode = (this.memory[this.programCounter] << 8) | this.memory[this.programCounter + 1];
    const parsedOpcode = parseOpcode(rawOpcode);
    this.trace();
    this.executeOpcode(parsedOpcode);
  }

  trace() {
    const stack = _.map(this.stack, (value) => value.toString(16));
    const vRegister = _.map(this.vRegister, (value) => value.toString(16));
    console.log(
      // `Opcode: ${parsedOpcode.pretty}`,
      `PC: ${this.programCounter.toString(16)}`,
      `iRegister: ${this.iRegister.toString(16)}`,
      `vRegister: [${vRegister}]`,
      `stackPointer: ${this.stackPointer.toString(16)}`,
      `stack: [${stack}] soundT: ${this.soundTimer.toString(16)}`,
      `delayT: ${this.delayTimer.toString(16)}`,
    );
  }

  drawScreen() {
    console.log('drawScreen');
    _.forEach(this.screen, (row) => {
      console.log(row.join(''));
    });
  }

  _Annn(parsedOpcode) {
    this.iRegister = parsedOpcode.nnn;
    this.programCounter += 2;
  }

  _2nnn(parsedOpcode) {
    this.stackPointer += 1;
    this.stack.push(this.programCounter);
    this.programCounter = parsedOpcode.nnn; // testing without + 2 after parsedOpcode.nnn
  }

  _6xkk(parsedOpcode) {
    this.vRegister[parsedOpcode.x] = parsedOpcode.kk;
    this.programCounter += 2;
  }

  _00EE() {
    this.programCounter = this.stack.pop() + 2;
    this.stackPointer -= 1;
  }

  _7xkk(parsedOpcode) {
    this.vRegister[parsedOpcode.x] = (this.vRegister[parsedOpcode.x] + parsedOpcode.kk) & 0xff;
    this.programCounter += 2;
  }
  /*
Dxyn - DRW Vx, Vy, nibble
Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision.

The interpreter reads n bytes from memory, starting at the address stored in I. These bytes are then displayed as sprites on screen at coordinates (Vx, Vy). Sprites are XORed onto the existing screen. If this causes any pixels to be erased, VF is set to 1, otherwise it is set to 0. If the sprite is positioned so part of it is outside the coordinates of the display, it wraps around to the opposite side of the screen. See instruction 8xy3 for more information on XOR, and section 2.4, Display, for more information on the Chip-8 screen and sprites.

*/

  _Dxyn(parsedOpcode) {
    console.log(parsedOpcode.pretty);
    const spriteHeight = parsedOpcode.n;
    const spriteWidth = 0x8;
    const x = this.vRegister[parsedOpcode.x];
    const y = this.vRegister[parsedOpcode.y];
    let row, column;

    for (row = 0x0; row < spriteHeight; row++) {
      const sprite = this.memory[this.iRegister + row];
      for (column = 0x0; column < spriteWidth; column++) {
        if ((sprite & 0x80) > 0x0) {
          const xPosition = x + column;
          const yPosition = y + row;
          console.log(yPosition);

          const current = this.screen[yPosition][xPosition] === 1;
          this.screen[yPosition][xPosition] = current ^ true;

          // if (current) {
          //   this.vRegister[0xf] = 1;
          // }
        }
      }
    }
    this.programCounter += 2;
    this.drawScreen();
  }
  // _Dxyn(parsedOpcode) {
  //   console.log(parsedOpcode.pretty);
  //   const spriteHeight = parsedOpcode.n;
  //   const spriteWidth = 0x8;
  //   const xCoordinate = this.vRegister[parsedOpcode.x];
  //   const yCoordinate = this.vRegister[parsedOpcode.y];
  //   let flag = 0;

  //   for (var posY = 0; posY < spriteHeight; posY++) {
  //     const sprite = this.memory[this.iRegister + posY];
  //     for (var posX = 0; posX < spriteWidth; posX++) {
  //       const xInverse = 7 - posX;
  //       const mask = 1 << xInverse;

  //       if (sprite & (mask != 0)) {
  //         const x = xCoordinate + posX;
  //         const y = yCoordinate + posY;

  //         if (x < 64 && y < 32) {
  //           if (this.screen[x][y] === 1) {
  //             flag = 1;
  //           }

  //           this.screen[x][y] = this.screen[x][y] ^ 1;
  //         }
  //       }
  //     }
  //   }

  //   this.vRegister[0xf] = flag;
  //   this.programCounter += 2;
  // }

  _3xkk(parsedOpcode) {
    if (this.vRegister[parsedOpcode.x] === parsedOpcode.kk) {
      this.programCounter += 4;
    } else {
      this.programCounter += 2;
    }
  }

  _1nnn(parsedOpcode) {
    this.programCounter = parsedOpcode.nnn; // testing without + 2 after parsedOpcode.nnn
  }

  _Cxkk(parsedOpcode, randomNumber) {
    const vxOperation = randomNumber & parsedOpcode.kk;
    this.vRegister[parsedOpcode.x] = vxOperation; // or this.vRegister = this.vRegister.push(vxOperation)
    this.programCounter += 2;
  }

  _4xkk(parsedOpcode) {
    if (this.vRegister[parsedOpcode.x] != parsedOpcode.kk) {
      this.programCounter += 4;
    } else {
      this.programCounter += 2;
    }
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

  _Fx33(parsedOpcode) {
    const hundreds = Math.floor(this.vRegister[parsedOpcode.x] / 100);
    const tens = Math.floor((this.vRegister[parsedOpcode.x] % 100) / 10);
    const ones = (this.vRegister[parsedOpcode.x] % 100) % 10;
    this.memory[this.iRegister] = hundreds;
    this.memory[this.iRegister + 1] = tens;
    this.memory[this.iRegister + 2] = ones;
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

  executeOpcode(parsedOpcode) {
    console.log('executing ' + parsedOpcode.pretty);
    switch (parsedOpcode.i) {
      case 0xa:
        return this._Annn(parsedOpcode);
      case 0x2:
        return this._2nnn(parsedOpcode);
      case 0x6:
        return this._6xkk(parsedOpcode);
      case 0x0:
        return this._00EE();
      case 0x7:
        return this._7xkk(parsedOpcode);
      // case 0xd:
      //   return this._Dxyn(parsedOpcode);
      case 0x3:
        return this._3xkk(parsedOpcode);
      case 0x1:
        return this._1nnn(parsedOpcode);
      case 0xc:
        const randomNumber = Math.floor(Math.random() * 256);
        return this._Cxkk(parsedOpcode, randomNumber);
      case 0x4:
        return this._4xkk(parsedOpcode);
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
      case 0xe:
        switch (parsedOpcode.kk) {
          case 0x00a1:
            return this._ExA1(parsedOpcode);
          case 0x009e:
            return this._Ex9E(parsedOpcode);
        }
      case 0x8:
        switch (parsedOpcode.n) {
          case 0x0:
            return this._8xy0(parsedOpcode);
          case 0x0001:
            return this._8xy1(parsedOpcode);
          case 0x0002:
            return this._8xy2(parsedOpcode);
        }
      default:
        throw new Error('Unknown opcode: ' + JSON.stringify(parsedOpcode));
    }
  }
}

module.exports = {
  Emulator,
};
