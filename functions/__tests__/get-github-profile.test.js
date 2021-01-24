/* eslint-disable */
const { graphql } = require("@octokit/graphql");
const githubProfileModule = require("../get-github-profile");
const fakeGithubProfileData = require('./dumb/get-github-profile.dumb')

jest.mock('@octokit/graphql');

describe("GCP function: get github profile project", () => {
  describe('getGithubProfile', () => {
    test("it should be defined", () => expect(githubProfileModule.getGithubProfile).toBeDefined())
    test("it should be a function", () => expect(typeof githubProfileModule.getGithubProfile).toBe("function"))
    test("it should reject if the api request returns some errors and no data", () => {
      graphql.mockReturnValue(Promise.reject({
        "data": null,
        "errors": [{
          "message": "Field 'bioHtml' doesn't exist on type 'User'",
          "locations": [{
            "line": 3,
            "column": 5
          }]
        }]
      }))

      return githubProfileModule.getGithubProfile()
        .catch(errorObject => {
          expect(errorObject).toEqual(
            [{
              "message": "Field 'bioHtml' doesn't exist on type 'User'",
              "locations": [{
                "line": 3,
                "column": 5
              }]
            }]
          )
        })
    })
    test("it should reject if github return a partial response with somme errors", () => {
      graphql.mockReturnValue(Promise.reject({
        "data": {
          "repository": {
            "name": "probot",
            "ref": null
          }
        },
        "errors": [
          {
            "type": "INVALID_CURSOR_ARGUMENTS",
            "path": [
              "repository",
              "ref",
              "target",
              "history"
            ],
            "locations": [
              {
                "line": 7,
                "column": 11
              }
            ],
            "message": "`invalid cursor` does not appear to be a valid cursor."
          }
        ]
      }))

      return githubProfileModule.getGithubProfile()
        .catch(errorObject => {
          expects(errorObject).toEqual(
            [
              {
                "type": "INVALID_CURSOR_ARGUMENTS",
                "path": [
                  "repository",
                  "ref",
                  "target",
                  "history"
                ],
                "locations": [
                  {
                    "line": 7,
                    "column": 11
                  }
                ],
                "message": "`invalid cursor` does not appear to be a valid cursor."
              }
            ]
          )
        })
    })
    test("it should request the right fields", () => {
      return githubProfileModule.getGithubProfile()
        .then(_ => {
          expect(graphql.mock.calls[0][0]).toEqual(
            githubProfileModule.GITHUB_GRAPHQL_REQUEST
          )
        })
    })
    test("it should only return the items array and not the complete graphql response", () => {
      graphql.mockReturnValue(Promise.resolve({
        "user": {
          "itemShowcase": {
            "items": {
              "nodes": [
                {
                  "name": "staticpack",
                  "descriptionHTML": "<div>A reusable development environment for a 100% static website or template.</div>",
                  "primaryLanguage": {
                    "name": "JavaScript"
                  },
                  "url": "https://github.com/antoine-amara/staticpack"
                },
              ],
              "pageInfo": {
                "hasNextPage": false
              },
              "totalCount": 6
            }
          }
        }
      }))

      return githubProfileModule.getGithubProfile()
        .then(apiResponse => {
          expect(apiResponse).toEqual([
            {
              "name": "staticpack",
              "descriptionHTML": "<div>A reusable development environment for a 100% static website or template.</div>",
              "primaryLanguage": {
                "name": "JavaScript"
              },
              "url": "https://github.com/antoine-amara/staticpack"
            },
          ])
        })
    })
  })
  describe('getGithubProfileMiddleware', () => {
    let jsonSendMock = null;

    beforeEach(() => {
      process.env = Object.assign({}, process.env, { AUTHORIZED_ORIGINS: 'https://antoineamara.dev' })
      jsonSendMock = jest.fn()
    })
    afterEach(() => {
      jsonSendMock.mockRestore()
    })

    test('it should be defined', () => expect(githubProfileModule.getGithubProfileMiddleware).toBeDefined())
    test('it should be a function', () => expect(typeof githubProfileModule.getGithubProfileMiddleware).toBe('function'))
    test('it should check authorized origins and return 403 error if the origin is not allowed', () => {
      const fakeReq = {
        origin: 'https://hackerman.com',
        get: jest.fn(() => 'https://hackerman.com'),
        body: {}
      }

      const fakeRes = {
        set: () => {},
        status: jest.fn(() => ({
          json: jsonSendMock,
          send: jest.fn()  
        })),
      }

      githubProfileModule.getGithubProfile = jest.fn(() => Promise.resolve(fakeGithubProfileData))
      githubProfileModule.getGithubProfileMiddleware(fakeReq, fakeRes)
      
      expect(fakeRes.status).toHaveBeenCalledWith(403)
      expect(fakeRes.status().json).toHaveBeenCalledWith(expect.objectContaining({ errorType: 'bad origin' }))
      expect(fakeRes.status().json).toHaveBeenCalledWith(expect.objectContaining({ errorMessage: 'you\'re not authorized to use this service.' }))
    })
    test('it should send a 500 error if the system failed to retrieve github profile', () => {
      const fakeReq = {
        origin: 'https://antoineamara.dev',
        get: jest.fn(() => 'https://antoineamara.dev'),
        body: {}
      }
      const fakeRes = {
        set: () => {},
        status: jest.fn(() => ({
          json: jsonSendMock,
          send: jest.fn()  
        })),
      }

      githubProfileModule.getGithubProfile = jest.fn(() => Promise.reject(
        [
          {
            "type": "INVALID_CURSOR_ARGUMENTS",
            "path": [
              "repository",
              "ref",
              "target",
              "history"
            ],
            "locations": [
              {
                "line": 7,
                "column": 11
              }
            ],
            "message": "`invalid cursor` does not appear to be a valid cursor."
          }
        ]
      ))

      return githubProfileModule.getGithubProfileMiddleware(fakeReq, fakeRes)
        .then(_ => {
          expect(fakeRes.status).toHaveBeenCalledWith(500)
          expect(fakeRes.status().json).toHaveBeenCalledWith(expect.objectContaining({ errorType: 'github api error' }))
          expect(fakeRes.status().json).toHaveBeenCalledWith(expect.objectContaining({ errorMessage: 'an error occured, cannot retrieve data from github.' }))
        })
    })
    test('it should send a 200 response if the github profile was successfully retrieved', () => {
      const fakeReq = {
        origin: 'https://antoineamara.dev',
        get: jest.fn(() => 'https://antoineamara.dev'),
        body: {}
      }
      const fakeRes = {
        set: () => {},
        status: jest.fn(() => ({
          json: jsonSendMock,
          send: jest.fn()  
        })),
      }

      githubProfileModule.getGithubProfile = jest.fn(() => Promise.resolve(fakeGithubProfileData))

      return  githubProfileModule.getGithubProfileMiddleware(fakeReq, fakeRes)
        .then(_ => {
          expect(fakeRes.status).toHaveBeenCalledWith(200)
          expect(fakeRes.status().json).toHaveBeenCalledWith(expect.objectContaining({ data: fakeGithubProfileData }))
        })
    })
  })
})
