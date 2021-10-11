const functions = require('firebase-functions')
const setCors = require('../utils/setCors')
const Mongo = require('../services/mongo.service')
const fs = require('fs')

function replaceTag(indexLines, selector, value) {
  return indexLines.map(i => {
    if (i.includes(selector)) {
      return `<meta ${selector} content="${value}">`
    } else return i
  })
}

function addCanonical(indexLines, selector, value) {
  return indexLines.map(i => {
    if (i.includes(selector)) {
      return `<link ${selector} href="${value}"/>`
    } else return i
  })
}

function replaceTags(indexLines, data) {
  indexLines = replaceTag(indexLines, 'name="description"', data.description)
  indexLines = replaceTag(indexLines, 'property="og:url"', data.url)
  indexLines = replaceTag(indexLines, 'property="og:title"', data.title)
  indexLines = replaceTag(indexLines, 'property="og:description"', data.description)
  indexLines = replaceTag(indexLines, 'property="og:image"', data.img)
  indexLines = replaceTag(indexLines, 'property="twitter:url"', data.url)
  indexLines = replaceTag(indexLines, 'property="twitter:title"', data.title)
  indexLines = replaceTag(indexLines, 'property="twitter:description"', data.description)
  indexLines = replaceTag(indexLines, 'property="twitter:image"', data.img)
  indexLines = addCanonical(indexLines, 'rel="canonical"', data.url)
  return indexLines.join('\n')
}

function replaceTitle(indexHTML, data) {
  return indexHTML.replace(/<title.*<\/title>/, `<title>${data.title}</title>`)
}

const share = functions.region('us-central1').https.onRequest(async (req, res) => {
  if (setCors(req, res)) return true
  if (req.query && req.query.wakeup) return res.status(204).send('');

  const id = req.path.split('/').filter(Boolean).pop()

  const user = await Mongo.get('users', id)

  const title = `${user.name} - Cos4Bio`
  const description = `${user.displayName}, ${user.profession} - Cos4Bio`
  const img = 'https://cos4cloud-eosc.eu/wp-content/uploads/2020/07/iStock-1180187740_crop.jpg'
  const url = 'https://cos4bio.eu'

  let indexHTML = fs.readFileSync('./hosting/index.html').toString()
  let indexList = indexHTML.replace(/> </g, '>\n<').split('\n')

  const data = {
    title,
    description,
    url,
    img
  }

  indexHTML = replaceTags(indexList, data)
  indexHTML = replaceTitle(indexHTML, data)

  return res.status(200).send(indexHTML)
})

module.exports = { share }
