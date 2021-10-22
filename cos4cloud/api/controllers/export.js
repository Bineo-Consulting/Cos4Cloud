const Mongo = require('../../services/mongo.service')
const header = [
  'id',
  'created_at',
  // 'created_at',
  'medium_url',
  'large_url',
  'species_name',
  'origin',
  'identifications_count',
  'observation_photos_count',
  'longitude',
  'latitude',
  'user_name'
]
const headerDwc = [
  'key',
  'eventDate',
  // 'created_at',
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
      ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n')
    return csv
  } return []
}
 
const exportReq = async (req, res) => {
  const MappingService = require('../../services/mapping.service')

  if (req.query.did) {
    await Mongo.update('downloads', {
      updated_at: new Date(),
      user_id: req.headers.sub,
      path: req.path,
      query: req.query,
      id: req.query.did
    })
  } else {
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
