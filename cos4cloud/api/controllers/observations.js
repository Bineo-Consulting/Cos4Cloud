const fetch = require('node-fetch')
const dJSON = JSON
const MappingService = require('../helpers/mapping-service')

module.exports = {
  getObservations, getImages
};

function getObservations(req, res) {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', '*');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Max-Age', '360000');
    res.status(204).send('');
  }

  const params = {};
  Object.keys(req.swagger.params).map(key => {
    params[key] = req.swagger.params[key].value || null
  })

  MappingService.get(params).then(aux => res.json(aux))
}

function getImages(req, res) {
  //set JSON content type and CORS headers for the response
  res.header('Content-Type','application/json');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  //respond to CORS preflight requests
  if (req.method == 'OPTIONS') {
    res.status(204).send('');
  }

  const params = {};
  Object.keys(req.swagger.params).map(key => {
    params[key] = req.swagger.params[key].value || null
  })
  queryParams = params.ids.map(i => `ids%5B%5D=${i}`).join('&')
  MappingService.getImages(queryParams, res)
}