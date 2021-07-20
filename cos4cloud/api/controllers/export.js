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

  const items = await MappingService.get(req, res)

  const csv = download(items)
  return res.send(csv)
}
module.exports = { exportReq }
