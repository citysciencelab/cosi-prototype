import { Injectable } from '@angular/core';
import * as ol from 'openlayers/dist/ol-debug.js';
import { environment } from '../../environments/environment';
import { ConfigurationService } from '../configuration.service';
import { LocalStorageService } from '../local-storage/local-storage.service';

@Injectable()
export class MapService {
  private instance: ol.Map;
  private geoJSON: ol.format.GeoJSON = new ol.format.GeoJSON();
  baseLayers: {[key: string]: ol.layer.Layer};
  thematicLayers: {[key: string]: ol.layer.Layer};

  constructor(private config: ConfigurationService, private localStorageService: LocalStorageService) {
    this.setLayers();
    this.instance = new ol.Map({
      controls: ol.control.defaults().extend([new ol.control.ScaleLine()]),
      interactions: ol.interaction.defaults({
        altShiftDragRotate: false,
        pinchRotate: false
      }),
      layers: Object.values(this.baseLayers).concat(Object.values(this.thematicLayers)),
      view: new ol.View({
        center: ol.proj.fromLonLat([9.9880, 53.6126]),
        zoom: 14,
        minZoom: 11,
        maxZoom: 18
      })
    });
  }

  setTarget(target: string) {
    this.instance.setTarget(target);
  }

  showLayers(layerNames: string[]) {
    Object.values(this.thematicLayers).forEach(layer => {
      layer.setVisible(false);
    });
    layerNames.forEach(layerName => {
      this.thematicLayers[layerName].setVisible(true);
    });
  }

  private setLayers() {
    this.baseLayers = {
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

    this.thematicLayers = {
      'kitas': new ol.layer.Image({
        source: new ol.source.ImageWMS({
          url: 'https://geodienste.hamburg.de/HH_WMS_KitaEinrichtung',
          params: {
            LAYERS: 'theme_hh_kitaeinrichtung',
            FORMAT: 'image/png'
          }
        }),
        visible: false
      }),
      // 'nahversorgung'
      'gruenflaechen': new ol.layer.Vector({
        source: new ol.source.Vector({
          url: environment.geoserverUrl + 'csl/wms?service=WFS&version=1.1.0&request=GetFeature&typeName=csl:gruenflaechen' +
            '&outputFormat=application/json&srsname=EPSG:4326',
          format: new ol.format.GeoJSON()
        }),
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(0, 128, 0, 0.5)'
          }),
          stroke: new ol.style.Stroke({
            color: 'rgba(0, 128, 0, 1)',
            width: 2
          })
        }),
        visible: false
      })
    };
  }
}
