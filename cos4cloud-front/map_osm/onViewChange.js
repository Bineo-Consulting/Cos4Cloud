function extendToLonLat(exent) {
  return ol.proj.transformExtent(exent,'EPSG:3857', 'EPSG:4326')
}
function bboxParams(bbox) {
  const pbbox = {
    xmin: bbox[0],
    xmax: bbox[1],
    ymin: bbox[2],
    ymax: bbox[3]
  };
  return $.param(pbbox);
}
function zoomParam(view) {
  return '&zoom=' + view.getZoom();
}
function variablesParams(vars){
  return '&variables=' + vars;
}
function setFeatures(items, vectorSource) {
  const features = [];
  for (var i = items.length - 1; i >= 0; i--) {
    const o = items[i];
    const lonLat = [Number(o[1]), Number(o[2])];
    features.push(featureSmall(lonLat, {id: o[0], fetch: true}));
  }
  vectorSource.addFeatures(features);
}
function onViewChange(map, view, vectorSource) {
  console.log('Zoom=', parseInt(view.getZoom()));
  console.log('Resolution=', parseInt(view.getResolution()));

  send_variables = []
  if($(".variable_type").val()){
    if($(".variable_type").val().length == 1){
      send_variables = JSON.parse("[" + $(".variable_type").val() + "]");
    }else{
      send_variables = JSON.parse($(".variable_type").val());
    }
  }else{
    send_variables = [1];
  }

  const bbox = view.calculateExtent(map.getSize());
  console.log(bbox, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content'),
      },
      credentials: 'same-origin'
    })
  if (bbox && bbox[0]) {
    const bboxLonLat = extendToLonLat(bbox)
    fetch('/observations/bbox?' + bboxParams(bboxLonLat) + zoomParam(view) + variablesParams(send_variables), {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content'),
      },
      credentials: 'same-origin'
    })
    .then(function(res) { return res.json() })
    .then(function(items) {
      console.log('{items}', items);
      vectorSource.clear();
      setFeatures(items, vectorSource);
      window.setCurrentMarker();
    })
  }
}