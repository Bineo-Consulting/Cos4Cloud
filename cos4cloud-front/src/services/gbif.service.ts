const kingdoms = {
  Plantae: '🌺',
  Animalia: '🦊',
  Fungi: '🍄'
}

export class GbifService {
  static get(data: any) {
    return fetch(`https://api.gbif.org/v1/species/suggest?q=${data.value}&status=ACCEPTED`)
    .then(res => res.json())
  }

  static process(items) {
    return items.map(item => {
      const icon = kingdoms[item.kingdom] || '❓'
      return {
        name: item.scientificName,
        value: item.scientificName,
        icon
      }
    })
  }
}
