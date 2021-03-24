const functions = require('firebase-functions')

const routes = {
  'observations': (req, res) => require('./api/controllers/observations').observations(req, res),
  'images': (req, res) => require('./api/controllers/images').images(req, res),
  'observations/:id': (req, res) => require('./api/controllers/observation').observation(req, res),
  'export': (req, res) => require('./api/controllers/export').exportReq(req, res),
  'userInfo': (req, res) => require('./api/controllers/userInfo').userInfo(req, res),
  'userRefresh': (req, res) => require('./api/controllers/userRefresh').userRefresh(req, res)
}

const setOptions = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', '*');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Max-Age', '360000');
    return res.status(204).send('');
  }
}

exports.api = functions.region('europe-west2').https.onRequest((req, res) => {
  if (setOptions(req, res)) {
    return true
  }
  if (req.query && req.query.wakeup) {
    return res.status(204).send('');
  }

  const [resource, id] = (req.path || '/').split('/').filter(Boolean)

  if (routes[resource] && id) return routes[`${resource}/:id`](req, res)
  else if (routes[resource]) return routes[resource](req, res)
  else {
    routesPath = Object.keys(routes)

    return res.status(404).send(`
      <h1>API</h1>
      <ul>
        ${routesPath.map(r => `<li>/${r}</li>`).join('')}
      </ul>
    `)
  }
})

// exports.runner = functions
// .region('europe-west2')
// .runWith( { memory: '128MB' }).pubsub
// .schedule('*/5 * * * *')
// .onRun(async(context) => require('https').get('https://europe-west2-cos4cloud-2d9d3.cloudfunctions.net/observations?wakeup'))

