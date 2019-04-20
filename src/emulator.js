const fs = require('fs');

let emulator = {
  memory: [],
  programCounter: 0,
  stackPointer: 0,
  stack: [],
  vRegister: [],
  iRegister: 0,
  soundTimer: 0,
  delayTimer: 0, 
  keyInput: [],
  screen: []
}

function loadRom(name) {
  const romAsHex = fs.readFileSync(`resources/${name}`, "hex")
  // split read file into 8-bit elements
  emulator.memory = romAsHex.match(/.{1,4}/g)
}

function run() {
  emulator.programCounter += 2
  
  setTimeout(() => {
    console.log(emulator)
    return run()
  }, 100)
}

module.exports = {
  loadRom,
  run
}