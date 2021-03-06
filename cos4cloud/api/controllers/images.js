const images = (req, res) => {
  const MappingService = require('../../services/mapping.service')
  const params = {
    ids: req.query.ids.split(',')
  }

  return MappingService.images(params)
  .then(r => res.json([r]))
  .catch((error) => {
    return res.send('Error')
  })
}
module.exports = {images}