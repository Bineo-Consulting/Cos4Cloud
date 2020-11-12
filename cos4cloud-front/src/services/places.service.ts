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

export class PlacesService {
  static get(data: any) {
    return fetch(`https://nominatim.openstreetmap.org/search.php?q=${data.value}&polygon_geojson=0&format=jsonv2`)
    .then(res => res.json())
  }

  static process(items) {
    return items.map(item => {
      const icon = icons[item.category] || '📍'
      return {
        name: item.display_name,
        value: item.display_name,
        bbox: item.boundingbox,
        lat: Number(item.lat),
        lon: Number(item.lon),
        icon
      }
    })
  }
}
