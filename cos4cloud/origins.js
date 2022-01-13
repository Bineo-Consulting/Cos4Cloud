const GbifService = require('./services/gbif.service')
const PlantnetService = require('./services/plantnet.service')

module.exports = {
  natusfera: {
    url: 'https://natusfera.gbif.es/dwc',
    // url: 'http://localhost:9090',
    observations: () => '/occurrence/search',
    observation: (id) => `/occurrence/${id}`,
  },
  gbif: {
    url: 'https://api.gbif.org/v1',
    observations: () => '/occurrence/search/',
    observation: (id) => `/occurrence/${id}`,
    mapping: GbifService.mapping
  },
  plantnet: {
    url: 'https://my-api.plantnet.org/v2/dwc',
    observations: () => '/occurrence/search',
    observation: (id) => `/occurrence/${id}`,
    mapping: PlantnetService.mapping
  }
}

// natusfera: 'https://natusfera.gbif.es/dwc'
// https://my-api.plantnet.org/v2/dwc/occurrence/1004421308?api-key=
// url: 'http://localhost:9090',