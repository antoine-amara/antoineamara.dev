const DEFAULT_RESPONSE = {
  errorType: 'Unknow error',
  errorMessage: 'une erreur s\'est produite, impossible d\'effectuer l\'action demandée. Veuillez rééssayer ulterieurement'
}

class FetchError extends Error {
  constructor (message, fetchResponse, serverResponse = DEFAULT_RESPONSE, filename, lineNumber) {
    super(message, filename, lineNumber)
    this.status = fetchResponse ? fetchResponse.status : null
    this.serverResponse = serverResponse
  }
}

export default FetchError
