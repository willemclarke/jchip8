const { Emulator } = require('./emulator.js');
const emulator = new Emulator();

emulator.loadRom('resources/TETRIS');

let count = 0;
while (count < 100) {
  emulator.run();
  count += 1;
}
// setInterval(() => {
//   emulator.run();
// }, 200);
