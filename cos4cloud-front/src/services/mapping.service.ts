import { toQueryString } from '../utils/to-query-string';
import { timeAgo } from '../utils/time-ago';
import resources from '../resources'
import { downloadFile } from '../utils/download-file'

// const url = 'https://natusfera.gbif.es/observations.json'
// const url = 'http://81.169.128.191:10010/observations'
// const url = 'http://localhost:5001/observations'
// const urliSpot = 'http://localhost:5001/images'

const cloudHost = 'https://cos4bio.eu/api'
const host = resources.host || cloudHost
const url = `${host}/dwc/observations`
const urliSpot = `${host}/images`

const parseCommentsDwc = (items) => {
  return items.map(identification => {
    const c = {...identification}
    c.$$date = timeAgo(c.created_at)
    c.taxon = { name: c.taxon }
    c.user = c.user
    c.comment = c.body
    return c
  }).sort((a:any, b:any) => Date.parse(a.created_at) - Date.parse(b.created_at))
}

const parseDwc = (item) => {
  item.origin = item.origin || 'Natusfera'
  item.id = `${item.id}`.includes('-') ? item.id : `${item.origin.toLowerCase()}-${item.id}`

  item.$$photos = (item.media || item.photos || item.observation_photos || [])
  .filter(item => item.photo ? item.photo.medium_url : (item.medium_url || item.identifier || item.references))
  .map(item => ({
    medium_url: (item.photo ? item.photo.medium_url : (item.medium_url || item.identifier || item.references)).replace('http:', 'https:').replace('rendering=original', 'rendering=standard'),
    large_url: (item.photo ? item.photo.large_url : (item.large_url || item.identifier || item.references)).replace('http:', 'https:')
  }))
  item.medium_url = item.$$photos.slice(0, 1).map(photo => {
    return photo.medium_url
  })[0]
  item.$$date = timeAgo(item.created_at)
  item.$$species_name = item.scientificName || item.species_name || (item.taxon || {}).name || 'Something...'

  item.$$comments = []

  item.$$identifications = [...(item.identifications || []), ...(item.comments || [])]
  .filter(i => i.user_id !== 1)
  .map(identification => {
    const c = {...identification}
    c.$$date = timeAgo(c.created_at)
    return c
  })
  .sort((a:any, b:any) => Date.parse(a.created_at) - Date.parse(b.created_at))

  item.latitude = item.decimalLatitude
  item.latitud = item.decimalLatitude
  item.longitud = item.decimalLongitud || item.decimalLongitud
  item.longitude = item.decimalLongitud || item.decimalLongitud

  item.quality_grade = item.identificationVerificationStatus

  item.taxon = item.taxon || {}

  item.comments_count = (item.comments || []).length
  item.identifications_count = (item.identifications || []).length
  item.observation_photos_count = (item.media || []).length
  return item
}

export class MappingService {

  static cache = JSON.parse(localStorage.cache || '{"time": 0}')

  static async get(params?, cache = false) {
    const queryParams = params ? toQueryString(params) : ''

    if (cache && this.cache && this.cache.last && this.cache.time > Date.now() - 90 * 1000) {
      return this.cache.last.map(parseDwc)
    }
    console.log(url + queryParams)
    return fetch(url + queryParams)
    .then(res => res.json())
    .then(items => {
      items.map(i => this.cache[i.id] = i)
      if (cache) {
        this.cache.last = items
        this.updateCache()
      }
      const mapp = url.includes('dwc') ? parseDwc : this.parseNatusfera
      return items.map(mapp)
    })
  }

  static get getLastCache(): any[] {
    if (MappingService.cache.time > Date.now() - 90 * 1000)
      return MappingService.cache.last ? MappingService.cache.last.map(parseDwc) : []
    else return []
  }

  static getById(id: any) {
    return fetch(`${url}/${id}`)
    .then(res => res.json())
    .then(res => {
      console.log('host.includes', url)
      if (url.includes('/dwc')) {
        console.log('dwc', parseDwc(res))
        return parseDwc(res)
      } else {
        if (res.origin && res.origin.toLowerCase() === 'ispot') {
          return this.parseiSpot(res)
        }
        else return this.parseNatusfera(res)
      }
    })
  }

  static getCache(id) {
    return this.cache[id] || {
      $$photos: [],
      $$comments: [],
      $$identifications: []
    }
  }

  static updateCache() {
    localStorage.setItem('cache', JSON.stringify({
      last: this.cache.last,
      time: Date.now()
    }))
  }

  static updateCacheImages(items, images) {
    items.map(item => {
      const photos = [
        {
          small_url: images[item.ID],
          medium_url: images[item.ID],
          large_url: images[item.ID]
        }
      ]
      this.cache[item.id].photos = photos
      this.cache[item.id].$$photos = photos
      this.cache[item.id].medium_url = images[item.ID]
    })
  }

  static images(ids?) {
    return fetch(urliSpot + '?ids=' + ids)
    .then(res => res.json())
    .then(items => items[0].data)
  }

  static parseNatusfera(item) {
    item.id = `${item.id}`.includes('-') ? item.id : `natusfera-${item.id}`
    item.$$photos = (item.photos || item.observation_photos || []).map(item => ({
      medium_url: (item.photo ? item.photo.medium_url : item.medium_url).replace('http:', 'https:'),
      large_url: (item.photo ? item.photo.large_url : item.large_url).replace('http:', 'https:')
    }))
    item.medium_url = item.$$photos.slice(0, 1).map(photo => {
      return photo.medium_url
    })[0]
    item.$$date = timeAgo(item.created_at)
    item.$$species_name = item.species_name || (item.taxon || {}).name || 'Something...'
    item.origin = item.origin || 'Natusfera'
    // item.$$comments = []
    // (item.comments || []).map(comment => {
    //   const c = {...comment}
    //   c.$$date = timeAgo(c.created_at)
    //   return c
    // }).sort((a:any, b:any) => Date.parse(a.created_at) - Date.parse(b.created_at))
    item.$$comments = [...(item.identifications || []), ...(item.comments || [])]
    .filter(i => i.user_id !== 1)
    .map(identification => {
      const c = {...identification}
      c.$$date = timeAgo(c.created_at)
      return c
    }).sort((a:any, b:any) => Date.parse(a.created_at) - Date.parse(b.created_at))

    item.taxon = item.taxon || {}
    return item
  }

  static parseiSpot(item) {
    // item.id = 'ispot-' + (item.ID ? item.ID : (item.data || {}).ID)
    item.created_at = new Date(item.created * 1000)//.toISOString()
    item.comments_count = item.meta.comments || 0
    item.identifications_count = item.meta.identifications || 0
    item.observation_photos_count = (item.images || []).length || 1
    item.$$comments = (item.comments || []).map(comment => {
      const c = {...comment}
      c.$$date = timeAgo(c.created_at)
      return c
    }).sort((a:any, b:any) => Date.parse(a.created_at) - Date.parse(b.created_at))
    item.taxon = item.taxon || {}
    item.identifications = []
    item.longitude = (item.location || {}).lng
    item.latitude = (item.location || {}).lat
    item.quality_grade = 'casual'
    item.species_name = (item.likely || {}).scientific_name || item.title || 'Something...'
    item.origin = 'iSpot'

    item.$$photos = (item.photos || item.observation_photos || []).map(item => ({
      medium_url: (item.photo ? item.photo.medium_url : item.medium_url).replace('http:', 'https:'),
      large_url: (item.photo ? item.photo.large_url : item.large_url).replace('http:', 'https:')
    }))
    item.medium_url = item.$$photos.slice(0, 1).map(photo => {
      return photo.medium_url
    })[0]
    item.$$date = timeAgo(item.created_at)
    item.$$species_name = item.species_name || (item.taxon || {}).name || 'Something...'
    item.$$identifications = []
    return item
  }

  static addIdentification(p) {
    const user = JSON.parse(localStorage.user)
    const params = {
      user_id: 1,
      observation_id: p.parent_id,
      taxon: p.taxon || undefined,
      type: undefined,
      token: user.access_token,
      sub: user.sub,
      body: p.comment || p.body || 'by Cos4Cloud'
    }
    const q = toQueryString(params)
    // return fetch(`https://natusfera.gbif.es/observations/add_identification?${q}`)
    return fetch(`${host}/comments${q}`, {
      method: 'POST'
    })
  }

  static getComments(id: any, origin) {
    return fetch(`${host}/comments/search`, {
      headers: {
        parent_id: id,
        parent_origin: origin
      }
    })
    .then(res => res.json())
    .then(res => {
      return parseCommentsDwc(res)
    })
  }

  static async export(search?, reason?) {
    const user = JSON.parse(localStorage.user)
    const href = `${host}/export` + (search || location.search)
    const data = await fetch(href, {
      headers: {
        sub: user.sub,
        reason: reason || 'other'
      }
    }).then(res => res.text())
    downloadFile(data, `c4c_download_${Date.now()}.csv`)
    return null
  }

}
