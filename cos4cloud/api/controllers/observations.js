const observations = (req, res) => {
  const MappingService = require('../../services/mapping.service')
  return MappingService.get(req, res).then(aux => res.json(aux))
}
module.exports = { observations }
