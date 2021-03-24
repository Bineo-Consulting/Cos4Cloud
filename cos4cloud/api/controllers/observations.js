const MappingService = require('../../services/mapping.service')

const observations = (req, res) => {
  const params = req.query;
  MappingService.get(params).then(aux => res.json(aux))
}
module.exports = {observations}