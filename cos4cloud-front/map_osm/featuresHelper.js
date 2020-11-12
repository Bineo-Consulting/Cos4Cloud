function feature(lonLat, porperties) {
  const f = new Feature({
    geometry: new Point(fromLonLat(lonLat)),
    porperties: porperties
  });
  f.setStyle(new Style({
    image: new Icon(/** @type {module:ol/style/Icon~Options} */ ({
      color: '#4271AE',
      crossOrigin: 'anonymous',
      src: '/assets/dot.png'
    }))
  }));
  return f;
}
function featureMarker(lonLat, porperties) {
  const f = new Feature({
    type: 'icon',
    geometry: new Point(fromLonLat(lonLat)),
    porperties: porperties
  });
  f.setStyle(new Style({
    image: new Icon(/** @type {module:ol/style/Icon~Options} */ ({
      color: '#FF71AE',
      crossOrigin: 'anonymous',
      src: '/assets/dot.png',
      scale: 0.5
    })),
    zIndex: 100
  }));
  return f;
}
function featureSmall(lonLat, porperties) {
  const f = new Feature({
    geometry: new Point(fromLonLat(lonLat)),
    porperties: porperties
  });
  f.setStyle(new Style({
    image: new Icon(/** @type {module:ol/style/Icon~Options} */ ({
      color: '#4271AE',
      crossOrigin: 'anonymous',
      src: '/assets/dot.png',
      scale: 0.5
    }))
  }));
  return f;
}
function getFeatureContent(id) {
  const elSource = document.getElementById(selector + '-' + id)
  if (!elSource) return null;
  const el = elSource.cloneNode(true);
  el.setAttribute('max-width', '700');
  // Remove classes
  const clazz = el.className.split(' ');
  el.className = '';
  for (var i = clazz.length - 1; i >= 0; i--) {
    if (clazz[i].indexOf('col') !== 0) {
      el.classList.add(clazz[i])
    }
  }
  const shadow = el.querySelector('.box_shadow_white');
  if (shadow) {
    shadow.classList.remove('box_shadow_white');
  }
  return el;
}

function setCurrentMarker(map, items) {
  map = map || window.map;
  const view = map.getView();
  var closerZoom = true;
  var _items;
  if (items) {
    _items = items.splice ? items : [items];
  } else {
    if (!window.currentMarker) { return }
    _items = window.currentMarker.splice ? window.currentMarker : [window.currentMarker];
    closerZoom = false;
  }
  for (var i = _items.length - 1; i >= 0; i--) {
    const item = _items[i];
    const lonLat = [Number(item.longitude), Number(item.latitude)];
    const feature = featureMarker(lonLat, {id: item.id, fetch: true});
    map._verctorSource.addFeatures([feature]);
    if (i === 0 && closerZoom) {
      view.setCenter(fromLonLat(lonLat))
      window.currentMarker = item;
      view.setZoom(17);
    }
  }
}

function placeFeature(map, lonLat, i, place, closerZoom) {
  const mapElement = document.getElementById('map');
  const view = map.getView();
  const marker = new Overlay({
    position: fromLonLat(lonLat),
    positioning: 'center-center',
    element: mapElement.querySelector('.marker').cloneNode(),
    stopEvent: false
  });
  const placeLinkElDefault = mapElement.querySelector('.place_link').cloneNode();
  placeLinkElDefault.innerHTML = Number(i) + 1;
  placeLinkElDefault.href = '/places/' + place.slug;

  map.addOverlay(marker);
  const placeLink = new Overlay({
    position: fromLonLat(lonLat),
    positioning: 'center-center',
    element: placeLinkElDefault
  });
  map.addOverlay(placeLink);
  if (closerZoom) {
    view.setCenter(fromLonLat(lonLat))
    view.setZoom(10);
  }
}

/*********************************************
Place links
*********************************************/
function setupPlacesMaps(map, placeFeature, placeMapInstance) {
  const closerZoom = places.length === 1;
  for (var i = 0; i < places.length; i++) {
    const place = places[i];
    if (place.longitude && place.latitude) {
      const lonLat = [Number(place.longitude), Number(place.latitude)];
      placeFeature(map, lonLat, i, place, closerZoom);
      if (window.PLACE) continue;
      const mapI = placeMapInstance('map' + i, lonLat);
      placeFeature(mapI, lonLat, i, place);
    }
  }
}
