const Emulator = require('./emulator.js');

const emulator = new Emulator();

const canvas = document.querySelector('canvas');
const canvasCtx = canvas.getContext('2d');
const romSelector = document.getElementById('rom_selector');

loadRom = function(name) {
  var request = new XMLHttpRequest();
  request.onload = function() {
    if (request.response) {
      emulator.reset();
      emulator.loadRom(new Uint8Array(request.response));
      start();
    }
  };
  request.open('GET', 'resources/' + name, true);
  request.responseType = 'arraybuffer';
  request.send();
};

function draw() {
  const width = (canvasCtx.canvas.width = emulator.width * emulator.scale);
  const height = (canvasCtx.canvas.height = emulator.height * emulator.scale);

  canvasCtx.clearRect(0, 0, width, height);

  for (i = 0; i < emulator.width; i++) {
    for (j = 0; j < emulator.height; j++) {
      const x = i * emulator.scale;
      const y = j * emulator.scale;

      if (emulator.screen[j][i] === 1) {
        canvasCtx.fillStyle = '#000000';
        canvasCtx.fillRect(x, y, emulator.scale, emulator.scale);
      }
    }
  }
}

function step() {
  emulator.run();
  draw();
  requestAnimationFrame(step);
}

function start() {
  step();
}

romSelector.addEventListener(
  'change',
  function(event) {
    if (event.target.value != '') {
      const romName = event.target.value;
      console.log(`Loading rom ${romName}`);
      romSelector.blur();
      canvas.focus();
      loadRom(romName);
    }
  },
  false,
);
