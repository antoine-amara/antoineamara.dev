const https = require('https')

const DEVTO_API_ENDPOINT = '/api/articles/me/published?per_page=10'

function requestBlogArticles () {
  const options = {
    hostname: 'dev.to',
    port: 443,
    path: DEVTO_API_ENDPOINT,
    method: 'GET',
    headers: {
      'api-key': process.env.DEVTO_API_KEY
    }
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.setEncoding('utf8')

      let body = ''

      res.on('data', (chunk) => {
        body += chunk
      })

      res.on('end', () => {
        const parsedBody = JSON.parse(body)
        if (res.statusCode !== 200) {
          return reject(parsedBody.error)
        }

        return resolve(parsedBody)
      })
    })

    req.on('error', (err) => reject(err))
    req.end()
  })
}

function getLastBlogArticles () {
  return service.requestBlogArticles()
    .then(articles => articles.slice(10).map(({ title, url, published_at: publishDate, tag_list: tagList }) => ({
      title,
      url,
      publishDate,
      tagList
    }))
    )
}

function managePreFlight (_, res) {
  res.set('Access-Control-Allow-Methods', 'GET')
  res.set('Access-Control-Allow-Headers', 'Content-Type')
  res.set('Access-Control-Max-Age', '3600')
  return res.status(204).send('')
}

function getBlogPost (req, res) {
  res.set('Access-Control-Allow-Origin', '*')

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    return managePreFlight(req, res)
  }

  console.info('##### RETRIEVE BLOG POST REQUEST #####')

  console.info('origin: ', req.get('origin'))

  const authorizedOrigins = process.env.AUTHORIZED_ORIGINS.split(',')

  if (!authorizedOrigins.includes(req.get('origin'))) {
    return res.status(403).json({
      errorType: 'bad origin',
      errorMessage: 'you\'re not authorized to use this service.'
    })
  }

  return service.getLastBlogArticles()
    .then(posts => {
      console.info(`successfully retrieve ${posts.length} posts from dev.to`)
      return res.status(200).json(posts)
    })
    .catch(err => {
      console.error('error retrieving blog posts from dev.to. ', JSON.stringify(err, null, 4))
      return res.status(500).json({ errorType: 'request fail', errorMessage: err.toString() })
    })
}

const service = {
  requestBlogArticles,
  getLastBlogArticles,
  getBlogPost
}

module.exports = service
