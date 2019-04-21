const _ = require("lodash");
const fs = require("fs");
const { executeOpcode } = require("./opcodes.js");

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
};


function loadRom(name) {
  // split read file into 8-bit elements
  emulator.memory = _.map(fs.readFileSync(`resources/${name}`, "hex").match(/.{1,4}/g), (data) => {
    return parseInt(data, 16)
  }) 
};

function run() {
  const { memory, programCounter } = emulator
  // to gather opcodes === convertedMemory
  const convertedMemory = emulator.memory.map((dec) => {
    return dec.toString(16)
  })
  console.log("started here", emulator.iRegister, emulator.programCounter, emulator.stackPointer, emulator.stack, emulator.programCounter)
  executeOpcode(emulator, memory[programCounter])
  console.log("finished executing first opcode", emulator.iRegister, emulator.stackPointer, emulator.stack, emulator.programCounter)

  setTimeout(() => {
    run()
  }, 3000)
};

module.exports = {
  loadRom,
  run
};
