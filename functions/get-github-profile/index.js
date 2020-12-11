function getGithubProfile (req, res) {
  return res.status(200).json({ message: 'success' })
}

module.exports = {
  getGithubProfile
}
