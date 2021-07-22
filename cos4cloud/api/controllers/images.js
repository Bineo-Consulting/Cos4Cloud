const images = (req, res) => {
  const ISpotService = require('../../services/ispot.service')
  const params = {
    ids: req.query.ids.split(',')
  }

  return ISpotService.images(params)
  .then(r => res.json([r]))
  .catch((error) => {
    return res.send('Error')
  })
}
module.exports = {images}