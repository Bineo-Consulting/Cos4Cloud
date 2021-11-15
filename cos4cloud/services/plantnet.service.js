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

  /*
  "votes": [
    {
      "determination":null,
      "count":1,
      "score":50.63,
    },
    {
      "determination":"Nelumbo nucifera Gaertn.",
      "count":2,
      "score":18.89,
      "selected":true,
    },
    {
      "determination":"Nymphaea rubra Roxb. ex Salisb.",
      "count":1,
      "score":11.57,
    }
  ]

  "createdAt":"2021-10-13T14:49:33.000Z",
  "updatedAt":"2021-10-13T14:49:33.000Z",
  "id":19625,
  "origin":"Natusfera",
  "user_id":1,
  "comment":"comment v1",
  "user":{
    "login":"c4c",
  }

  */

  static mapping(item) {
    item.id = `${item.id}`.includes('-') ? item.id : `plantnet-${item.id}`
    item.eventDate = new Date(item.eventDate)
    item.created_at = item.eventDate
    item.observedOn = item.eventDate

    item.ownerInstitutionCodeProperty = 'plantnet'
    item.origin = 'plantnet'
    if (item.votes) {
      item.identifications = Object.values(item.votes).filter(i => i.determination).map(i => {
        return {
          id: i.score,
          origin: 'plantnet',
          user_id: 1,
          taxon: { name: `${i.determination} (${i.score}%)` },
          user: {
            login: 'c4c',
            name: 'c4c'
          }
        }
      }).sort((a, b) => b.score - a.score).filter(Boolean)
      item.identifications_count = item.identifications.length
    }
    item.comments = []
    item.comments_count = 0
    return item
  }
}

PlantnetService.config = {
  token: '2b10bmIKkNNcBL6D4jwq3il4rO',
  host: 'https://my-api.plantnet.org/v2'
}

module.exports = PlantnetService
