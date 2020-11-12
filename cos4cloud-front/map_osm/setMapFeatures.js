//= require ./featuresHelper
//= require ./mapInstance
//= require ./onViewChange

const Feature = ol.Feature;
const Point = ol.geom.Point;
const Style = ol.style.Style;
const Icon = ol.style.Icon;
const VectorSource = ol.source.Vector;
const fromLonLat = ol.proj.fromLonLat;
const VectorLayer = ol.layer.Vector;
const Overlay = ol.Overlay;

var items, places, selector;
if (window.observations) {
  items = window.observations;
  selector = 'observation';
} else if (window.projects) {
  items = window.projects;
  selector = 'project';
} else {
  items = [];
}
var observations_map;
if (window.observations_map) {
  observations_map = window.observations_map;
} else {
  observations_map = [];
}
if (window.places) {
  places = window.places;
} else if (window.PLACE) {
  places = [window.PLACE];
} else {
  places = [];
}

var points;
if (window.points) {
  points = window.points;
} else {
  points = [];
}

function createBtnDirection(type, parent, data) {
  const btn = document.createElement('BUTTON')
  btn.setAttribute('onclick', 'fetchPopupContent(null, ' + data.index + ')')
  if (data.index < 0 || data.index >= data.len) {
    data.disable = true
  }
  btn.className = 'btn-direction-pages btn-' + type + (data.disable ? ' disable' : '')
  parent.appendChild(btn)
}

function createTextLabel(text, parent) {
  const el = document.createElement('SPAN');
  el.className = 'direction-pages-information';
  el.innerHTML = text;
  parent.appendChild(el);
}

function fetchPopupContent(id, _index) {
  const popupContent = document.getElementById('popup-content');
  const idsStr = id || popupContent.getAttribute('data-id') || '';
  const index = _index || 0
  const ids = idsStr.split(',')
  const len = ids.length || 0;

  const componentResource = window.POINTS_RESOURCE.replace('{id}', ids[index]);
  popupContent.innerHTML = 'Loading...';
  fetch(componentResource, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content'),
    },
    credentials: 'same-origin'
  })
  .then(function(res) { return res.text() })
  .then(function(res) {
    popupContent.innerHTML = res;
    const prev = index - 1;
    createBtnDirection('prev', popupContent, {
      index: prev, len: len
    })
    createTextLabel((index + 1) + '/' + len, popupContent)
    const next = index + 1;
    createBtnDirection('next', popupContent, {
      index: next, len: len
    })

    popupContent.setAttribute('data-id', idsStr)
  })
}

function featuresOSM(map) {
  const view = map.getView();

  const mapElement = document.getElementById('map');

  /**
   * Elements that make up the popup.
   */
  const popupContainer = document.getElementById('popup');
  const popupContent = document.getElementById('popup-content');
  const closer = document.getElementById('popup-closer');
  closer.blur();

  var popup = new Overlay({
    element: popupContainer,
    // positioning: 'bottom-left',
    positioning: 'bottom-right',
    offset: [0, -20]
    // stopEvent: true,
    // positioning: 'bottom',
    // autoPan: true,
    // autoPanAnimation: {
    //   duration: 250
    // }
  });
  map.addOverlay(popup);
  popup.setPosition(undefined);

  /**
   * Add a click handler to hide the popup.
   * @return {boolean} Don't follow the href.
   */
  closer.onclick = function() {
    popup.setPosition(undefined);
    closer.blur();
    return false;
  };

  const vectorSource = new VectorSource({});
  const vectorLayer = new VectorLayer({
    source: vectorSource
  });
  map._verctorSource = vectorSource;

  map.addLayer(vectorLayer);
  // display popup on click
  /*
    map, mapElement, popupContent, popupContainer, popup, closer, evt
  */
  map.on('click', function(evt) {
    const coordinates = evt.coordinate; //feature.getGeometry().getCoordinates();
    const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
      return feature;
    });

    // fetchPopupContent('0', {
    //   map: map,
    //   mapElement: mapElement,
    //   popupContent: popupContent,
    //   popupContainer: popupContainer,
    //   popup: popup,
    //   closer: closer,
    //   evt: evt
    // })
    popupContent.innerHTML = '';
    if (feature) {
      const props = feature.N.porperties;
      if (props.fetch) {
        fetchPopupContent(props.id)
        // const id = props.id.toString().split(',')[0];
        // const componentResource = window.POINTS_RESOURCE.replace('{id}', id);
        // popupContent.innerHTML = 'Loading...';
        // fetch(componentResource, {
        //   headers: {
        //     'X-Requested-With': 'XMLHttpRequest',
        //     'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content'),
        //   },
        //   credentials: 'same-origin'
        // })
        // .then(function(res) { return res.text() })
        // .then(function(res) {
        //   popupContent.innerHTML = res;
        // })
      } else {
        popupContent.appendChild(getFeatureContent(props.id));
      }
      if (window.innerWidth - mapElement.offsetLeft - evt.pixel[0] >= 450) {
        popupContainer.classList.remove('right');
        if (popup.setPositioning) popup.setPositioning('bottom-left');
      } else {
        popupContainer.classList.add('right');
        if (popup.setPositioning) popup.setPositioning('bottom-right');
      }
      popup.setPosition(coordinates);
    } else {
      popup.setPosition(undefined);
      closer.blur();
    }
  });

  // change mouse cursor when over marker
  map.on('pointermove', function(e) {
    if (e.dragging) {
      popup.setPosition(undefined);
      return;
    }
    const pixel = map.getEventPixel(e.originalEvent);
    const hit = map.hasFeatureAtPixel(pixel);

    mapElement.style.cursor = hit ? 'pointer' : '';
  });

  if ((window.observations && window.observations.splice) || window.observation) {
    map.on('moveend', function() {
      onViewChange(map, view, vectorSource);
    });
    onViewChange(map, view, vectorSource);
  }

  var features = [];
  for (var i = items.length - 1; i >= 0; i--) {
    const o = items[i];
    if (o.longitude && o.latitude) {
      const lonLat = [Number(o.longitude), Number(o.latitude)];
      features.push(feature(lonLat, {id: o.id}));
    }
  }
  if (points) for (var i = points.length - 1; i >= 0; i--) {
    const o = points[i]
    const lonLat = [Number(o[1]), Number(o[2])];
    features.push(featureSmall(lonLat, {id: o[0], fetch: true}));
  }
  if (features.length) {
    vectorSource.addFeatures(features);
    const extent = vectorSource.getExtent();
    map.getView().fit(extent, map.getSize());
  }

  if (window.currentMarker) {
    window.setCurrentMarker()
  }

  setTimeout(function() {
    map.updateSize();
  }, 2000);
  map.updateSize();
};

/****************
 Init
*****************/
if (window.map && map.getLayers) {
  featuresOSM(window.map);
  setupPlacesMaps(window.map, placeFeature, placeMapInstance);
}
if (observations_map.length) {
  for (var i = 0; i < observations_map.length; i++) {
    const o = observations_map[i];
    const lonLat = [Number(o.longitude), Number(o.latitude)];
    const features = [feature(lonLat, {id: o.id})];
    placeMapInstance('observation-' + o.id + '-map', lonLat, features);
  }
}
