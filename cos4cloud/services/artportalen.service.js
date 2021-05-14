const fetch = require('node-fetch')
const toQueryString = require('../utils/toQueryString')

/*
curl -v -X POST "https://api.artdatabanken.se/species-observation-system/v1/Observations/Search?skip=0&take=30&validateSearchFilter=false&translationCultureCode=sv-SE&protectedObservations=false" \
-H "X-Api-Version: 1.0" \
-H "Content-Type: application/json" \
-H "Ocp-Apim-Subscription-Key: 258deb68f2dc4d929535e2650b9b67ba" \
-H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IkIxRTVGMkE1NTRFMzdCM0QyN0ExREMwQzk0RDlFNjFCOTdDRjFCOEEiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJzZVh5cFZUamV6MG5vZHdNbE5ubUc1ZlBHNG8ifQ.eyJuYmYiOjE2MjAxMzA4NzAsImV4cCI6MTYyMDIxNzI3MCwiaXNzIjoiaHR0cHM6Ly9pZHMuYXJ0ZGF0YWJhbmtlbi5zZSIsImF1ZCI6WyJodHRwczovL2lkcy5hcnRkYXRhYmFua2VuLnNlL3Jlc291cmNlcyIsIlNPUy5PYnNlcnZhdGlvbnMiXSwiY2xpZW50X2lkIjoiQXp1cmVBUElNYW5hZ2VtZW50Iiwic3ViIjoiMTMwOTQ1IiwiYXV0aF90aW1lIjoxNjIwMTMwODY5LCJpZHAiOiJsb2NhbCIsInJpZCI6IjIiLCJuYW1lIjoiUm9iaW4gR2lsZXMgUmliZXJhIiwiZW1haWwiOiJyb2JpbmNob2dpbGVzQGdtYWlsLmNvbSIsInJuYW1lIjoiUHJpdmF0Iiwic2NvcGUiOlsib3BlbmlkIiwiU09TLk9ic2VydmF0aW9ucy5Qcm90ZWN0ZWQiXSwiYW1yIjpbInB3ZCJdfQ.WMPzwiqlWEthWtcpuj-2Llo4zYEXaFScJw9-ztGnBaSzp7QZUKiOLHUWsWuQ95JFR5RPl27drobo76DbbB6r0VXuLaOZn-IpHuYPBZjeJ_e4a6F5tGNo7fr_yczL_myXlRKwuNdJkiwqs-eTW7neOVihOODHfQ06jneD8E4WNHLWftnfiCUySt-swUx7UnJ6Q2QUcC5p4CK_fgH2n57p-0N7aGGy3Aj0B9uQiZbdoVIj6hESXIgjTeVqZaTO7V9ptdX_Cyt7U4x_RYjCsIay1jMQB2xI8szXAnxUVdEKQbLIAvVyrlwUYKfxsQ_8H4yVIfsX9XdLJmVcXqsKxGahqQ" \
--data-ascii "{}"
*/
const config = {
  host: 'https://api.artdatabanken.se',
  token: '258deb68f2dc4d929535e2650b9b67ba',
  auth: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkIxRTVGMkE1NTRFMzdCM0QyN0ExREMwQzk0RDlFNjFCOTdDRjFCOEEiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJzZVh5cFZUamV6MG5vZHdNbE5ubUc1ZlBHNG8ifQ.eyJuYmYiOjE2MjAxMzA4NzAsImV4cCI6MTYyMDIxNzI3MCwiaXNzIjoiaHR0cHM6Ly9pZHMuYXJ0ZGF0YWJhbmtlbi5zZSIsImF1ZCI6WyJodHRwczovL2lkcy5hcnRkYXRhYmFua2VuLnNlL3Jlc291cmNlcyIsIlNPUy5PYnNlcnZhdGlvbnMiXSwiY2xpZW50X2lkIjoiQXp1cmVBUElNYW5hZ2VtZW50Iiwic3ViIjoiMTMwOTQ1IiwiYXV0aF90aW1lIjoxNjIwMTMwODY5LCJpZHAiOiJsb2NhbCIsInJpZCI6IjIiLCJuYW1lIjoiUm9iaW4gR2lsZXMgUmliZXJhIiwiZW1haWwiOiJyb2JpbmNob2dpbGVzQGdtYWlsLmNvbSIsInJuYW1lIjoiUHJpdmF0Iiwic2NvcGUiOlsib3BlbmlkIiwiU09TLk9ic2VydmF0aW9ucy5Qcm90ZWN0ZWQiXSwiYW1yIjpbInB3ZCJdfQ.WMPzwiqlWEthWtcpuj-2Llo4zYEXaFScJw9-ztGnBaSzp7QZUKiOLHUWsWuQ95JFR5RPl27drobo76DbbB6r0VXuLaOZn-IpHuYPBZjeJ_e4a6F5tGNo7fr_yczL_myXlRKwuNdJkiwqs-eTW7neOVihOODHfQ06jneD8E4WNHLWftnfiCUySt-swUx7UnJ6Q2QUcC5p4CK_fgH2n57p-0N7aGGy3Aj0B9uQiZbdoVIj6hESXIgjTeVqZaTO7V9ptdX_Cyt7U4x_RYjCsIay1jMQB2xI8szXAnxUVdEKQbLIAvVyrlwUYKfxsQ_8H4yVIfsX9XdLJmVcXqsKxGahqQ',
  species_token: '88273ea9d0a94e37851e23a5059476f7',
  specie_host: 'https://api.artdatabanken.se/information/v1/speciesdataservice/v1/speciesdata/search'
}

const parseItem = (item) => {
  item.id = 'artportalen-' + item.occurrence.occurrenceId
  item.created_at = new Date(item.created)
  // reset
  item.identification = item.identification || {}
  item.taxon = item.taxon || {}
  item.location = item.location || {}
  // stats
  item.observation_photos_count = 0
  item.comments_count = 0
  item.identifications_count = 0
  item.comments = []
  item.identifications = []
  item.photos = []

  item.longitude = item.location.decimalLongitude
  item.latitude = item.location.decimalLatitude
  item.quality_grade = item.identification.validated ? 'research' : 'casual'
  item.species_name = item.taxon.scientificName || 'Something...'
  item.origin = 'artportalen'
  return item
}

const getSpecieId = async (term) => {
  return fetch(`${config.specie_host}?searchString=${term}`, {
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': config.species_token,
      'Authorization': 'Bearer ' + config.auth
    }
  })
  .then(res => res.json())
  .then(res => {
    console.log('getSpecieId =>', {res})
    return res && res[0] ? res.map(i => i.taxonId) : null
  })
}

const get = async (queryParams, params, stop) => {
  const p = {
    skip: params.page || '0',
    take: 30,
    validateSearchFilter: false,
    translationCultureCode: 'sv-SE',
    protectedObservations: false,
  }
  const q = toQueryString(p)
  let taxonId = null
  if (params.taxon_name) {
    taxonId = await getSpecieId(params.taxon_name)
  }
  console.log(taxonId)
  return fetch(`https://api.artdatabanken.se/species-observation-system/v1/Observations/Search${q}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': config.token,
      'Authorization': 'Bearer ' + config.auth
    },
    body: JSON.stringify({
      onlyValidated: params.quality_grade === 'research' ? true : false,
      taxon: {
        ids: taxonId
      }
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.statusCode === 404) {
      return []
    }
    if (!stop && res.statusCode === 500) {
      return get(queryParams, params, true)
    }
    if (res && res.records) {
      return res.records.map(parseItem);
    }
    return null
  })
  .catch(_ => {
    console.error(_)
    return []
  })
}

const getById = (id) => {
  return fetch(`https://api.artdatabanken.se/species-observation-system/v1/Observations/${id}?protectedObservations=false`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': config.token,
      'Authorization': 'Bearer ' + config.auth
    }
  })
  .then(r => r.json())
  .then(res => {
    if (res.statusCode === 404) {
      return []
    }
    return parseItem(res[0]);
  })
  .catch(_ => {
    console.error(_)
    return []
  })
}
module.exports = {
  get, getById, config
}