const fetch = require('node-fetch')

const parseiSpot = (item) => {
  item.id = 'ispot-' + (item.ID ? item.ID : (item.data || {}).ID)
  item.created_at = new Date(item.created * 1000)//.toISOString()

  item.comments_count = item.meta.comments || 0
  item.identifications_count = item.meta.identifications || 0
  item.observation_photos_count = (item.images || []).length || 1

  item.comments = item.comments || []
  item.identifications = []
  item.longitude = (item.location || {}).lng
  item.latitude = (item.location || {}).lat
  item.quality_grade = 'casual'
  item.species_name = (item.likely || {}).scientific_name || item.title || 'Something...'
  item.origin = 'iSpot'
  return item
}

const dwcParseiSpot = (item) => {
  const aux = {}
  aux.id = 'ispot-' + (item.ID ? item.ID : (item.data || {}).ID)
  aux.created_at = new Date(item.created * 1000)
  aux.eventDate = item.created_at
  aux.observedOn = item.created_at

  item.comments_count = item.meta.comments || 0
  item.identifications_count = item.meta.identifications || 0
  item.media_count = (item.images || []).length || 1

  aux.scientificName = (item.likely || {}).scientific_name || item.title || 'Something...'
  aux.ownerInstitutionCodeProperty = 'iSpot' // origin
  aux.origin = 'iSpot' // origin

  aux.identificationVerificationStatus = 'casual'
  aux.basisOfRecord = 'LIVING_SPECIMEN'
  aux.type = 'StillImage'
  aux.accessRight = 'not-for-profit'
  aux.license = item.license || null
  aux.rightsHolder = null //(item.user || '').login || item.user_login || null
  // aux.taxon = parseTaxon(item.taxon || {})
  aux.description = item.description || null

  aux.occurrenceStatus = 'PRESENT'

  // photos
  aux.media = (item.photos || item.observation_photos || []).map(item => ({
    type: "StillImage",
    format: "image/jpeg",
    license: item.license,
    rightsHolder: item.native_realname,
    identifier: (item.photo ? item.photo.large_url : item.large_url).replace('http:', 'https:'),
    medium_url: (item.photo ? item.photo.medium_url : item.medium_url).replace('http:', 'https:'),
    large_url: (item.photo ? item.photo.large_url : item.large_url).replace('http:', 'https:')
  }))

  // user
  aux.user = item.user || { login: item.user_login } || null

  // Location
  aux.decimalLatitude = item.latitude
  aux.decimalLongitud = item.longitude

  // comments
  aux.comments = (item.comments || []).map(item => {
    return {
      "createdAt": new Date(item.created_at),
      "updatedAt": new Date(item.updated_at),
      "id": item.id,
      "observation_id": item.observation_id,
      "origin": aux.origin,
      "user_id": item.user_id || null,
      "comment": item.body || null,
      "user": { login: (item.user || {}).login }
    }
  })
  aux.identifications = (item.identifications || []).map(item => {
    return {
      "createdAt": new Date(item.created_at),
      "updatedAt": new Date(item.updated_at),
      "id": item.id,
      "observation_id": item.observation_id,
      "origin": aux.origin,
      "taxon_id": item.taxon_id || null,
      "user_id": item.user_id || null,
      comment: item.body || null,
      user: { login: (item.user || {}).login },
      taxon: parseTaxon(item.taxon || {})
    }
  })

  return aux
}

const getGroups = (group) => {
  /*
  https://api.ispotnature.org/ispotapi/content/observations?filters=[
  {"comparator":"IN","key":"group","value":[
    {"ID":26394,"name":"Fungi+and+Lichens","slug":"fungi-and-lichens","$$hashKey":"object:1350"},
    {"ID":26392,"name":"Mammals","slug":"mammals","$$hashKey":"object:1352"},
    {"ID":26391,"name":"Amphibians+and+Reptiles","slug":"amphibians-and-reptiles","$$hashKey":"object:1347"},
    {"ID":26393,"name":"Plants","slug":"plants","$$hashKey":"object:1354"}
  ]}]&page=1
  */

  // Plantae, Animalia, Fungi, Reptilia
  const groups = group.split(',')
  return {
    "comparator":"IN",
    "key":"group",
    "value": [
      groups.includes('Fungi') && {"ID":26394,"name":"Fungi+and+Lichens","slug":"fungi-and-lichens","$$hashKey":"object:1350"},
      groups.includes('Animalia') && {"ID":26392,"name":"Mammals","slug":"mammals","$$hashKey":"object:1352"},
      groups.includes('Reptilia') && {"ID":26391,"name":"Amphibians+and+Reptiles","slug":"amphibians-and-reptiles","$$hashKey":"object:1347"},
      groups.includes('Plantae') && {"ID":26393,"name":"Plants","slug":"plants","$$hashKey":"object:1354"}
    ].filter(Boolean)
  }
}

const images = (params, size) => {
  const queryParams = params.ids.map(i => `ids%5B%5D=${i}`).join('&')
  return fetch(`https://api.ispotnature.org/ispotapi/image/bulk/${size || 'medium'}?` + queryParams, {
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
  .then(items => JSON.parse(items.split("\n")[1]))
}

const getHandler = (params, parser) => {
  const toQueryString = require('../utils/toQueryString')
  /*
    https://api.ispotnature.org/ispotapi/content/observations/gallery?filters=[
      {"comparator":"LIKE","key":"scientific_name","value":"Rosa+chinensis"},
      {"comparator":"=","key":"species_key","value":308580}
    ]&page=1
  */
  /*
    filters:[
      {"comparator":"IN","key":"group",
        "value":[{"ID":26394,"name":"Fungi+and+Lichens","slug":"fungi-and-lichens","$$hashKey":"object:1350"}]
      }
    ]
  */
  const {page, taxon_name, iconic_taxa} = params
  const q = {page}
  if (params.taxon_name) {
    q.filters = q.filters || []
    q.filters.push({"comparator":"LIKE","key":"scientific_name","value": params.taxon_name})
  }
  if (params.scientificName) {
    q.filters = q.filters || []
    q.filters.push({"comparator":"LIKE","key":"scientific_name","value": params.scientificName})
  }
  if (params.iconic_taxa) {
    q.filters = q.filters || []
    q.filters.push(getGroups(params.iconic_taxa))
  }
  if (params.kingdom) {
    q.filters = q.filters || []
    q.filters.push(getGroups(params.kingdom))
  }
  const qp = q.filters ? toQueryString({...q, filters: JSON.stringify(q.filters)}) : toQueryString(q)

  console.log(q.filters)
  return fetch("https://api.ispotnature.org/ispotapi/content/observations/gallery" + qp, {
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
    const res = JSON.parse(items.split("\n")[1])
    return res.data.map(parser)
  })
}

const get = async (req, res) => {
  const params = req.query || {}


  if (req.path.includes('/export')) {
    delete params.page
    delete params.perPage
    // params.perPage = 200
  }
  if (params.ownerInstitutionCodeProperty) {
    params.origin = params.ownerInstitutionCodeProperty
  }
  if (params.origin === 'ispot')
    return getHandler(params, parseiSpot)
  else return []
}

const dwcGet = async (req, res) => {
  const params = req.query || {}


  if (params.ownerInstitutionCodeProperty) {
    params.origin = params.ownerInstitutionCodeProperty
  }
  if (params.origin === 'ispot')
    return getHandler(params, dwcParseiSpot)
  else return []
}

// CUSTOM REST
const comments = async (id) => {
  console.log(`commentsURl => https://api.ispotnature.org/ispotapi/content/comments?entity_ID=${id}&page=1`)
  return fetch(`https://api.ispotnature.org/ispotapi/content/comments?entity_ID=${id}&page=1`, {
    headers: {
      "authority": "api.ispotnature.org",
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9,es-ES;q=0.8,es;q=0.7,fr;q=0.6",
      "ispot-community": "21285",
      "ispot-language": "en",
      "ispot-origin": "b60e4df368c3187f848f496b0753f1fd1acea0f6",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36",
      "ispot-token": "null",
      "origin": "https://www.ispotnature.org",
      "ispot-community": "26395",
      "ispot-language": "en",
      "ispot-origin": "b60e4df368c3187f848f496b0753f1fd1acea0f6",
      "ispot-token": "null",
      "Cookie": "__cfduid=d7c9f8ac36c19683ff64c545349637e271600365161; _ga=GA1.2.63808785.1600365164; _gid=GA1.2.1538649754.1601375706; ispot_session=eyJpdiI6IkwxXC9aNGdEUVphdFRUeVZoTzdNbEZ3PT0iLCJ2YWx1ZSI6ImZDeGdQWk10Uk03VHk2cm5xV0hraXhCWTlseG41Y1BhTzZwSkY3TXhOckd1eisxejluOVwva045UDIzV1wvY01WamRMRmJ4SXpxQXBcL0dKOVl2aENLYStnPT0iLCJtYWMiOiIxOTUyZjgyYjIzYTU4ZmVmM2M5MDIyYmU4YzgxZjZiZTZiNzcxY2VmYmUxODllYjI0ODc5ZTkxNGI3N2YzYjM4In0%3D; _gat=1"
    },
    referrer: "https://www.ispotnature.org/",
    referrerPolicy: "no-referrer-when-downgrade",
    body: null,
    method: "GET"
  })
  .then(res => res.text())
  .then(items => {
    return JSON.parse(items.split("\n")[1])
  })
  .then(res => res.data.map(item => {
    console.log('comments =>', item)
    return {
      id: item.ID,
      user: {
        ...(item.author || {}),
        name: (item.author || {}).first_name
      },
      body: item.comment,
      created_at: new Date(item.created).toISOString()
    }
  }))
}

module.exports = { get, dwcGet, images, parseiSpot, comments }
