import { Component, Host, Prop, h } from '@stencil/core';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {fromLonLat} from 'ol/proj';
import Feature from 'ol/Feature';

import VectorSource from 'ol/source/Vector';
import {Icon, Style} from 'ol/style';
import {Vector as VectorLayer} from 'ol/layer';
import Point from 'ol/geom/Point';

@Component({
  tag: 'modal-map',
  styleUrl: 'modal-map.css',
  shadow: false,
})
export class ModalMap {

  el: any;

  @Prop() lat: number;
  @Prop() lon: number;

  loadMap() {

    const madrid = new Feature({
      geometry: new Point(fromLonLat([this.lon || 0, this.lat || 0])),
    });
    madrid.setStyle(
      new Style({
        image: new Icon({
          crossOrigin: 'anonymous',
          src: 'https://openlayers.org/en/latest/examples/data/bigdot.png',
          scale: 0.2,
        }),
      })
    );

    const vectorSource = new VectorSource({
      features: [madrid],
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });


    new Map({
      view: new View({
        center: fromLonLat([this.lon || 0, this.lat || 0]),
        zoom: 16
      }),
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      target: this.el
    });

  }

  componentDidLoad() {
    this.loadMap()
  }

  render() {
    return (
      <Host>
        <div class="map" ref={(el) => this.el = el}></div>
      </Host>
    );
  }

}
