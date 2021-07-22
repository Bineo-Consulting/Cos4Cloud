const observation = (req, res) => {
  const MappingService = require('../../services/mapping.service')
  return MappingService.getById(req, res).then(aux => res.json(aux))
}
module.exports = { observation }