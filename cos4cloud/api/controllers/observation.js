const observation = (req, res) => {
  const MappingService = require('../../services/mapping.service')
  return MappingService.getById(req, res)
}
module.exports = { observation }