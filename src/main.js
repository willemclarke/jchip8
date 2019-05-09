const { Emulator } = require("./emulator.js")
const emulator = new Emulator()

emulator.loadRom("../resources/TETRIS")
emulator.run()

