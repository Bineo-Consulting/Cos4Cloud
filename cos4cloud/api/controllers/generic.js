const Mongo = require('../../services/mongo.service')

const generic = async (req, res) => {
  const path = req.path.replace('/api', '')
  const [resource, id] = path.includes('/dwc/') ?
    (path || '/').split('/').filter(Boolean).filter(i => i !== 'dwc') :
    (path || '/').split('/').filter(Boolean)

  const { sub } = req.headers
  const query = req.query || {}

  if (id === 'search') {
    const data = await Mongo.get(resource, null, sub ? { user_id: sub } : {})
    return res.send(data)
  } else if (id === 'agg') {
    const data = await Mongo.agg(resource, { ...query, user_id: sub })
    return res.send(data)
  } else {
    const data = await Mongo.get(resource, id)
    return res.send(data)
  }
}

module.exports = { generic }
