const kingdoms = {
  Plantae: '🌺',
  Animalia: '🦊',
  Fungi: '🍄'
}

const score = (term, name) => {
  if (name.match(new RegExp(`^${term},`))) return 7
  if (name.match(new RegExp(`^${term} `))) return 6
  if (name.includes(`${term},`)) return 5
  if (name.match(new RegExp(`^${term}`))) return 4
  if (name.includes(`${term} `)) return 3
  if (name.includes(term)) return 2
  else return 1
}

export class GbifService {
  static get(data: any) {
    return fetch(`https://api.gbif.org/v1/species/suggest?q=${data.value}&status=ACCEPTED`)
    .then(res => res.json())
  }

  static process(items, term = null) {
    return items.map(item => {
      const icon = kingdoms[item.kingdom] || '❓'
      return {
        name: item.scientificName,
        value: item.scientificName,
        icon,
        score: term ? score(term, item.scientificName.toLowerCase()) : 1
      }
    })
  }
}
