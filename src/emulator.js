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
    this.keyInput = [];
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

  executeOpcode(parsedOpcode) {
    console.log('executing ' + parsedOpcode.pretty);
    switch (parsedOpcode.i) {
      case 0xa:
        this.iRegister = parsedOpcode.nnn;
        this.programCounter += 2;
        return;
      case 0x2:
        this.stackPointer += 1;
        this.stack.push(this.programCounter);
        this.programCounter = parsedOpcode.nnn; // testing without + 2 after parsedOpcode.nnn
        return;
      case 0x6:
        this.vRegister[parsedOpcode.x] = parsedOpcode.kk;
        this.programCounter += 2;
        return;
      case 0x0:
        this.programCounter = this.stack.pop() + 2;
        this.stackPointer -= 1;
        return;
      case 0x7:
        this.vRegister[parsedOpcode.x] = (this.vRegister[parsedOpcode.x] + parsedOpcode.kk) & 0xff;
        this.programCounter += 2;
        return;
      case 0xd:
        this.programCounter += 2;
        return;
      case 0x3:
        if (this.vRegister[parsedOpcode.x] === parsedOpcode.kk) {
          return (this.programCounter += 4), console.log('HERE COCKSUCKER');
        } else {
          return (this.programCounter += 2);
        }
      case 0x1:
        this.programCounter = parsedOpcode.nnn; // testing without + 2 after parsedOpcode.nnn
        return;
      case 0xc:
        this.programCounter += 2;
        return;
      default:
        throw new Error('Unknown opcode: ' + JSON.stringify(parsedOpcode));
    }
  }
}

module.exports = {
  Emulator,
};
