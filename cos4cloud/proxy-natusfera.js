const http = require('http')
const fetch = require('node-fetch');

const config = {
  url: 'https://natusfera.gbif.es'
}

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

const parseTaxon = (taxon) => {
  return {
    "id": taxon.id || null,
    "ancestry": taxon.ancestry || null,
    "rank": taxon.rank || null,
    "rank_level": taxon.rank_level || null,
    "kingdom": taxon.kingdom || taxon.iconic_taxon_name || null,
    "phylum": taxon.phylum || null,
    "class": taxon.class || null,
    "order": taxon.order || null,
    "family": taxon.family || null,
    "genus": taxon.genus || null,
    "name": taxon.name || null,

    "url": taxon.image_url || null,
    "common_name": taxon.common_name || null,
    "createdAt": new Date(taxon.created_at || null)
  }
}

const dwcParseNatusfera = (item) => {
  const aux = {}
  aux.projects = item.project_observations ? (item.project_observations || []).map(i => i.project_id) : null // only natusfera
  aux.id = `${item.id}`.includes('-') ? item.id : `natusfera-${item.id}`
  aux.eventDate = new Date(item.created_at)
  aux.created_at = new Date(item.created_at) // for sorting
  aux.observedOn = new Date(item.observed_on) // for sorting

  aux.scientificName = item.species_name || (item.taxon || {}).name || 'Something...'
  aux.ownerInstitutionCodeProperty = 'Natusfera' // origin
  aux.origin = 'Natusfera' // origin

  aux.identificationVerificationStatus = item.quality_grade
  aux.basisOfRecord = 'LIVING_SPECIMEN'
  aux.type = 'StillImage'
  aux.accessRight = 'not-for-profit'
  aux.license = item.license || null
  aux.rightsHolder = (item.user || '').login || item.user_login || null
  aux.taxon = parseTaxon(item.taxon || {})
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
  aux.decimalLatitude = item.latitude || item.latitud
  aux.decimalLongitude = item.longitude || item.longitud

  // comments
  aux.comments = (item.comments || [])
  .map(item => {
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
  aux.identifications = (item.identifications || [])
  .map(item => {
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

const parseQuery = (url) => {
  const Url = require('url');
  const q = {...Url.parse(url, true).query}

  if (q.perPage) {
    q.per_page = q.perPage
  }
  if (q.identificationVerificationStatus) {
    q.quality_grade = q.identificationVerificationStatus
    delete q.identificationVerificationStatus
  }
  if (q.scientificName) {
    q.taxon_name = q.scientificName.replace(' L.', '')
    delete q.scientificName
  }
  if (q.iconic_taxa) {
    q.iconic_taxa = toTitleCase(q.iconic_taxa || '')
  }
  if (q.kingdom) {
    q.iconic_taxa = toTitleCase(q.kingdom || '')
    delete q.kingdom
  }
  if (q.hasCoordinate) {
    const has = (q.has || '').split(',').filter(Boolean)
    has.push('geo')
    q.has = has.join(',')
    delete q.hasCoordinate
  }

  // Id_please
  if (q.hasIdentification) {
    const has = (q.has || '').split(',').filter(Boolean)
    has.push('id_please')
    q.has = has.join(',')
    delete q.hasIdentification
  } else if (q.taxonKey == '0') {
    const has = (q.has || '').split(',').filter(Boolean)
    has.push('id_please')
    q.has = has.join(',')
    delete q.taxonKey
  } else if (q.issue === 'TAXON_MATCH_NONE') {
    const has = (q.has || '').split(',').filter(Boolean)
    has.push('id_please')
    q.has = has.join(',')
    delete q.issue
  }

  // location
  if (q.decimalLongitude && q.decimalLongitude.includes(',')) {
    const [swlng, nelng] = q.decimalLongitude.split(',')
    const [swlat, nelat] = q.decimalLatitude.split(',')

    q.swlat = swlat
    q.swlng = swlng
    q.nelat = nelat
    q.nelng = nelng
    delete q.decimalLongitude
    delete q.decimalLatitude
  }

  if (q.minEventDate) {
    q.created_after = q.minEventDate
  }
  if (q.maxEventDate) {
    q.created_before = q.maxEventDate
  }

  return q
}

const toQueryString = object => '?' + Object.keys(object)
  .map(key => object[key] && `${key}=${encodeURIComponent(object[key].toString())}`)
  .filter(Boolean)
  .join('&');

const get = (path) => {
  const url = `${config.url}/${path}`
  return fetch(url)
  .then(res => res.json())
  .then(items => {
    if (items.splice) return items.map(dwcParseNatusfera)
    else return dwcParseNatusfera(items)
  })
}

const requestListener = async (req, res) => {
  res.writeHead(200);
  let path = req.url
    .replace('occurrences', 'observations')
    .replace('occurrence', 'observations')
    .replace('/search', '').split('/').filter(Boolean).join('/')
  path = path.includes('?') ? `${path.split('?')[0]}.json` : `${path}.json`


  if (req.url.includes('?')) {
    const qp = parseQuery(req.url)
    path += toQueryString(qp)
  }
  if (path.includes('observations')) {
    const aux = await get(path)
    res.end(JSON.stringify(aux));
  }
  res.end('[]');
}

const server = http.createServer(requestListener);
server.listen(9090);
console.log('Listening on 9090 ☎️')
