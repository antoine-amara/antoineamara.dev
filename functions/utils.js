function timeout (waitingTime) {
  if (isNaN(+waitingTime)) throw new Error(`[timeout] waitingTime parameter should be a number, got value: ${waitingTime}`)

  return new Promise(resolve => setTimeout(() => resolve(), waitingTime))
}

module.exports = {
  timeout
}
