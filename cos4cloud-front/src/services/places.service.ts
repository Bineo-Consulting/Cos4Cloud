const icons = {
  city: '🌇',
  country: '🏳',
  world: '🌍',
  boundary: '🗾',
  waterway: '🏞',
  place: '⛲️',
  railway: '🛤',
  highway: '🛣',
  building: '🏢'
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

export class PlacesService {
  static get(data: any) {
    return fetch(`https://nominatim.openstreetmap.org/search.php?q=${data.value}&polygon_geojson=0&format=jsonv2`)
    .then(res => res.json())
  }

  static process(items, term = null) {
    return items.map(item => {
      const icon = icons[item.category] || '📍'
      return {
        name: item.display_name,
        value: item.display_name,
        bbox: item.boundingbox,
        lat: Number(item.lat),
        lon: Number(item.lon),
        icon,
        score: term ? score(term, item.display_name.toLowerCase()) : 1
      }
    })
  }
}
