const DEFAULT_RESPONSE = {
  errorType: 'Unknow error',
  errorMessage: 'an error occured, cannot perform this request. please retry later.'
}

class FetchError extends Error {
  constructor (message, fetchResponse, serverResponse = DEFAULT_RESPONSE, filename, lineNumber) {
    super(message, filename, lineNumber)
    this.status = fetchResponse ? fetchResponse.status : null
    this.serverResponse = serverResponse
  }
}

export default FetchError
