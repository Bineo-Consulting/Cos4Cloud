const functions = require('firebase-functions')
const fetch = require('node-fetch')
const FormData = require('form-data');

const dJSON = JSON;

const toQueryString = object => '?' + Object.keys(object)
  .map(key => object[key] && `${key}=${object[key].toString()}`)
  .filter(Boolean)
  .join('&');

class MappingService {
  static get(params) {
    const queryParams = params ? toQueryString(params) : ''
    const promises = []
    const origin = params.origin
    if (!origin || origin.includes('natusfera')) {
      promises.push(this.getNatusfera(queryParams, params))
    }
    if (!origin || origin.includes('ispot')) {
      promises.push(this.getiSpot(queryParams))
    }

    return Promise.all(promises).then((res) => {
      let aux
      if (res && res[0] && res[1]) {
        aux = [...res[0], ...res[1]]
      } else if (res) {
        aux = [...res[0]]
      }
      return aux.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
    })
  }

  static getNatusfera(queryParams, params) {
    const origin = params.origin || ''
    let per_page = 80
    if (!origin || origin.includes('ispot')) {
      per_page = 31
    }
    return fetch('https://natusfera.gbif.es/observations.json' + queryParams + '&per_page=' + per_page)
    .then(res => res.json())
    .then(items => items.map(this.parseNatusfera))
  }

  static getiSpot(queryParams) {
    return fetch("https://api.ispotnature.org/ispotapi/content/observations/gallery" + queryParams, {
      "headers": {
        "authority": "api.ispotnature.org",
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9,es-ES;q=0.8,es;q=0.7,fr;q=0.6",
        "ispot-community": "21285",
        "ispot-language": "en",
        "ispot-origin": "b60e4df368c3187f848f496b0753f1fd1acea0f6",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36",
        "ispot-token": "null",
        "origin": "https://www.ispotnature.org",
        "Cookie": "__cfduid=d7c9f8ac36c19683ff64c545349637e271600365161; _ga=GA1.2.63808785.1600365164; _gid=GA1.2.1538649754.1601375706; ispot_session=eyJpdiI6IkwxXC9aNGdEUVphdFRUeVZoTzdNbEZ3PT0iLCJ2YWx1ZSI6ImZDeGdQWk10Uk03VHk2cm5xV0hraXhCWTlseG41Y1BhTzZwSkY3TXhOckd1eisxejluOVwva045UDIzV1wvY01WamRMRmJ4SXpxQXBcL0dKOVl2aENLYStnPT0iLCJtYWMiOiIxOTUyZjgyYjIzYTU4ZmVmM2M5MDIyYmU4YzgxZjZiZTZiNzcxY2VmYmUxODllYjI0ODc5ZTkxNGI3N2YzYjM4In0%3D; _gat=1"
      },
      "referrer": "https://www.ispotnature.org/",
      "referrerPolicy": "no-referrer-when-downgrade",
      "body": null,
      "method": "GET"
    })
    .then(res => res.text())
    .then(items => {
      const res = dJSON.parse(items.split("\n")[1])
      return res.data.map(this.parseiSpot)
    })
  }


  static parseNatusfera(item) {
    item.created_at = new Date(item.created_at)
    item.$$date = (item.created_at)
    item.$$species_name = item.species_name || (item.taxon || {}).name || 'Something...'
    item.origin = 'Natusfera'
    return item
  }
  static parseiSpot(item) {
    item.created_at = new Date(item.created * 1000)//.toISOString()
    item.comments_count = item.meta.comments || 0
    item.identifications_count = item.meta.identifications || 0
    item.observation_photos_count = (item.images || []).length || 1
    item.comments = []
    item.identifications = []
    item.longitude = (item.location || {}).lat
    item.latitude = (item.location || {}).lng
    item.quality_grade = 'casual'
    item.species_name = (item.likely || {}).scientific_name || item.title || 'Something...'
    item.origin = 'iSpot'
    return item
  }
}

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
  // Object.keys(req.query).map(key => {
  //   params[key] = req.query[key].value || null
  // })

  MappingService.get(params).then(aux => res.json(aux))
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
  // Object.keys(req.query).map(key => {
  //   params[key] = req.query[key].value || null
  // })

  queryParams = params.ids.map(i => `ids%5B%5D=${i}`).join('&')
  return fetch("https://api.ispotnature.org/ispotapi/image/bulk/medium?" + queryParams, {
    "headers": {
      "authority": "api.ispotnature.org",
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9,es-ES;q=0.8,es;q=0.7,fr;q=0.6",
      "ispot-community": "21285",
      "ispot-language": "en",
      "ispot-origin": "b60e4df368c3187f848f496b0753f1fd1acea0f6",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36",
      "ispot-token": "null",
      "origin": "https://www.ispotnature.org",
      "Cookie": "__cfduid=d7c9f8ac36c19683ff64c545349637e271600365161; _ga=GA1.2.63808785.1600365164; _gid=GA1.2.1538649754.1601375706; ispot_session=eyJpdiI6IkwxXC9aNGdEUVphdFRUeVZoTzdNbEZ3PT0iLCJ2YWx1ZSI6ImZDeGdQWk10Uk03VHk2cm5xV0hraXhCWTlseG41Y1BhTzZwSkY3TXhOckd1eisxejluOVwva045UDIzV1wvY01WamRMRmJ4SXpxQXBcL0dKOVl2aENLYStnPT0iLCJtYWMiOiIxOTUyZjgyYjIzYTU4ZmVmM2M5MDIyYmU4YzgxZjZiZTZiNzcxY2VmYmUxODllYjI0ODc5ZTkxNGI3N2YzYjM4In0%3D; _gat=1"
    },
    "referrer": "https://www.ispotnature.org/",
    "referrerPolicy": "no-referrer-when-downgrade",
    "body": null,
    "method": "GET"
  })
  .then(r => r.text())
  .then(items => {
    console.log('items.length =>' + items.length)
    const r = dJSON.parse(items.split("\n")[1])
    return res.json([r])
  })
  .catch((error) => {
    console.log(error)
    return res.send('Error')
  })
});

exports.runner = functions
.region('europe-west2')
.runWith( { memory: '128MB' }).pubsub
.schedule('*/3 * * * *')
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

  const fd = new FormData()
  fd.append('client_id', clientId)
  fd.append('client_secret', clientSecret)
  fd.append('token', req.query.access_token)
  fd.append('token_type_hint', 'access_token')

  return fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(`${clientId}:${clientSecret}`),
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: fd
  })
  .then(r => r.json())
  .then(r => {
    return res.json(r)
  })
  .catch(r => res.json(r))
})