const functions = require('firebase-functions')
const fetch = require('node-fetch')
const dJSON = JSON;
const toQueryString = require('./utils/toQueryString')
const MappingService = require('./services/mapping.service')

exports.observations = functions.region('europe-west2').https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', '*');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Max-Age', '360000');
    return res.status(204).send('');
  }

  if (req.query && req.query.wakeup) {
    return res.status(204).send('');
  } 

  const params = req.query;

  MappingService.get(params).then(aux => res.json(aux))
});

exports.observation = functions.region('europe-west2').https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', '*');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Max-Age', '360000');
    return res.status(204).send('');
  }

  if (req.query && req.query.wakeup) {
    return res.status(204).send('');
  } 

  const params = req.query;
  console.log(params)
  console.log(req.path)

  MappingService.getById(req.path, params).then(aux => res.json(aux))
});

exports.images = functions.region('europe-west2').https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', '*');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Max-Age', '360000');
    return res.status(204).send('');
  }

  const params = {
    ids: req.query.ids.split(',')
  }

  return MappingService.images(params)
  .then(r => res.json([r]))
  .catch((error) => {
    console.log(error)
    return res.send('Error')
  })
});

exports.export = functions.region('europe-west2').https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', '*');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Max-Age', '360000');
    return res.status(204).send('');
  }
  
  const query = req.query
  delete query.origin
  delete query.page
  const q = toQueryString(query)

  return fetch(`https://natusfera.gbif.es/observations.csv${q}&limit=3000`, {
    headers: {
      Cookie: '_ga=GA1.3.2128890809.1599834510; _gid=GA1.3.591215609.1609158459; remember_user_token=BAhbB1sGaQLHD0kiGU5nblV0WkpkcXdlRnhKdkJYakhrBjoGRUY%3D--076e19a189d3d33247d66a129dbc42fca9fcec8d; _session_id=BAh7DkkiD3Nlc3Npb25faWQGOgZFRkkiJTE2MmY4NmYzNTAxZDMzZmM4MzIzZTRlZmM1YTE2YjYyBjsAVEkiDnJldHVybl90bwY7AEYiGi9wZW9wbGUvcm9iaW5wYXJhZGlzZUkiEHByZWZlcmVuY2VzBjsARnsZSSIscHJvamVjdF9qb3VybmFsX3Bvc3RfZW1haWxfbm90aWZpY2F0aW9uBjsARlRJIh9jb21tZW50X2VtYWlsX25vdGlmaWNhdGlvbgY7AEZUSSImaWRlbnRpZmljYXRpb25fZW1haWxfbm90aWZpY2F0aW9uBjsARlRJIh9tZXNzYWdlX2VtYWlsX25vdGlmaWNhdGlvbgY7AEZUSSINbm9fZW1haWwGOwBGRkkiKnByb2plY3RfaW52aXRhdGlvbl9lbWFpbF9ub3RpZmljYXRpb24GOwBGVEkiGGxpc3RzX2J5X2xvZ2luX3NvcnQGOwBGSSIHaWQGOwBGSSIZbGlzdHNfYnlfbG9naW5fb3JkZXIGOwBGSSIIYXNjBjsARkkiDXBlcl9wYWdlBjsARmkjSSIRZ2JpZl9zaGFyaW5nBjsARlRJIhhvYnNlcnZhdGlvbl9saWNlbnNlBjsARjBJIhJwaG90b19saWNlbnNlBjsARjBJIhJzb3VuZF9saWNlbnNlBjsARjBJIiNzaGFyZV9vYnNlcnZhdGlvbnNfb25fZmFjZWJvb2sGOwBGVEkiInNoYXJlX29ic2VydmF0aW9uc19vbl90d2l0dGVyBjsARlRJIiBhdXRvbWF0aWNfdGF4b25vbWljX2NoYW5nZXMGOwBGVEkiFm9ic2VydmF0aW9uc192aWV3BjsARjBJIhNjb21tdW5pdHlfdGF4YQY7AEZUSSIab2JzZXJ2YXRpb25fZmllbGRzX2J5BjsARkkiC2FueW9uZQY7AEZJIhhvYnNlcnZhdGlvbnNfbGltaXRzBjsARmkCIE5JIhBfY3NyZl90b2tlbgY7AEZJIjFIRnUycWdVdjY3UE1YUGNLekphbXFvb2JxKzRQVk9QeURWZGZPcGxMK1lnPQY7AEZJIhtyZXR1cm5fdG9fZm9yX25ld191c2VyBjsARiIrL29ic2VydmF0aW9ucy9leHBvcnQ%2FcT0mdXRmOD0lRTIlOUMlOTNJIhN1c2VyX3JldHVybl90bwY7AEYiKy9vYnNlcnZhdGlvbnMvZXhwb3J0P3E9JnV0Zjg9JUUyJTlDJTkzSSIZd2FyZGVuLnVzZXIudXNlci5rZXkGOwBUWwdbBmkCxw9JIhlwSlVkdVJDQlNUNk1ZaUFNNmNjcwY7AFRJIhJ1cGRhdGVzX2NvdW50BjsARmkASSITbWVzc2FnZXNfY291bnQGOwBGaQA%3D--750755ff32a55044f218c034a6690c25f09bb413'
    }
  })
  .then(r => r.text())
  .then(r => res.send(r))
})

exports.runner = functions
.region('europe-west2')
.runWith( { memory: '128MB' }).pubsub
.schedule('*/5 * * * *')
.onRun(async(context) => require('https').get('https://europe-west2-cos4cloud-2d9d3.cloudfunctions.net/observations?wakeup'))

function btoa(b) {
  return Buffer.from(b).toString('base64');
};

exports.userInfo = functions
.region('europe-west2')
.runWith( { memory: '128MB' })
.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', '*');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Max-Age', '360000');
    return res.status(204).send('');
  }
  const clientId = 'c1d079f6-e0be-4c25-df4a-a881bb41afa1'
  const clientSecret = 'fc18afdb5c493b6e5be63623dfd814bcdd8dd635abe175a12fe330e3d4dc9386'
  
  const url = 'https://www.authenix.eu/oauth/tokeninfo'

  return fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(`${clientId}:${clientSecret}`),
      accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `token=${req.query.access_token}&token_type_hint=access_token`
  }).then(r => r.json())
  .then(r => res.json(r))
  .catch(r => res.error({
    res: r,
    query: req.query.access_token
  }))
})

exports.userRefresh = functions
.region('europe-west2')
.runWith( { memory: '128MB' })
.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', '*');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Max-Age', '360000');
    return res.status(204).send('');
  }
  const clientId = 'c1d079f6-e0be-4c25-df4a-a881bb41afa1'
  const clientSecret = 'fc18afdb5c493b6e5be63623dfd814bcdd8dd635abe175a12fe330e3d4dc9386'
  
  const url = 'https://www.authenix.eu/oauth/token'
  const FormData = require('form-data')
  const f = new FormData()
  f.append('grant_type', 'refresh_token')
  f.append('refresh_token', req.query.access_token)

  return fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(`${clientId}:${clientSecret}`),
      accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=refresh_token&refresh_token=${req.query.access_token}`,
  }).then(r => r.json())
  .then(r => res.json(r))
  .catch(r => res.error({
    res: r,
    query: req.query.access_token
  }))
})