const GbifService = require('./services/gbif.service')
const PlantnetService = require('./services/plantnet.service')

module.exports = {
  // natusfera: 'https://natusfera.gbif.es/dwc'
  natusfera: {
    url: 'https://natusfera.gbif.es/dwc'
  },
  gbif: {
    url: 'https://api.gbif.org/v1',
    observations: () => '/occurrence/search/',
    observation: (id) => `/occurrence/${id}`,
    mapping: GbifService.mapping
  },
  plantnet: {
    url: 'https://natusfera.gbif.es/dwc',
    header: {
      Authorization: 'bearer dskfn'
    },
    mapping: PlantnetService.mapping
  }
}
