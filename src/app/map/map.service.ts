import { Injectable } from '@angular/core';
import * as ol from 'openlayers/dist/ol-debug.js';
import { environment } from '../../environments/environment';
import { ConfigurationService } from '../configuration.service';
import { LocalStorageService } from '../local-storage/local-storage.service';

@Injectable()
export class MapService {
  private instance: ol.Map;
  private geoJSON: ol.format.GeoJSON = new ol.format.GeoJSON();
  layers: {[key: string]: ol.layer.Layer};

  constructor(private config: ConfigurationService, private localStorageService: LocalStorageService) {
    this.setLayers();
    this.instance = new ol.Map({
      controls: ol.control.defaults().extend([new ol.control.ScaleLine()]),
      interactions: ol.interaction.defaults({
        altShiftDragRotate: false,
        pinchRotate: false
      }),
      layers: Object.values(this.layers),
      view: new ol.View({
        center: ol.proj.fromLonLat([9.9880, 53.6126]),
        zoom: 14,
        maxZoom: 18
      })
    });
  }

  setTarget(target: string) {
    this.instance.setTarget(target);
  }

  private setLayers() {
    this.layers = {
      'geobasis': new ol.layer.Tile({
        source: new ol.source.TileWMS({
          url: 'https://geodienste.hamburg.de/HH_WMS_Kombi_DISK_GB',
          params: {
            LAYERS: '1,5,9,13',
            TILED: true,
            FORMAT: 'image/png',
            WIDTH: 256,
            HEIGHT: 256,
            SRS: 'EPSG:4326'
          }
        })
      }),
      'stadtteile': new ol.layer.Image({
        source: new ol.source.ImageWMS({
          url: 'https://geodienste.hamburg.de/HH_WMS_Verwaltungsgrenzen',
          params: {
            LAYERS: 'stadtteile',
            FORMAT: 'image/png',
            SRS: 'EPSG:4326'
          }
        })
      })
    };
  }
}
