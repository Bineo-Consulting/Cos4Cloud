const fetch = require('node-fetch')
const toQueryString = require('../utils/toQueryString')
const ISpotService = require('./ispot.service')
const ArtPortalenService = require('./artportalen.service')
const NatusferaService = require('./natusfera.service')
const PlantnetService = require('./plantnet.service')

module.exports = class MappingService {

  static get(req, res) {
    const path = req.path

    const promises = []
    if (req.path.includes('/dwc/')) {
      promises.push(NatusferaService.dwcGet(req, res))
      promises.push(PlantnetService.dwcGet(req, res))
      promises.push(ISpotService.dwcGet(req, res))
    } else {
      promises.push(NatusferaService.get(req, res))
      promises.push(PlantnetService.get(req, res))
      promises.push(ISpotService.get(req, res))
    }

    return Promise.all(promises).then((res) => {
      const aux = []
      res.filter(Boolean).map(i => aux.push(...i))
      return aux.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
    })
  }

  static async getById(req, res) {
    const path = req.path
    if (path.includes('ispot')) {
      const id = path.split('/').filter(Boolean).pop().split('-').filter(Boolean).pop()
      const itemFetch = fetch('https://api.ispotnature.org/ispotapi/content/observations?ID=' + id, {
        headers: {
          "authority": "api.ispotnature.org",
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9,es-ES;q=0.8,es;q=0.7,fr;q=0.6",
          "ispot-community": "21285",
          "ispot-language": "en",
          "ispot-origin": "b60e4df368c3187f848f496b0753f1fd1acea0f6",
          "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36",
          "ispot-token": "null",
          "origin": "https://www.ispotnature.org",
          "Cookie": "__cfduid=d7c9f8ac36c19683ff64c545349637e271600365161; _ga=GA1.2.63808785.1600365164; _gid=GA1.2.1538649754.1601375706; ispot_session=eyJpdiI6IkwxXC9aNGdEUVphdFRUeVZoTzdNbEZ3PT0iLCJ2YWx1ZSI6ImZDeGdQWk10Uk03VHk2cm5xV0hraXhCWTlseG41Y1BhTzZwSkY3TXhOckd1eisxejluOVwva045UDIzV1wvY01WamRMRmJ4SXpxQXBcL0dKOVl2aENLYStnPT0iLCJtYWMiOiIxOTUyZjgyYjIzYTU4ZmVmM2M5MDIyYmU4YzgxZjZiZTZiNzcxY2VmYmUxODllYjI0ODc5ZTkxNGI3N2YzYjM4In0%3D; _gat=1"
        },
        referrer: "https://www.ispotnature.org/",
        referrerPolicy: "no-referrer-when-downgrade",
        body: null,
        method: "GET"
      })
      .then(res => res.text())
      .then(items => JSON.parse(items.split('\n')[1]).data)
      .then(this.parseiSpot)
      const imageFetch = this.images({ids: [id]}, 'large')
      .then(res => {
        return [{
          small_url: res.data[id].src,
          medium_url: res.data[id].src,
          large_url: res.data[id].src
        }]
      })
      const commentsFetch = this.comments(id)
      return this.parseiSpot({
        ...(await itemFetch),
        photos: await imageFetch,
        comments: await commentsFetch
      })
    } else if (path.includes('artportalen')) {
      const id = path.split('/').filter(Boolean).pop().split('-').filter(Boolean).pop()
      return ArtPortalenService.getById(id)
    } else if (path.includes('plantnet')) {
      const id = path.split('/').filter(Boolean).pop().split('-').filter(Boolean).pop()
      return this.getPlantnetById(id)
    } else { // natusfera
      if (req.path.includes('/dwc/')) {
        return NatusferaService.dwcGetById(req, res)
      } else return NatusferaService.getById(req, res)
    }
  }

  static async comments(id) {
    console.log(`commentsURl => https://api.ispotnature.org/ispotapi/content/comments?entity_ID=${id}&page=1`)
    return fetch(`https://api.ispotnature.org/ispotapi/content/comments?entity_ID=${id}&page=1`, {
      headers: {
        "authority": "api.ispotnature.org",
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9,es-ES;q=0.8,es;q=0.7,fr;q=0.6",
        "ispot-community": "21285",
        "ispot-language": "en",
        "ispot-origin": "b60e4df368c3187f848f496b0753f1fd1acea0f6",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36",
        "ispot-token": "null",
        "origin": "https://www.ispotnature.org",
        "ispot-community": "26395",
        "ispot-language": "en",
        "ispot-origin": "b60e4df368c3187f848f496b0753f1fd1acea0f6",
        "ispot-token": "null",
        "Cookie": "__cfduid=d7c9f8ac36c19683ff64c545349637e271600365161; _ga=GA1.2.63808785.1600365164; _gid=GA1.2.1538649754.1601375706; ispot_session=eyJpdiI6IkwxXC9aNGdEUVphdFRUeVZoTzdNbEZ3PT0iLCJ2YWx1ZSI6ImZDeGdQWk10Uk03VHk2cm5xV0hraXhCWTlseG41Y1BhTzZwSkY3TXhOckd1eisxejluOVwva045UDIzV1wvY01WamRMRmJ4SXpxQXBcL0dKOVl2aENLYStnPT0iLCJtYWMiOiIxOTUyZjgyYjIzYTU4ZmVmM2M5MDIyYmU4YzgxZjZiZTZiNzcxY2VmYmUxODllYjI0ODc5ZTkxNGI3N2YzYjM4In0%3D; _gat=1"
      },
      referrer: "https://www.ispotnature.org/",
      referrerPolicy: "no-referrer-when-downgrade",
      body: null,
      method: "GET"
    })
    .then(res => res.text())
    .then(items => {
      return JSON.parse(items.split("\n")[1])
    })
    .then(res => res.data.map(item => {
      console.log('comments =>', item)
      return {
        id: item.ID,
        user: {
          ...(item.author || {}),
          name: (item.author || {}).first_name
        },
        body: item.comment,
        created_at: new Date(item.created).toISOString()
      }
    }))
  }

  static getNatusfera(queryParams, params) {
    const qp = params ? toQueryString({
      ...params,
      perPage: null,
      origin: null,
      page: Number(params.page || 0) + 1
    }) : ''
    const perPage = params.perPage || 30

    console.log('https://natusfera.gbif.es/observations/project/1252.json' + qp + `&per_page=${perPage}`)
    return fetch('https://natusfera.gbif.es/observations/project/1252.json' + qp + `&per_page=${perPage}`)
    .then(res => res.json())
    .then(items => items.map(this.parseNatusfera))
  }

  static getPlantnet(queryParams, params) {
    if (params.has === 'geo') return []
    const token = '2b10JYMpxAexS5HynCQCFpn6j'
    const url = 'https://my-api.plantnet.org:444/v2'
    const identified = {
      '': 'all',
      research: 'identified',
      casual: 'unidentified'
    }
    const iconic_taxa = (params.iconic_taxa || '').toLowerCase()
    console.log({iconic_taxa})
    if (iconic_taxa && !iconic_taxa.includes('plantae')) {
      return []
    }
    const _p = JSON.parse(JSON.stringify({
      identified: identified[params.quality_grade] || undefined,
      species: params.taxon_name || undefined,
      page: params.page,
      'api-key': token
    }))
    const p = toQueryString(_p)
    console.log(`${url}/observations${p}`)

    return fetch(`${url}/observations${p}`, {
      headers: {
        'content-type': 'application/json'
      }
    })
    .then(r => r.json())
    .then(res => {
      if (res.statusCode === 404) {
        return []
      }
      return res.observations.map(this.parsePlantnet);
    })
  }

  static getPlantnetById(id) {
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

  static parseNatusfera(item) {
    item.id = `${item.id}`.includes('-') ? item.id : `natusfera-${item.id}`
    item.created_at = new Date(item.created_at)
    item.$$date = (item.created_at)
    item.$$species_name = item.species_name || (item.taxon || {}).name || 'Something...'
    item.origin = 'Natusfera'
    return item
  }

  static parsePlantnet(item) {
    item.id = 'plantnet-' + item.id
    item.created_at = new Date(item.dateObs || item.dateUpdated)
    item.comments_count = 0
    item.identifications_count = 0
    item.observation_photos_count = (item.images || []).length || 1
    item.comments = []
    item.identifications = []
    item.longitude = 0
    item.latitude = 0
    item.photos = [
      ...(item.images || []).map(i => ({
        small_url: i.s,
        medium_url: i.m,
        large_url: i.o,
        original_url: i.o
      }))
    ]
    item.quality_grade = item.isValid && item.isRevised ? 'research' : 'casual'
    item.species_name = (item.species || {}).name || item.submittedName || 'Something...'
    item.origin = 'plantnet'
    return item
  }

}
