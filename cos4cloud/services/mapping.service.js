const fetch = require('node-fetch')
const toQueryString = require('../utils/toQueryString')
const ISpotService = require('./ispot.service')
const ArtPortalenService = require('./artportalen.service')
const NatusferaService = require('./natusfera.service')
const PlantnetService = require('./plantnet.service')
const originsConfig = require('../origins')
const flat = require('../utils/flat')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const getResourceId = (path) => {
  return (path || '/').split('/').filter(Boolean)
}
const bbox2wkt = ([
  swlng,
  swlat,
  nelng,
  nelat]) => {
  return `POLYGON((${swlng} ${nelat}, ${nelng} ${nelat}, ${nelng} ${swlat}, ${swlng} ${swlat}, ${swlng} ${nelat}))`
}

const parseQuery = (query, origin) => {
  if (query.perPage) {
    query.per_page = Number(query.perPage)
  }
  if (origin === 'gbif') {
    if (query.per_page) {
      query.limit = Number(query.per_page)
    }
    if (query.page) {
      query.offset = Number(query.page) * (query.limit || 20)
    }
    if (query.iconic_taxa) {
      query.q = query.iconic_taxa
    }
    // location
    if (query.swlat) {
      query.geometry = bbox2wkt([
        query.swlng,
        query.swlat,
        query.nelng,
        query.nelat,
      ])
    }
    if (query.decimalLongitude && query.decimalLongitude.includes(',')) {
      const [swlng, nelng] = query.decimalLongitude.split(',')
      const [swlat, nelat] = query.decimalLatitude.split(',')

      query.geometry = bbox2wkt([swlng, swlat, nelng, nelat])
      delete query.decimalLongitude
      delete query.decimalLatitude
    }

  }
  if (query.taxon_name) {
    query.scientificName = query.taxon_name
    delete query.taxon_name
  }
  if (origin === 'plantnet') {
    query['api-key'] = '2b10bmIKkNNcBL6D4jwq3il4rO'
    if (query.decimalLongitude && query.decimalLongitude.includes(',')) {
      const [minDecimalLongitude, maxDecimalLongitude] = query.decimalLongitude.split(',')
      const [minDecimalLatitude, maxDecimalLatitude] = query.decimalLatitude.split(',')
      query.minDecimalLongitude = minDecimalLongitude
      query.maxDecimalLongitude = maxDecimalLongitude
      query.minDecimalLatitude = minDecimalLatitude
      query.maxDecimalLatitude = maxDecimalLatitude

    }
    delete query.decimalLongitude
    delete query.decimalLongitud
    delete query.decimalLatitude
    delete query.origin
    delete query.place
    delete query.ownerInstitutionCodeProperty
    delete query.iconic_taxa
  }
  if (query.quality_grade) {
    query.identificationVerificationStatus = query.quality_grade
    delete query.quality_grade
  }
  if (query.license) {
    query.license = query.license.toLowerCase()
  }

  return { ...query }
}

module.exports = class MappingService {

  static get(req, res) {
    const path = req.path

    const promises = []
    if (req.path.includes('/dwc/') || req.path.includes('/export')) {
      promises.push(this.dwcGet(req, res))
      // promises.push(NatusferaService.dwcGet(req, res))
      // promises.push(PlantnetService.dwcGet(req, res))
      promises.push(ISpotService.dwcGet(req, res))
      promises.push(ArtPortalenService.dwcGet(req, res))
    } else {
      promises.push(NatusferaService.get(req, res))
      // promises.push(PlantnetService.get(req, res))
      promises.push(ISpotService.get(req, res))
      promises.push(ArtPortalenService.get(req, res))
    }

    return Promise.all(promises).then((res) => {
      const aux = []
      res.filter(Boolean).map(i => aux.push(...i))
      return aux.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    })
  }

  static async dwcGet(req, res) {
    const origin = req.query.ownerInstitutionCodeProperty || req.query.origin || ''
    const origins = origin.split(',').filter(Boolean)
    if (origins.length === 0) origins.push('natusfera')

    const promises = origins.map(ogn => {
      if (originsConfig[ogn]) {
        if (ogn === 'plantnet' && req.query.iconic_taxa && !req.query.iconic_taxa.includes('plantae')) {
          return []
        }
        const originConfig = originsConfig[ogn]
        const originHeader = originsConfig[ogn].header || {}
        let path = req.path.replace('/dwc', '').replace('/api', '')
        let [resource, id] = getResourceId(path)
        if (resource && id && originConfig.observation) {
          path = originConfig.observation(id)
        }
        if (resource && !id && originConfig.observations) {
          path = originConfig.observations()
        }
        const query = parseQuery(req.query || {}, ogn)


        return fetch(`${originConfig.url}${path}${toQueryString(query)}`, {header: originHeader})
        .then(res => res.json())
        .then(res => {
          const mapp = originConfig.mapping || ((i) => i)
          if (res && res.results) return res.results.map(mapp)
          if (res && res.observations) return res.observations.map(mapp)
          else return res.map(mapp)
        })
      }
      return []
    })

    return Promise.all(promises).then(flat)
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
      .then(ISpotService.parseiSpot)
      const imageFetch = ISpotService.images({ids: [id]}, 'large')
      .then(res => {
        return [{
          small_url: res.data[id].src,
          medium_url: res.data[id].src,
          large_url: res.data[id].src
        }]
      })
      const commentsFetch = ISpotService.comments(id)
      return ISpotService.parseiSpot({
        ...(await itemFetch),
        photos: await imageFetch,
        comments: await commentsFetch
      })
    } else if (path.includes('artportalen')) {
      const id = path.split('/').filter(Boolean).pop().split('-').filter(Boolean).pop()
      return ArtPortalenService.getById(id)
    // } else if (path.includes('plantnet')) {
      // const id = path.split('/').filter(Boolean).pop().split('-').filter(Boolean).pop()
      // return this.getPlantnetById(id)
      // return PlantnetService.getById(req, res)
    } else { // general
      return req.path.includes('/dwc/') ? this.dwcGetById(req, res) : NatusferaService.getById(req, res)
    }
  }

  static async dwcGetById(req, res) {
    let [ogn, id] = req.path.split('/').filter(Boolean).pop().split('-').filter(Boolean);
    [ogn, id] = id ? [ogn, id] : ['natusfera', ogn]

    if (originsConfig[ogn]) {
      const originConfig = originsConfig[ogn]
      const originHeader = originsConfig[ogn].header || {}
      let path = req.path.replace('/dwc', '').replace('observations', 'occurrence').replace('/api', '').replace(`${ogn}-`, '')
      let [resource, id] = getResourceId(path)
      if (resource && id && originConfig.observation) {
        path = originConfig.observation(id)
      }
      if (resource && !id && originConfig.observations) {
        path = originConfig.observations()
      }
      return fetch(`${originConfig.url}${path}?api-key=2b10bmIKkNNcBL6D4jwq3il4rO`, originHeader)
      .then(res => res.json())
      .then(res => {
        const mapp = originConfig.mapping || ((i) => i)
        return mapp(res)
      })
    }
    return {}
  }

  static getPlantnet(queryParams, params) {
    if (params.has === 'geo' || params.hasCoordinate) return []
    const token = '2b10bmIKkNNcBL6D4jwq3il4rO'
    const url = 'https://my-api.plantnet.org/v2'
    const identified = {
      '': 'all',
      research: 'identified',
      casual: 'unidentified'
    }
    const iconic_taxa = (params.iconic_taxa || '').toLowerCase()
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
