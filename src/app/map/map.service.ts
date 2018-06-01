import { EventEmitter, Injectable } from '@angular/core';
import * as ol from 'openlayers';
import { environment } from '../../environments/environment';
import {LocalStorageService} from '../local-storage/local-storage.service';
import {LocalStorageMessage} from '../local-storage/local-storage-message.model';

const white = <ol.Color>[255, 255, 255, 1];
const blue = <ol.Color>[0, 153, 255, 1];
const lightskyblue = <ol.Color>[135, 206, 250, 1];
const red = <ol.Color>[255, 0, 0, 1];
const crimson = <ol.Color>[220, 20, 60, 1];
const purple = <ol.Color>[128, 0, 128, 1];

@Injectable()
export class MapService {
  private instance: ol.Map;
  selectInteraction: ol.interaction.Select;
  baseLayers: { [key: string]: ol.layer.Layer };
  thematicLayers: { [key: string]: { [key: string]: ol.layer.Layer } };
  isFirstClick = false;
  toolStartEvent = new EventEmitter<any>();

  // Map config
  mapCenter = ol.proj.fromLonLat([9.9880, 53.6126]);
  mapZoom = 14;

  constructor(private localStorageService: LocalStorageService) {
    this.instance = new ol.Map({});
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

  getView() {
    return this.instance.getView();
  }

  showBaseLayers(layerNames: string[]) {
    Object.values(this.baseLayers).forEach(layer => {
      layer.setVisible(false);
    });
    layerNames.forEach(layerName => {
      if (this.baseLayers.hasOwnProperty(layerName)) {
        this.baseLayers[layerName].setVisible(true);
      }
    });
  }

  showLayers(layerGroupNames: string[], layerName: string) {
    Object.entries(this.thematicLayers).forEach(([layerGroupName, layerGroup]) => {
      // Hide all layers
      Object.values(layerGroup).forEach(layer => {
        layer.setVisible(false);
      });
      if (layerGroupNames.indexOf(layerGroupName) > -1) {
        // Show requested layers
        if (layerGroup.hasOwnProperty(layerName)) {
          layerGroup[layerName].setVisible(true);
        }
        // Show static ('*') layers
        if (layerGroup.hasOwnProperty('*')) {
          layerGroup['*'].setVisible(true);
        }
      }
    });
  }

  getLayerByFeature(feature: ol.Feature): string {
    let matchingLayer;
    for (const [identifier, layerGroup] of Object.entries(this.thematicLayers)) {
      for (const layer of Object.values(layerGroup)) {
        const source = <ol.source.Vector>layer.getSource();

        // Skip non-vector sources
        if (typeof source.forEachFeature !== 'function') {
          continue;
        }
        source.forEachFeature(f => {
          if (feature.getId() === f.getId()) {
            matchingLayer = identifier;
            return;
          }
        });
      }
    }
    return matchingLayer;
  }

  private addControls() {
    const controls = ol.control.defaults().extend([new ol.control.ScaleLine()]);

    controls.forEach(control => {
      this.instance.addControl(control);
    });
  }

  private addLayers() {
    // The order of the layers affects the rendering order when zIndex values are equal.
    this.baseLayers = {
      'osm': new ol.layer.Tile({
        source: new ol.source.OSM()
      }),
      'dop20': new ol.layer.Tile({
        source: new ol.source.TileWMS({
          url: 'https://geodienste.hamburg.de/HH_WMS_DOP20',
          params: {
            LAYERS: '1',
            TILED: true,
            FORMAT: 'image/png',
            WIDTH: 256,
            HEIGHT: 256,
            SRS: 'EPSG:4326'
          }
        })
      }),
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
          },
          projection: 'EPSG:25832'
        }),
        zIndex: 10
      }),
      'sozialmonitoring': new ol.layer.Vector({
        source: new ol.source.Vector({
          url: environment.geoserverUrl + 'csl/wms?service=WFS&version=1.1.0&request=GetFeature&typeName=csl:sozialmonitoring2016' +
            '&outputFormat=application/json&srsname=EPSG:4326',
          format: new ol.format.GeoJSON()
        })
      }),
      'grossborstel': new ol.layer.Vector({
        source: new ol.source.Vector({
          url: environment.geoserverUrl + 'csl/wms?service=WFS&version=1.1.0&request=GetFeature&typeName=csl:grossborstel' +
            '&outputFormat=application/json&srsname=EPSG:4326',
          format: new ol.format.GeoJSON()
        }),
        zIndex: 100
      })
    };

    // The order of the layers affects the rendering order when zIndex values are equal.
    this.thematicLayers = {
      // Vector layers
      'kitas': {
        'before': new ol.layer.Vector({
          source: new ol.source.Vector({
            url: environment.geoserverUrl + 'csl/wms?service=WFS&version=1.1.0&request=GetFeature&typeName=csl:kitas' +
              '&outputFormat=application/json&srsname=EPSG:4326',
            format: new ol.format.GeoJSON()
          }),
          zIndex: 10
        }),
        'after': new ol.layer.Vector({
          source: new ol.source.Vector({
            url: environment.geoserverUrl + 'csl/wms?service=WFS&version=1.1.0&request=GetFeature&typeName=csl:kitas_neu' +
              '&outputFormat=application/json&srsname=EPSG:4326',
            format: new ol.format.GeoJSON()
          }),
          zIndex: 10
        })
      },
      'einwohner': {
        'before': new ol.layer.Vector({
          source: new ol.source.Vector({
            url: environment.geoserverUrl + 'csl/wms?service=WFS&version=1.1.0&request=GetFeature&typeName=csl:einwohner_0bis6' +
              '&outputFormat=application/json&srsname=EPSG:4326',
            format: new ol.format.GeoJSON()
          }),
          zIndex: 1
        }),
        'after': new ol.layer.Vector({
          source: new ol.source.Vector({
            url: environment.geoserverUrl + 'csl/wms?service=WFS&version=1.1.0&request=GetFeature&typeName=csl:einwohner_0bis6_neu' +
              '&outputFormat=application/json&srsname=EPSG:4326',
            format: new ol.format.GeoJSON()
          }),
          zIndex: 1
        })
      },
      'stadtteileKitaplaetze': {
        'before': new ol.layer.Vector({
          source: new ol.source.Vector({
            url: environment.geoserverUrl + 'csl/wms?service=WFS&version=1.1.0&request=GetFeature&typeName=csl:stadtteile_grossborstel' +
              '&outputFormat=application/json&srsname=EPSG:4326',
            format: new ol.format.GeoJSON()
          }),
          zIndex: 2
        }),
        'after': new ol.layer.Vector({
          source: new ol.source.Vector({
            url: environment.geoserverUrl + 'csl/wms?service=WFS&version=1.1.0&request=GetFeature' +
              '&typeName=csl:stadtteile_grossborstel_neu&outputFormat=application/json&srsname=EPSG:4326',
            format: new ol.format.GeoJSON()
          }),
          zIndex: 2
        })
      },
      'gruenflaechen': {
        '*': new ol.layer.Vector({
          source: new ol.source.Vector({
            url: environment.geoserverUrl + 'csl/wms?service=WFS&version=1.1.0&request=GetFeature&typeName=csl:gruenflaechen' +
              '&outputFormat=application/json&srsname=EPSG:4326',
            format: new ol.format.GeoJSON()
          }),
          zIndex: 1
        })
      },
      'supermaerkte': {
        '*': new ol.layer.Vector({
          source: new ol.source.Vector({
            url: 'https://overpass-api.de/api/interpreter' +
              '?data=(area[name="Hamburg"];)->.a;node["shop"="supermarket"](area.a);out;',
            format: new ol.format.OSMXML()
          })
        })
      },
      'apotheken': {
        '*': new ol.layer.Vector({
          source: new ol.source.Vector({
            url: 'https://overpass-api.de/api/interpreter' +
              '?data=(area[name="Hamburg"];)->.a;node["amenity"="pharmacy"](area.a);out;',
            format: new ol.format.OSMXML()
          }),
          zIndex: 1
        })
      },
      // Heatmap layers
      'kitasHeatmap': {
        'before': new ol.layer.Heatmap({
          source: new ol.source.Vector({
            url: environment.geoserverUrl + 'csl/wms?service=WFS&version=1.1.0&request=GetFeature&typeName=csl:kitas' +
              '&outputFormat=application/json&srsname=EPSG:4326',
            format: new ol.format.GeoJSON()
          }),
          gradient: ['#0ff', '#0f0', '#ff0', '#f00'],
          weight: feature => feature.get('KapKindneu') / 350,
          radius: 16,
          blur: 30,
          zIndex: 11
        }),
        'after': new ol.layer.Heatmap({
          source: new ol.source.Vector({
            url: environment.geoserverUrl + 'csl/wms?service=WFS&version=1.1.0&request=GetFeature&typeName=csl:kitas_neu' +
              '&outputFormat=application/json&srsname=EPSG:4326',
            format: new ol.format.GeoJSON()
          }),
          gradient: ['#0ff', '#0f0', '#ff0', '#f00'],
          weight: feature => feature.get('KapKindneu') / 350,
          radius: 16,
          blur: 30,
          zIndex: 11
        })
      },
      // Tile layers
      'kitasGehzeit': {
        '*': new ol.layer.Tile({
          source: new ol.source.TileWMS({
            url: 'https://geodienste.hamburg.de/MRH_WMS_REA_Soziales',
            params: {
              LAYERS: '6',
              TILED: true,
              FORMAT: 'image/png',
              WIDTH: 256,
              HEIGHT: 256,
              SRS: 'EPSG:4326'
            }
          }),
          opacity: 0.6
        })
      },
      'supermaerkteGehzeit': {
        '*': new ol.layer.Tile({
          source: new ol.source.TileWMS({
            url: 'https://geodienste.hamburg.de/MRH_WMS_REA_Einzelhandel',
            params: {
              LAYERS: '2',
              TILED: true,
              FORMAT: 'image/png',
              WIDTH: 256,
              HEIGHT: 256,
              SRS: 'EPSG:4326'
            }
          }),
          opacity: 0.6
        })
      },
      'apothekenGehzeit': {
        '*': new ol.layer.Tile({
          source: new ol.source.TileWMS({
            url: 'https://geodienste.hamburg.de/MRH_WMS_REA_Gesundheit',
            params: {
              LAYERS: '2',
              TILED: true,
              FORMAT: 'image/png',
              WIDTH: 256,
              HEIGHT: 256,
              SRS: 'EPSG:4326'
            }
          }),
          opacity: 0.6
        })
      },
      'flurstuecke': {
        '*': new ol.layer.Tile({
          source: new ol.source.TileWMS({
            url: environment.geoserverUrl + 'csl/wms',
            params: {
              LAYERS: 'csl:flurstuecke',
              STYLES: 'flurstuecke_neu',
              TILED: true,
              FORMAT: 'image/png',
              WIDTH: 256,
              HEIGHT: 256,
              SRS: 'EPSG:4326'
            }
          })
        })
      }
    };

    Object.entries(this.baseLayers).forEach(([layerName, layer]) => {
      this.instance.addLayer(layer);
      // Set the default style for each vector layer
      if (layer.constructor === ol.layer.Vector) {
        (<ol.layer.Vector>layer).setStyle(this.getStyleFunction(layerName, false));
      }
    });

    Object.entries(this.thematicLayers).forEach(([layerGroupName, layerGroup]) => {
      Object.values(layerGroup).forEach(layer => {
        this.instance.addLayer(layer);
        // Set the default style for each vector layer
        if (layer.constructor === ol.layer.Vector) {
          (<ol.layer.Vector>layer).setStyle(this.getStyleFunction(layerGroupName, false));
        }
        layer.setVisible(false);
      });
    });
  }

  private addInteractions() {
    const defaultInteractions = ol.interaction.defaults({
      altShiftDragRotate: false,
      pinchRotate: false
    });

    // Just for the 'start-click'
    this.instance.on('singleclick', this.mapClickHandler);

    this.selectInteraction = new ol.interaction.Select({
      layers: [
        this.thematicLayers['kitas']['before'],
        this.thematicLayers['kitas']['after'],
        this.thematicLayers['einwohner']['before'],
        this.thematicLayers['einwohner']['after'],
        this.thematicLayers['supermaerkte']['*'],
        this.thematicLayers['apotheken']['*'],
        this.thematicLayers['gruenflaechen']['*']
      ],
      // Because multiple select interactions for different layers don't work,
      // the layer needs to be determined within the style function. This way we can
      // use the styling associated with the layer the selected feature belongs to.
      style: (feature: ol.Feature, resolution: number) => {
        const selectedLayer = this.getLayerByFeature(feature);
        const styleFunction = this.getStyleFunction(selectedLayer, true);
        if (typeof styleFunction !== 'function') {
          return;
        }
        return styleFunction(feature, resolution);
      },
      hitTolerance: 8
    });

    const interactions = defaultInteractions.extend([this.selectInteraction]);

    interactions.forEach(interaction => {
      this.instance.addInteraction(interaction);
    });
  }

  mapClickHandler = (evt) => {
    if (!this.isFirstClick) {
      this.isFirstClick = true;
      this.getView().animate({ zoom: this.mapZoom}, { center: this.mapCenter });

      const message: LocalStorageMessage<{}> = { type: 'tool-interaction', data: {name : 'tool-start'} };
      this.localStorageService.sendMessage(message);

      this.toolStartEvent.emit('tool-start');
    }
  }

  private getStyleFunction(layer: string, selected: boolean): ol.StyleFunction {
    // This map contains style definitions for all layers (deselected/selected)
    const styles = {
      'kitas': {
        default: (feature: ol.Feature, resolution: number) => new ol.style.Style({
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({ color: white }),
            stroke: new ol.style.Stroke({ color: blue, width: 1.5 })
          }),
          text: resolution < 10 ? new ol.style.Text({
            text: '' + (Math.round(feature.get('KapKindneu')) || 0),
            font: '18px sans-serif',
            fill: new ol.style.Fill({ color: white }),
            stroke: new ol.style.Stroke({ color: blue, width: 2 }),
            offsetY: -16
          }) : null
        }),
        selected: (feature: ol.Feature, resolution: number) => new ol.style.Style({
          image: new ol.style.Circle({
            radius: 8,
            fill: new ol.style.Fill({ color: blue }),
            stroke: new ol.style.Stroke({ color: white, width: 1.5 })
          }),
          text: resolution < 10 ? new ol.style.Text({
            text: '' + (Math.round(feature.get('KapKindneu')) || 0),
            font: '18px sans-serif',
            fill: new ol.style.Fill({ color: white }),
            stroke: new ol.style.Stroke({ color: blue, width: 2 }),
            offsetY: -16
          }) : null
        })
      },
      'stadtteileKitaplaetze': {
        default: (feature: ol.Feature, resolution: number) => new ol.style.Style({
          stroke: new ol.style.Stroke({ color: purple, width: 1.5 }),
          text: new ol.style.Text({
            text: ('' + (feature.get('Kpl p K') || '')).replace(/\./, ','),
            font: '22px sans-serif',
            fill: new ol.style.Fill({ color: white }),
            stroke: new ol.style.Stroke({ color: purple, width: 2 })
          })
        })
      },
      'einwohner': {
        default: (feature: ol.Feature, resolution: number) => new ol.style.Style({
          fill: new ol.style.Fill({
            color: this.getColor(feature, 'einwohner')
          }),
          stroke: new ol.style.Stroke({ color: red, width: 0.5 }),
          text: resolution < 10 ? new ol.style.Text({
            text: '' + (feature.get('1bis6') || 0),
            font: '18px sans-serif',
            fill: new ol.style.Fill({ color: white }),
            stroke: new ol.style.Stroke({ color: red, width: 2 })
          }) : null
        }),
        selected: (feature: ol.Feature, resolution: number) => new ol.style.Style({
          fill: new ol.style.Fill({
            color: this.getColor(feature, 'einwohner')
          }),
          stroke: new ol.style.Stroke({ color: red, width: 2 }),
          text: resolution < 10 ? new ol.style.Text({
            text: '' + (feature.get('1bis6') || 0),
            font: '18px sans-serif',
            fill: new ol.style.Fill({ color: white }),
            stroke: new ol.style.Stroke({ color: red, width: 2 })
          }) : null
        })
      },
      'apotheken': {
        default: (feature: ol.Feature) => new ol.style.Style({
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({ color: white }),
            stroke: new ol.style.Stroke({ color: crimson, width: 1.5 })
          })
        }),
        selected: (feature: ol.Feature) => new ol.style.Style({
          image: new ol.style.Circle({
            radius: 8,
            fill: new ol.style.Fill({ color: crimson }),
            stroke: new ol.style.Stroke({ color: white, width: 1.5 })
          })
        })
      },
      'supermaerkte': {
        default: (feature: ol.Feature) => new ol.style.Style({
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({ color: white }),
            stroke: new ol.style.Stroke({ color: blue, width: 1.5 })
          })
        }),
        selected: (feature: ol.Feature) => new ol.style.Style({
          image: new ol.style.Circle({
            radius: 8,
            fill: new ol.style.Fill({ color: blue }),
            stroke: new ol.style.Stroke({ color: white, width: 1.5 })
          })
        })
      },
      'gruenflaechen': {
        default: (feature: ol.Feature) => new ol.style.Style({
          fill: new ol.style.Fill({
            color: this.getColor(feature, 'gruenflaechen')
          }),
          stroke: new ol.style.Stroke({
            color: this.getColor(feature, 'gruenflaechen'),
            width: 2
          })
        }),
        selected: (feature: ol.Feature) => new ol.style.Style({
          fill: new ol.style.Fill({
            color: this.getColor(feature, 'gruenflaechen')
          }),
          stroke: new ol.style.Stroke({
            color: blue,
            width: 3
          })
        })
      },
      'sozialmonitoring': {
        default: (feature: ol.Feature) => new ol.style.Style({
          fill: new ol.style.Fill({
            color: this.getColor(feature, 'sozialmonitoring')
          }),
          stroke: new ol.style.Stroke({
            color: this.getColor(feature, 'sozialmonitoring'),
            width: 2
          })
        }),
        selected: (feature: ol.Feature) => new ol.style.Style({
          fill: new ol.style.Fill({
            color: this.getColor(feature, 'sozialmonitoring')
          }),
          stroke: new ol.style.Stroke({
            color: blue,
            width: 3
          })
        })
      },
      'grossborstel': {
        default: (feature: ol.Feature) => new ol.style.Style({
          stroke: new ol.style.Stroke({ color: blue, width: 5 })
        })
      }
    };

    if (!styles.hasOwnProperty(layer)) {
      return;
    }
    if (selected && styles[layer].hasOwnProperty('selected')) {
      return styles[layer]['selected'];
    }
    return styles[layer]['default'];
  }

  private getColor(feature: ol.Feature, layer: string): ol.Color {
    const scales: { [key: string]: { [key: string]: ol.Color } } = {
      'einwohner': {
        0: [255, 0, 0, 0],    // 0-9
        10: [255, 0, 0, 0.2], // 10-24
        25: [255, 0, 0, 0.4], // 25-49
        50: [255, 0, 0, 0.6], // 50-89
        90: [255, 0, 0, 0.8]  // 90-
      }
    };
    const categories: { [key: string]: { [key: string]: ol.Color } } = {
      'gruenflaechen': {
        'Kleingarten': [160, 82, 45, 0.6],
        'Dauerkleingarten': [160, 82, 45, 0.6],
        'Grün an Kleingärten': [160, 82, 45, 0.6],
        'Parkanlage': [60, 179, 113, 0.6],
        'Spielplatz': [124, 252, 0, 0.6],
        'Friedhof': [72, 209, 204, 0.6],
        'Schutzgrün': [199, 21, 133, 0.6],
        'anderweitige Nutzung': [106, 90, 205, 0.6]
      },
      'sozialmonitoring': {
        // Status hoch
        1: [76, 115, 0, 0.6],
        2: [112, 168, 0, 0.6],
        3: [200, 215, 158, 0.6],
        // Status mittel
        4: [0, 133, 168, 0.6],
        5: [115, 178, 255, 0.6],
        6: [189, 210, 255, 0.6],
        // Status niedrig
        7: [255, 234, 189, 0.6],
        8: [255, 170, 1, 0.6],
        9: [168, 112, 1, 0.6],
        // Status sehr niedrig
        10: [230, 173, 188, 0.6],
        11: [229, 83, 122, 0.6],
        12: [179, 29, 30, 0.6],
      }
    };

    const fillFunctions = {
      'einwohner': (f: ol.Feature) => {
        return this.getColorFromScale(scales['einwohner'], f.get('1bis6'));
      },
      'gruenflaechen': (f: ol.Feature) => {
        return categories['gruenflaechen'][f.get('gruenart')];
      },
      'sozialmonitoring': (f: ol.Feature) => {
        return categories['sozialmonitoring'][f.get('Gesamtinde')];
      }
    };

    if (!fillFunctions.hasOwnProperty(layer)) {
      return;
    }
    return fillFunctions[layer](feature);
  }

  private getColorFromScale(scale: { [key: string]: ol.Color }, value: number): ol.Color {
    if (value === null) {
      value = 0;
    }
    return Object.entries(scale).reduce((previous, current) => {
      const limit = parseInt(current[0], 10);
      if (value < limit) {
        return previous;
      }
      return current[1];
    }, <ol.Color>[0, 0, 0, 1]);
  }
}
