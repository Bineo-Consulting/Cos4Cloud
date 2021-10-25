const Mongo = require('../../services/mongo.service')

// aux.id = `${item.id}`.includes('-') ? item.id : `natusfera-${item.id}`
// aux.eventDate = new Date(item.created_at)
// aux.created_at = new Date(item.created_at) // for sorting
// aux.observedOn = new Date(item.observed_on) // for sorting

// aux.scientificName = item.species_name || (item.taxon || {}).name || 'Something...'
// aux.ownerInstitutionCodeProperty = 'Natusfera' // origin
// aux.origin = 'Natusfera' // origin

// aux.identificationVerificationStatus = item.quality_grade
// aux.basisOfRecord = 'LIVING_SPECIMEN'
// aux.type = 'StillImage'
// aux.accessRight = 'not-for-profit'
// aux.license = item.license || null
// aux.rightsHolder = (item.user || '').login || item.user_login || null
// aux.taxon = parseTaxon(item.taxon || {})
// aux.description = item.description || null

// aux.occurrenceStatus = 'PRESENT'

// // photos
// aux.media = (item.photos || item.observation_photos || []).map(item => ({
//   type: "StillImage",
//   format: "image/jpeg",
//   license: item.license,
//   rightsHolder: item.native_realname,
//   identifier: (item.photo ? item.photo.large_url : item.large_url).replace('http:', 'https:'),
//   medium_url: (item.photo ? item.photo.medium_url : item.medium_url).replace('http:', 'https:'),
//   large_url: (item.photo ? item.photo.large_url : item.large_url).replace('http:', 'https:')
// }))

// // user
// aux.user = item.user || { login: item.user_login } || null

// // Location
// aux.decimalLatitude = item.latitude
// aux.decimalLongitude = item.longitude

const header = [
  'id',
  'eventDate',
  'media.0.medium_url',
  'media.0.large_url',
  'scientificName',
  'ownerInstitutionCodeProperty',
  'identifications_count',
  'photos_count',
  'decimalLongitude',
  'decimalLatitude',
  'rightsHolder'
]
const headerDwc = [
  'key',
  'eventDate',
  'mediumUrl',
  'largeUrl',
  'scientificName',
  'ownerInstitutionCodeProperty',
  'identificationsCount',
  'mediaCount',
  'decimalLongitude',
  'decimalLatitude',
  'rightsHolder'
]

const download = (items) => {
  if (items) {
    const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
    const csv = [
      headerDwc.join(','), // header row first
      ...items.map(row => header.map(fieldName => {
        const keys = fieldName.split('.')
        let val = row
        keys.map(key => {
         if (val) val = val[key]
        })
        console.log(keys, val)
        return JSON.stringify(val, replacer)
      }).join(','))
    ].join('\r\n')
    return csv
  } return []
}
 
const exportReq = async (req, res) => {
  const MappingService = require('../../services/mapping.service')

  delete req.query.page

  if (req.query.did) {
    await Mongo.update('downloads', {
      updated_at: new Date(),
      user_id: req.headers.sub,
      path: req.path,
      query: req.query,
      id: req.query.did
    })
  } else if (req.headers.sub) {
    await Mongo.update('downloads', {
      created_at: new Date(),
      updated_at: new Date(),
      user_id: req.headers.sub,
      reason: req.headers.reason ? req.headers.reason.split(',') : null,
      path: req.path,
      query: req.query
    })
  }

  const items = await MappingService.get(req, res)

  const csv = download(items)
  return res.send(csv)
}
module.exports = { exportReq }
