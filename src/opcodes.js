const { and } = require("./utils/hex.js");
function executeOpcode(emulator, hex) {
  const bitShiftedHex = and(hex, 0xf000)
  switch(bitShiftedHex) {
    case 'a000':
      emulator.iRegister = and(hex, 0x0fff)
      emulator.programCounter += 1
      return
    default:
      console.log("Unknown opcode")
      //23e6
    case '2000': //(23e6)
      emulator.stackPointer += 1
      emulator.stack.push(emulator.programCounter)
      emulator.programCounter = and(hex, 0x0fff)
  }
}

module.exports = {
  executeOpcode
}