function and(hex1, hex2) {
  return (hex1 & hex2).toString(16)
}

module.exports = {
  and
}