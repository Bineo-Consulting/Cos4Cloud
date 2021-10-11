class PlantnetService {
  static get() {
    return []
  }
  static dwcGet() {
    return []
  }

  static getById(req, res) {
    const fetch = require('node-fetch')
    const id = req.path.split('/').filter(Boolean).pop().split('-').filter(Boolean).pop()
    const token = '2b10bmIKkNNcBL6D4jwq3il4rO'
    const url = 'https://my-api.plantnet.org/v2/dwc'
    
    return fetch(`${url}/occurrence/${id}?api-key=${token}`, {
      headers: {
        'content-type': 'application/json'
      }
    })
    .then(r => r.json())
    .then(res => {
      if (res.statusCode === 404) {
        return []
      }
      return this.parsePlantnet(res);
    })
  }

  static mapping(item) {
    item.id = `${item.id}`.includes('-') ? item.id : `plantnet-${item.id}`
    item.eventDate = new Date(item.eventDate)
    item.created_at = item.eventDate
    item.observedOn = item.eventDate

    item.ownerInstitutionCodeProperty = 'plantnet'
    item.origin = 'plantnet'
    return item
  }
}

PlantnetService.config = {
  token: '2b10bmIKkNNcBL6D4jwq3il4rO',
  host: 'https://my-api.plantnet.org/v2'
}

module.exports = PlantnetService
