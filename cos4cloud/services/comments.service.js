const fetch = require('node-fetch')
const PlantnetService = require('./plantnet.service')
const toQueryString = require('../utils/toQueryString')
const Mongo = require('./mongo.service')
const Auth = require('./auth.service')

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}


/* ADD
  user_id: 1,
  observation_id: p.parent_id,
  taxon: p.taxon || undefined,
  type: undefined,
  token: user.access_token,
  body: p.body || 'by Cos4Cloud'
*/
const add = {
  natusfera: (path, params) => {
    const p = {
      user_id,
      taxon,
      type,
      token,
      body
    } = params

    p.observation_id = params.id
    p.user_id = 1 // Default
    p.body = p.body || 'by Cos4Cloud'
    const q = toQueryString(p)

    return fetch(`https://natusfera.gbif.es/observations/add_identification?${q}`)
    .then(r => r.text())
    .then(r => console.log(r))
  },
  plantnet: (path, params) => {
    const { host, token } = PlantnetService.config
    const { id, taxon, body } = params

    return fetch(`${host}/observations/${id}/votes/determination?api-key=${token}`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: taxon,
        score: 150
      })
    })
    .then(r => r.json())
    .then(r => {
      if (r.updated) {
        return { ok: true }
      } else return { error: true }
    })
  },
  ispot: (path, params) => {}
}

module.exports = class CommentsService {

  static async add(path, params) {
    const { observation_id } = params
    const [origin, id] = observation_id.split('-')

    const tokenInfo = await Auth.userinfo(params.token)
    const userInfo = await Auth.info(params.token)

    // await Mongo.delete('comments', null)
    await Mongo.update('comments', {
      // created_at: new Date(),//randomDate(new Date(2021, 0, 1), new Date()),
      user_id: userInfo.sub || params.sub,
      origin: origin,
      parent_id: id,
      taxon: params.taxon || null,
      type: params.taxon ? 'identification' : 'comment',
      body: params.body
    })

    console.log(path, { ...params, id })
    return add[origin](path, { ...params, id })
  }

}
