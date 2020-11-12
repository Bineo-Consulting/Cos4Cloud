function placeMapInstance(target, lonLat, features) {
  const layer = new ol.layer.Tile({
    source: new ol.source.OSM({
      // wrapDateLine: false,
      wrapX: false,
      // noWrap: true
    })
  });
  const map = new ol.Map({
    layers: [layer],
    target: target,
    view: new ol.View({
      center: fromLonLat(lonLat),
      maxZoom: 20,
      zoom: 5
    })
  });

  if (features) {
    const vectorSource = new VectorSource({
      features: features
    });
    const vectorLayer = new VectorLayer({
      source: vectorSource
    });

    map.addLayer(vectorLayer);
  }
  map.once('postrender', function(event) {
    map.updateSize();
  });

  return map;
}
