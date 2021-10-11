const Mongo = require('../../services/mongo.service')
const Auth = require('../../services/auth.service')


const handleUpdate = async (req, res) => {
  const { access_token, ...data } = JSON.parse(req.body)

  const user = await Auth.info(access_token)

  const aux = await Mongo.update('users', {
    id: user.sub,
    access_token,
    ...data,
    ...user
  })
  return res.send(aux)
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
