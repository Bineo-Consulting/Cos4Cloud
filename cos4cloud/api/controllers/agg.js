const Mongo = require('../../services/mongo.service')

const agg = async (req, res) => {
  const { sub } = req.headers
  const query = req.query || {}

  const [comments, downloads, users] = await Promise.all([
    Mongo.agg('comments', { ...query, user_id: sub }),
    Mongo.agg('downloads', { ...query, user_id: sub }),
    Mongo.agg('users', { ...query, user_id: sub })
  ])

  return res.send({
    comments: JSON.parse(comments),
    downloads: JSON.parse(downloads),
    users: JSON.parse(users)
  })
}

module.exports = { agg }