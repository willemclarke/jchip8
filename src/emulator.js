const _ = require("lodash");
const fs = require("fs");
const { parseOpcode } = require("./utils");

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
    const rawOpcode =
      (this.memory[this.programCounter] << 8) |
      this.memory[this.programCounter + 1];
    const parsedOpcode = parseOpcode(rawOpcode);
    this.executeOpcode(parsedOpcode);
    this.run();
  }

  executeOpcode(parsedOpcode) {
    console.log("executing " + parsedOpcode.pretty);
    switch (parsedOpcode.i) {
      case 0xa:
        this.iRegister = parsedOpcode.nnn;
        this.programCounter += 2;
        return;
      case 0x2:
        this.stackPointer += 1;
        this.stack.push(this.programCounter);
        this.programCounter = parsedOpcode.nnn;
        return;
      case 0x6:
        this.vRegister[parsedOpcode.x] = parsedOpcode.kk;
        this.programCounter += 2;
        return;
      default:
        throw new Error("Unknown opcode: " + JSON.stringify(parsedOpcode));
    }
  }
}

module.exports = {
  Emulator
};
