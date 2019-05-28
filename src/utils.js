// nnn or addr - A 12-bit value, the lowest 12 bits of the instruction
// n or nibble - A 4-bit value, the lowest 4 bits of the instruction
// x - A 4-bit value, the lower 4 bits of the high byte of the instruction
// y - A 4-bit value, the upper 4 bits of the low byte of the instruction
// kk or byte - An 8-bit value, the lowest 8 bits of the instruction
// a2b4

function parseOpcode(opcode) {
  const pretty = ('0000' + opcode.toString(16).toUpperCase()).slice(-4);
  const hi = (opcode & 0xff00) >> 8;
  const lo = opcode & 0x00ff;
  const nnn = opcode & 0x0fff;
  const n = opcode & 0x000f;
  const x = hi & 0x0f;
  const y = lo & 0xf;
  const kk = opcode & 0x00ff;
  const i = (opcode & 0xf000) >> 12;

  return {
    hi: hi,
    lo: lo,
    nnn: nnn,
    n: n,
    x: x,
    y: y,
    kk: kk,
    raw: opcode,
    i: i,
    pretty: pretty,
  };
}

module.exports = {
  parseOpcode,
};
