class PlantnetService {
  static get() {
    return []
  }
  static dwcGet() {
    return []
  }
}

PlantnetService.config = {
  token: '2b10JYMpxAexS5HynCQCFpn6j',
  host: 'https://my-api.plantnet.org:444/v2'
}

module.exports = PlantnetService