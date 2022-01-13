const Mongo = require('../../services/mongo.service')

const generic = async (req, res) => {
  const path = req.path.replace('/api', '')
  const [resource, id] = path.includes('/dwc/') ?
    (path || '/').split('/').filter(Boolean).filter(i => i !== 'dwc') :
    (path || '/').split('/').filter(Boolean)

  const { sub, parent_origin, parent_id } = {...req.headers}
  const query = req.query || {}

  if (id === 'search') {
    const where = {}
    if (sub) where.user_id = sub
    if (parent_origin) where.origin = parent_origin
    if (parent_id) where.parent_id = parent_id
    const anyWhere = sub || parent_origin || parent_id

    const data = await Mongo.get(resource, null, anyWhere ? where : {})
    if (parent_id) {
      const ids = [...new Set(data.map(i => i.user_id))]
      if (ids.length) {
        const users = await Mongo.get('users', {$in: ids})
        data.map(item => {
          const user = users.find(u => (u.sub || u.user_id) === item.user_id)
          if (user) {
            item.user = {
              id: user.sub || user.user_id,
              name: user.name || user.displayName || user.sub || user.user_id
            }
          }
          return item
        })
      }
    }
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
