import { toQueryString } from '../utils/to-query-string';
import { timeAgo } from '../utils/time-ago';
import resources from '../resources'
import { downloadFile } from '../utils/download-file'

// const url = 'https://natusfera.gbif.es/observations.json'
// const url = 'http://81.169.128.191:10010/observations'
const cloudHost = 'https://europe-west2-cos4cloud-2d9d3.cloudfunctions.net'
const host = resources.host || cloudHost
const url = `${host}/observations`
const urliSpot = `${host}/images`

// const url = 'http://localhost:5001/observations'
// const urliSpot = 'http://localhost:5001/images'

export class MappingService {
  static get(params?) {
    const queryParams = params ? toQueryString(params) : ''
    return fetch(url + queryParams)
    .then(res => res.json())
    .then(items => items.map(this.parse))
  }

  static images(ids?) {
    return fetch(urliSpot + '?ids=' + ids)
    .then(res => res.json())
    .then(items => items[0].data)
  }

  static getById(id: number) {
    return fetch(`https://natusfera.gbif.es/observations/${id}.json`)
    .then(res => res.json())
    .then(item => this.parse(item))
  }

  static parse(item) {
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
    return item
  }

  static addIdentification(p) {
    const user = JSON.parse(localStorage.user)
    const params = {
      user_id: 1,
      observation_id: p.parent_id,
      taxon: p.taxon,
      type: null,
      token: user.access_token,
      body: p.body || 'by Cos4Cloud'
    }
    const q = Object.keys(params).map(k => `${k}=${params[k]}`).join('&')
    return fetch(`https://natusfera.gbif.es/observations/add_identification?${q}`)
  }

  static async export() {
    const href = `${cloudHost}/export` + location.search
    const data = await fetch(href).then(res => res.text())
    downloadFile(data, `c4c_download_${Date.now()}.csv`)
    return null
  } 
}
