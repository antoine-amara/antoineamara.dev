const { graphql } = require('@octokit/graphql')

const GITHUB_GRAPHQL_REQUEST = `query getProfileItemShowcase {
  user(login: "antoine-amara") {
      itemShowcase {
          items(last: 30) {
              nodes {
                  ... on Repository {
                      name
                      descriptionHTML
                      primaryLanguage {
                          name
                      }
                      openGraphImageUrl
                  }
              }
              pageInfo {
                  hasNextPage
              }
              totalCount
          }
      }
  }
}`

function managePreFlight (_, res) {
  res.set('Access-Control-Allow-Methods', 'GET')
  res.set('Access-Control-Allow-Headers', 'Content-Type')
  res.set('Access-Control-Max-Age', '3600')
  return res.status(204).send('')
}

function getGithubProfileMiddleware (req, res) {
  res.set('Access-Control-Allow-Origin', '*')

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    return managePreFlight(req, res)
  }

  console.info('##### RETRIEVE GITHUB PROJECTS REQUEST #####')

  console.info('origin: ', req.get('origin'))

  const authorizedOrigins = process.env.AUTHORIZED_ORIGINS.split(',')

  if (!authorizedOrigins.includes(req.get('origin'))) {
    console.error('bad origin: ', req.get('origin'))
    return res.status(403).json({
      errorType: 'bad origin',
      errorMessage: 'you\'re not authorized to use this service.'
    })
  }

  return service.getGithubProfile()
    .then(response => {
      console.info(`successfully retrieve ${response.length} projects.`)
      return res.status(200).json({ data: response })
    })
    .catch(err => {
      console.error(JSON.stringify(err, null, 4))
      res.status(500).json({ errorType: 'github api error', errorMessage: 'an error occured, cannot retrieve data from github.' })
    })
}

function getGithubProfile () {
  const { GITHUB_TOKEN } = process.env

  return graphql(
    GITHUB_GRAPHQL_REQUEST,
    {
      headers: {
        authorization: `token ${GITHUB_TOKEN}`
      }
    }
  )
    .then(apiReponse => {
      return apiReponse.user.itemShowcase.items.nodes
    })
    .catch(apiResponseWithErrors => {
      console.error(apiResponseWithErrors)
      if (apiResponseWithErrors.errors && apiResponseWithErrors.errors.length) {
        return apiResponseWithErrors.errors
      }
    })
}

const service = {
  getGithubProfileMiddleware,
  getGithubProfile,
  GITHUB_GRAPHQL_REQUEST
}

module.exports = service
