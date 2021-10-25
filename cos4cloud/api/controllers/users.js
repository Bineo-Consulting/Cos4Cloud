const Mongo = require('../../services/mongo.service')
const Auth = require('../../services/auth.service')

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const handleUpdate = async (req, res) => {
  const { access_token, ...data } = JSON.parse(req.body)

  const user = await Auth.info(access_token)

  if (user.sub && user.sub !== 'null') {
    const aux = await Mongo.update('users', {
      id: user.sub,
      ...data,
      ...user,
      active: user.active,
      access_token
    })
    return res.send(aux)
  }
  return res.send(user)
}

const handleDelete = async (req, res) => {
  const id = req.path.replace('/api', '').split('/').filter(Boolean)[1]
  const aux = await Mongo.delete('users', id)
  return res.send(aux)
}

const users = async (req, res) => {
  switch (req.method) {
    case 'GET':
      const id = req.path.replace('/api', '').split('/').filter(Boolean)[1]
      const { sub } = req.headers
      if (id === 'search') {
        // const users = await Mongo.get('users')
        // users.map(u => Mongo.update('users', {
        //   id: u._id,
        //   created_at: randomDate(new Date('2021-01-021'), new Date())
        // }))

        const users = await Mongo.get('users')
        users.filter(u => !u.id).map(u => Mongo.delete('users', u._id))
        // users.map(u => Mongo.update('users', {
        //   id: u._id,
        //   created_at: randomDate(new Date('2021-01-021'), new Date())
        // }))

        const data = await Mongo.get('users', null, sub ? { user_id: sub } : {})
        return res.send(data)
      } else if (id === 'agg') {
        const data = await Mongo.agg('users', { user_id: sub })
        return res.send(data)
      }
      const aux = await Mongo.get('users', id)
      return res.send(aux)
    case 'POST':
    case 'PUT':
      return handleUpdate(req, res)
    case 'DELETE':
      return handleDelete(req, res);
    default:
      res.status(500).send({ error: 'Something blew up!' });
      break;
      return null
  }
}

module.exports = { users }
