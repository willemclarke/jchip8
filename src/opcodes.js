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
  }
}

module.exports = {
  executeOpcode
}