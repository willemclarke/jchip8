const _ = require("lodash");
const fs = require("fs");
const { and } = require("./utils/hex")

class Emulator {
  constructor() {
    this.memory = []
    this.programCounter = 0
    this.stackPointer = 0
    this.stack = []
    this.vRegister = []
    this.iRegister = 0
    this.soundTimer = 0
    this.delayTimer = 0
    this.keyInput = []
    this.screen = []
  }
  
  loadRom(path) {
    // split read file into 8-bit elements
    this.memory = Uint8Array.from(fs.readFileSync(path)) 
  }

  run() {
    console.log(this.programCounter,this.memory.length)
    const opcode = ((this.memory[this.programCounter]) << 8) | (this.memory[this.programCounter + 1])
    this.executeOpcode(opcode)
    this.run()
  }

  executeOpcode(hex) {
    const bitShiftedHex = and(hex, 0xf000)
    console.log(bitShiftedHex, this.programCounter)
    switch(bitShiftedHex) {
      case 'a000': //(a2b4)
        this.iRegister = and(hex, 0x0fff)
        this.programCounter += 2
        return
      case '2000': //(23e6)
        this.stackPointer += 1
        this.stack.push(this.programCounter)
        this.programCounter = and(hex, 0x0fff)
        return
      // case '7001': //(case 7xkk)
      default:
        console.log("Unknown opcode")
        //23e6
    }
  }
}


module.exports = {
  Emulator,
};
