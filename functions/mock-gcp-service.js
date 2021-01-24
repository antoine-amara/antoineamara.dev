const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { getGithubProfileMiddleware } = require('./get-github-profile')
const { timeout } = require('./utils')

const app = express()
const PORT = +process.env.PORT || 80

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use((req, _res, next) => {
  console.info(`[☁️  faas service] call service ${req.path.split('/')[1]}`)
  console.info(`[☁️  faas service] parameters: ${JSON.stringify(req.body, null, 4)}`)

  next()
})
app.use(cors())

app.get(
  '/github-profile',
  async (_req, _res, next) => { await timeout(5000); next() },
  getGithubProfileMiddleware
)

app.listen(PORT, () => console.info('[☁️  faas service] available on "http://north-fr-antoinedev.cloudfunction.localhost/"'))
