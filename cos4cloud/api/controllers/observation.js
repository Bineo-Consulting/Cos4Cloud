const MappingService = require('../../services/mapping.service')

const observation = (req, res) => {
  const params = req.query;
  MappingService.getById(req.path, params).then(aux => res.json(aux))
}
module.exports = {observation}