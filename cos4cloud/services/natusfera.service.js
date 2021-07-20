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
const parseNatusfera = (item) => {
  item.id = `${item.id}`.includes('-') ? item.id : `natusfera-${item.id}`
  item.created_at = new Date(item.created_at)
  item.date = new Date(item.created_at)
  item.$$date = item.created_at
  item.$$species_name = item.species_name || (item.taxon || {}).name || 'Something...'
  item.identifications_count = item.identifications_count || 0
  item.user_name = (item.user || {}).login

  item.$$photos = (item.photos || item.observation_photos || []).map(item => ({
    medium_url: (item.photo ? item.photo.medium_url : item.medium_url).replace('http:', 'https:'),
    large_url: (item.photo ? item.photo.large_url : item.large_url).replace('http:', 'https:')
  }))
  item.medium_url = item.$$photos.slice(0, 1).map(photo => {
    return photo.medium_url
  })[0]
  item.large_url = item.$$photos.slice(0, 1).map(photo => {
    return photo.large_url
  })[0]

  item.origin = 'Natusfera'
  return item
}
const getHandler = (params, parser) => {
  const fetch = require('node-fetch')
  const toQueryString = require('../utils/toQueryString')

  const qp = params ? toQueryString({
    ...params,
    perPage: null,
    origin: null,
    page: Number(params.page || 0) + 1
  }) : ''
  const perPage = params.perPage || params.per_page || 30

  console.log({perPage})

  console.log('https://natusfera.gbif.es/observations.json' + qp + `&per_page=${perPage}`)
  return fetch('https://natusfera.gbif.es/observations.json' + qp + `&per_page=${perPage}`)
  .then(res => res.json())
  .then(items => {
    return items.map(parser)
  })
}

const get = (req, res) => {
  const params = req.query || {}

  if (req.path.includes('/export')) {
    delete params.page
    delete params.perPage
    params.perPage = 200
  }
  return getHandler(params, parseNatusfera)
}

const dwcGet = (req, res) => {
  const params = req.query || {}
  if (params.identificationVerificationStatus) {
    params.quality_grade = params.identificationVerificationStatus
    delete params.identificationVerificationStatus
  }
  return getHandler(params, dwcParseNatusfera)
}

const getById = (req, res) => {
  const id = req.path.split('/').filter(Boolean).pop().split('-').filter(Boolean).pop()
  console.log({id})
  const fetch = require('node-fetch')
  return fetch(`https://natusfera.gbif.es/observations/${id}.json`)
  .then(res => res.json())
  .then(item => parseNatusfera(item))
  .then(r => res.send(r))
}

const dwcGetById = (req, res) => {
  const id = req.path.split('/').filter(Boolean).pop().split('-').filter(Boolean).pop()
  console.log({id})
  const fetch = require('node-fetch')
  return fetch(`https://natusfera.gbif.es/observations/${id}.json`)
  .then(res => res.json())
  .then(item => dwcParseNatusfera(item))
  .then(r => res.send(r))
}

module.exports = { get, dwcGet, getById, dwcGetById }
