const functions = require('firebase-functions')
const setCors = require('./utils/setCors')

const routes = {
  'observations': (req, res) => require('./api/controllers/observations').observations(req, res),
  'observations/:id': (req, res) => require('./api/controllers/observation').observation(req, res),
  'images': (req, res) => require('./api/controllers/images').images(req, res),
  'export': (req, res) => require('./api/controllers/export').exportReq(req, res),
  'comments': (req, res) => require('./api/controllers/comments').addComment(req, res),
  'userInfo': (req, res) => require('./api/controllers/userInfo').userInfo(req, res),
  'userRefresh': (req, res) => require('./api/controllers/userRefresh').userRefresh(req, res),
  'users': (req, res) => require('./api/controllers/users').users(req, res),
  'users/:id': (req, res) => require('./api/controllers/users').users(req, res)
}

exports.api = functions.region('us-central1').https.onRequest((req, res) => {
  if (setCors(req, res)) return true
  if (req.query && req.query.wakeup) return res.status(204).send('');

  const path = req.path.replace('/api', '').replace('occurrence', 'observations')

  const [resource, id] = path.includes('/dwc/') ?
    (path || '/').split('/').filter(Boolean).filter(i => i !== 'dwc') :
    (path || '/').split('/').filter(Boolean)

  if (routes[resource] && id) return routes[`${resource}/:id`](req, res)
  else if (routes[resource]) return routes[resource](req, res)
  else return res.status(404).send(`<meta http-equiv="refresh" content="0; URL=https://cos4bio.eu/apidoc/index.html"/>`)
})

exports.share = require('./share/share').share
