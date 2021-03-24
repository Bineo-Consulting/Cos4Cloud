import { toQueryString } from '../utils/to-query-string';
import { timeAgo } from '../utils/time-ago';
import resources from '../resources'
import { downloadFile } from '../utils/download-file'

// const url = 'https://natusfera.gbif.es/observations.json'
// const url = 'http://81.169.128.191:10010/observations'
// const url = 'http://localhost:5001/observations'
// const urliSpot = 'http://localhost:5001/images'

const cloudHost = 'https://europe-west2-cos4cloud-2d9d3.cloudfunctions.net/api'
const host = resources.host || cloudHost
const url = `${host}/observations`
const urliSpot = `${host}/images`

export class MappingService {

  static cache = JSON.parse(localStorage.cache || '{"time": 0}')

  static async get(params?, cache = false) {
    const queryParams = params ? toQueryString(params) : ''

    console.log({c: this.cache, cache}, cache && this.cache && this.cache.last && this.cache.time)
    if (cache && this.cache && this.cache.last && this.cache.time > Date.now() - 90 * 1000) {
      // this.cache.last.map(i => this.cache.last[i.id] = i)
      return this.cache.last
    }
    console.log('fetch:', fetch + queryParams)
    return fetch(url + queryParams)
    .then(res => res.json())
    .then(items => {
      items.map(i => this.cache[i.id] = i)
      if (cache) {
        this.cache.last = items
        this.updateCache()
      }
      return items.map(this.parseNatusfera)
    })
  }

  static getCache(id) {
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

  static getById(id: any) {
    return fetch(`${host}/observations/${id}`)
    .then(res => res.json())
    .then(res => {
      if (res.origin.toLowerCase() === 'ispot') {
        return this.parseiSpot(res)
      }
      else return this.parseNatusfera(res)
    })
  }

  static images(ids?) {
    return fetch(urliSpot + '?ids=' + ids)
    .then(res => res.json())
    .then(items => items[0].data)
  }

  static parseNatusfera(item) {
    item.id = `${item.id}`.includes('-') ? item.id : `natusfera-${item.id}`
    item.$$photos = (item.photos || item.observation_photos || []).map(item => ({
      medium_url: (item.photo ? item.photo.medium_url : item.medium_url).replace('http:', 'https:'),
      large_url: (item.photo ? item.photo.large_url : item.large_url).replace('http:', 'https:')
    }))
    item.medium_url = item.$$photos.slice(0, 1).map(photo => {
      return photo.medium_url
    })[0]
    item.$$date = timeAgo(item.created_at)
    item.$$species_name = item.species_name || (item.taxon || {}).name || 'Something...'
    item.origin = item.origin || 'Natusfera'
    item.$$comments = (item.comments || []).map(comment => {
      const c = {...comment}
      c.$$date = timeAgo(c.created_at)
      return c
    }).sort((a:any, b:any) => Date.parse(a.created_at) - Date.parse(b.created_at))
    item.$$identifications = (item.identifications || []).map(identification => {
      const c = {...identification}
      c.$$date = timeAgo(c.created_at)
      return c
    }).sort((a:any, b:any) => Date.parse(a.created_at) - Date.parse(b.created_at))

    item.taxon = item.taxon || {}
    return item
  }

  static parseiSpot(item) {
    // item.id = 'ispot-' + (item.ID ? item.ID : (item.data || {}).ID)
    item.created_at = new Date(item.created * 1000)//.toISOString()
    item.comments_count = item.meta.comments || 0
    item.identifications_count = item.meta.identifications || 0
    item.observation_photos_count = (item.images || []).length || 1
    item.$$comments = (item.comments || []).map(comment => {
      const c = {...comment}
      c.$$date = timeAgo(c.created_at)
      return c
    }).sort((a:any, b:any) => Date.parse(a.created_at) - Date.parse(b.created_at))
    item.taxon = item.taxon || {}
    item.identifications = []
    item.longitude = (item.location || {}).lng
    item.latitude = (item.location || {}).lat
    item.quality_grade = 'casual'
    item.species_name = (item.likely || {}).scientific_name || item.title || 'Something...'
    item.origin = 'iSpot'

    item.$$photos = (item.photos || item.observation_photos || []).map(item => ({
      medium_url: (item.photo ? item.photo.medium_url : item.medium_url).replace('http:', 'https:'),
      large_url: (item.photo ? item.photo.large_url : item.large_url).replace('http:', 'https:')
    }))
    item.medium_url = item.$$photos.slice(0, 1).map(photo => {
      return photo.medium_url
    })[0]
    item.$$date = timeAgo(item.created_at)
    item.$$species_name = item.species_name || (item.taxon || {}).name || 'Something...'
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
      body: p.body || 'by Cos4Cloud'
    }
    const q = Object.keys(JSON.parse(JSON.stringify(params))).map(k => `${k}=${params[k]}`).join('&')
    return fetch(`https://natusfera.gbif.es/observations/add_identification?${q}`)
  }

  static async export() {
    const href = `${cloudHost}/export` + location.search
    const data = await fetch(href).then(res => res.text())
    downloadFile(data, `c4c_download_${Date.now()}.csv`)
    return null
  }

}
