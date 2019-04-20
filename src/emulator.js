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


function run() {
  emulator = {
    ...emulator,
    programCounter: emulator.programCounter + 2
  }

  setTimeout(() => {
    console.log(emulator)
    return run()
  }, 100)
}

module.exports = {
  run
}