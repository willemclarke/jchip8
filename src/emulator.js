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
    this.screen = [];
  }

  loadRom(path) {
    const reserved = Array(0x200).fill(0x0);
    const rom = Array.from(Uint8Array.from(fs.readFileSync(path)));
    this.memory = reserved.concat(rom);
  }

  run() {
    const rawOpcode = (this.memory[this.programCounter] << 8) | this.memory[this.programCounter + 1];
    const parsedOpcode = parseOpcode(rawOpcode);
    console.log(this.trace());
    this.executeOpcode(parsedOpcode);
    this.run();
  }

  trace() {
    const stack = _.map(this.stack, (value) => value.toString(16));
    const vRegister = _.map(this.vRegister, (value) => value.toString(16));
    return `PC: ${this.programCounter.toString(16)} iRegister: ${this.iRegister.toString(16)}
    vRegister: [${vRegister}] stackPointer: ${this.stackPointer.toString(16)} stack: [${stack}]`;
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

  _Dxyn() {
    this.programCounter += 2;
  }

  _3xkk(parsedOpcode) {
    if (this.vRegister[parsedOpcode.x] === parsedOpcode.kk) {
      return (this.programCounter += 4);
    } else {
      return (this.programCounter += 2);
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
      return (this.programCounter += 4);
    } else {
      return (this.programCounter += 2);
    }
  }

  _fx15(parsedOpcode) {
    // console.log(this.delayTimer);
    // console.log(this.vRegister[parsedOpcode.x] + ' vRegister.x');
    this.delayTimer = this.vRegister[parsedOpcode.x];
    // console.log(this.delayTimer);
    this.programCounter += 2;
  }

  _ExA1(parsedOpcode) {
    console.log(this.vRegister[parsedOpcode.x]);
    console.log(this.keyInput[this.vRegister[parsedOpcode.x]]);
    if (this.keyInput[this.vRegister[parsedOpcode.x]] === false) {
      return (this.programCounter += 4);
    } else {
      return (this.programCounter += 2);
    }
  }

  executeOpcode(parsedOpcode) {
    console.log('executing ' + parsedOpcode.pretty);
    switch (parsedOpcode.i) {
      case 0xa:
        return this._Annn(parsedOpcode);
      case 0x2:
        return this._Annn(parsedOpcode);
      case 0x6:
        return this._6xkk(parsedOpcode);
      case 0x0:
        return this._00EE();
      case 0x7:
        return this._7xkk(parsedOpcode);
      case 0xd:
        return this._Dxyn();
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
            return this._fx15(parsedOpcode);
        }
      case 0xe: // currently working here
        switch (parsedOpcode.kk) {
          case 0x00a1:
            return this._ExA1(parsedOpcode);
        }
      default:
        throw new Error('Unknown opcode: ' + JSON.stringify(parsedOpcode));
    }
  }
}

module.exports = {
  Emulator,
};
