const fetch = require('node-fetch')

module.exports = class ISpotService {

  static getGroups(group) {
    /*
    https://api.ispotnature.org/ispotapi/content/observations?filters=[
    {"comparator":"IN","key":"group","value":[
      {"ID":26394,"name":"Fungi+and+Lichens","slug":"fungi-and-lichens","$$hashKey":"object:1350"},
      {"ID":26392,"name":"Mammals","slug":"mammals","$$hashKey":"object:1352"},
      {"ID":26391,"name":"Amphibians+and+Reptiles","slug":"amphibians-and-reptiles","$$hashKey":"object:1347"},
      {"ID":26393,"name":"Plants","slug":"plants","$$hashKey":"object:1354"}
    ]}]&page=1
    */
    // Plantae,Animalia,Fungi,Reptilia
    const groups = group.split(',')
    return {
      "comparator":"IN",
      "key":"group",
      "value": [
        groups.includes('Fungi') && {"ID":26394,"name":"Fungi+and+Lichens","slug":"fungi-and-lichens","$$hashKey":"object:1350"},
        groups.includes('Animalia') && {"ID":26392,"name":"Mammals","slug":"mammals","$$hashKey":"object:1352"},
        groups.includes('Reptilia') && {"ID":26391,"name":"Amphibians+and+Reptiles","slug":"amphibians-and-reptiles","$$hashKey":"object:1347"},
        groups.includes('Plantae') && {"ID":26393,"name":"Plants","slug":"plants","$$hashKey":"object:1354"}
      ].filter(Boolean)
    }
  }

  static get() {
    return []
  }

  static dwcGet() {
    return []
  }

}