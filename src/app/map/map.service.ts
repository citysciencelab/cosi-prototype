import { Injectable } from '@angular/core';
import * as ol from 'openlayers/dist/ol-debug.js';
import { environment } from '../../environments/environment';

@Injectable()
export class MapService {
  private instance: ol.Map;
  selectInteractions: { [key: string]: ol.interaction.Select };
  baseLayers: { [key: string]: ol.layer.Layer };
  thematicLayers: { [key: string]: ol.layer.Layer };
  defaultFill = new ol.style.Fill({
    color: [255, 255, 255, 0.4]
  });
  defaultStroke = new ol.style.Stroke({
    color: [51, 153, 204, 1],
    width: 1.25
  });

  constructor() {
    this.instance = new ol.Map();
    this.addControls();
    this.addLayers();
    this.addInteractions();
  }

  setTarget(target: string) {
    this.instance.setTarget(target);
  }

  setView(view: ol.View) {
    this.instance.setView(view);
  }

  showLayers(layerNames: string[]) {
    Object.values(this.thematicLayers).forEach(layer => {
      layer.setVisible(false);
    });
    layerNames.forEach(layerName => {
      this.thematicLayers[layerName].setVisible(true);
    });
  }

  private addControls() {
    ol.control.defaults().forEach(control => {
      this.instance.addControl(control);
    });
    this.instance.addControl(new ol.control.ScaleLine());
  }

  private addLayers() {
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
        }),
        zIndex: 10
      })
    };

    this.thematicLayers = {
      'kitas': new ol.layer.Vector({
        source: new ol.source.Vector({
          url: environment.geoserverUrl + 'csl/wms?service=WFS&version=1.1.0&request=GetFeature&typeName=csl:kitas' +
            '&outputFormat=application/json&srsname=EPSG:4326',
          format: new ol.format.GeoJSON()
        }),
        style: new ol.style.Style({
          image: new ol.style.Circle({
            fill: new ol.style.Fill({
              color: [255, 255, 255, 1]
            }),
            stroke: this.defaultStroke,
            radius: 5
          })
        }),
        visible: false,
        zIndex: 1
      }),
      'einwohner': new ol.layer.Vector({
        source: new ol.source.Vector({
          url: environment.geoserverUrl + 'csl/wms?service=WFS&version=1.1.0&request=GetFeature&typeName=csl:einwohner_0bis6' +
            '&outputFormat=application/json&srsname=EPSG:4326',
          format: new ol.format.GeoJSON()
        }),
        style: (feature) => {
          return new ol.style.Style({
            fill: new ol.style.Fill({
              color: this.getFill(feature, 'einwohner')
            }),
            stroke: new ol.style.Stroke({
              color: [135, 206, 252],
              width: 1
            })
          });
        },
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
            color: [0, 128, 0, 0.5]
          }),
          stroke: new ol.style.Stroke({
            color: [0, 128, 0, 1],
            width: 2
          })
        }),
        visible: false
      })
    };

    Object.values(this.baseLayers).forEach(layer => {
      this.instance.addLayer(layer);
    });
    Object.values(this.thematicLayers).forEach(layer => {
      this.instance.addLayer(layer);
    });
  }

  private addInteractions() {
    const defaultInteractions = ol.interaction.defaults({
      altShiftDragRotate: false,
      pinchRotate: false
    });

    this.selectInteractions = [
      new ol.interaction.Select({
        layers: [this.thematicLayers['einwohner']],
        style: (feature) => {
          return new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: [0, 153, 255, 1],
              width: 3
            }),
            fill: new ol.style.Fill({
              color: this.getFill(feature, 'einwohner')
            })
          });
        }
      })
    ];

    defaultInteractions.extend(this.selectInteractions).forEach(interaction => {
      this.instance.addInteraction(interaction);
    });
  }

  private getFill(feature: ol.Feature, layer: string) {
    const scales = {
      'einwohner': {
        0: [255, 0, 0, 0],
        50: [255, 0, 0, 0.2],
        100: [255, 0, 0, 0.4],
        150: [255, 0, 0, 0.6],
        200: [255, 0, 0, 0.8]
      }
    };

    const fillFunctions = {
      'einwohner': (f: ol.Feature) => {
        return this.getColorFromScale(scales['einwohner'], f.get('1bis6') / f.getGeometry().getArea() * 1000000);
      }
    };

    return fillFunctions[layer](feature);
  }

  private getColorFromScale(scale: { [key: string]: ol.Color | ol.ColorLike }, value: number) {
    if (value === null) {
      value = 0;
    }
    return Object.entries(scale).reduce((previous, current) => {
      const limit = parseInt(current[0], 10);
      if (value < limit) {
        return previous;
      }
      return current[1];
    }, [0, 0, 0]);
  }

}
