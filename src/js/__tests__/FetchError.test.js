/* eslint-disable */

import FetchError from '../FetchError'

describe('FetchError Exception: custom exception to use when fetch api get a 4XX/5XX HTTP response', () => {
  test('it should be defined', () => expect(FetchError).toBeDefined())
  test('it should be a function', () => expect(typeof FetchError).toBe('function'))
  test('it should add a default serverResponse error if the HTTP response is not JSON', async () => {
    const fakeFetchResponse = {
      ok: false,
      json: () => JSON.parse('Hello There!'),
      status: 500,
    }

    let error = null

    try {
      const jsonResponse = await fakeFetchResponse.json()
      error = new FetchError('network error response', fakeFetchResponse, jsonResponse)
    }
    catch (err) {
      error = new FetchError('network error response', fakeFetchResponse)
    }

    expect(error.message).toEqual('network error response')
    expect(error.status).toEqual(500)
    expect(error.serverResponse).toEqual({
      errorType: 'Unknow error',
      errorMessage: 'une erreur s\'est produite, impossible d\'effectuer l\'action demandée. Veuillez rééssayer ulterieurement'
    })
  })
  test('it should construct an error object with a message, the HTTP error code and the serverResponse as json object', async () => {
    const fakeFetchResponse = {
      ok: false,
      json: () => Promise.resolve({
        errorType: 'sending mail fail',
        errorMessage: 'une erreur s\'est produite, le mail de contact n\'a pu être envoyé.'
      }),
      status: 500,
    }

    const error = new FetchError('network error response', fakeFetchResponse, await fakeFetchResponse.json())

    expect(error.message).toEqual('network error response')
    expect(error.status).toEqual(500)
    expect(error.serverResponse).toEqual({
      errorType: 'sending mail fail',
      errorMessage: 'une erreur s\'est produite, le mail de contact n\'a pu être envoyé.'
    })
  })
})
