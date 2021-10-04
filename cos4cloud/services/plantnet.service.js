class PlantnetService {
  static get() {
    return []
  }
  static dwcGet() {
    return []
  }

  static getById(req, res) {
    const id = req.path.split('/').filter(Boolean).pop().split('-').filter(Boolean).pop()
    const token = '2b10JYMpxAexS5HynCQCFpn6j'
    const url = 'https://my-api.plantnet.org:444/v2'
    
    return fetch(`${url}/observations/${id}?api-key=${token}`, {
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
  token: '2b10JYMpxAexS5HynCQCFpn6j',
  host: 'https://my-api.plantnet.org:444/v2'
}

module.exports = PlantnetService
