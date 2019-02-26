import {EventEmitter, Injectable} from '@angular/core';
import * as ol from 'openlayers';

@Injectable()
export class MapService {
  private instance: ol.Map;
  selectInteraction: ol.interaction.Select;
  baseLayers: MapLayer[];
  topicLayers: MapLayer[];

  constructor() {
    this.instance = new ol.Map({
      interactions: ol.interaction.defaults({
        altShiftDragRotate: false,
        pinchRotate: false
      }),
      controls: []
    });
  }

  on(type: string, listener: ol.EventsListenerFunctionType) {
    this.instance.on(type, listener);
  }

  setTarget(target: string) {
    this.instance.setTarget(target);
  }

  setView(view: ol.View) {
    this.instance.setView(view);
  }

  setPopUp(popup: ol.Overlay) {
    this.instance.addOverlay(popup);
  }

  getView() {
    return this.instance.getView();
  }

  setSources(baseLayersConfig: MapLayer[], topicLayersConfig: MapLayer[]) {
    this.baseLayers = this.generateLayers(baseLayersConfig);
    this.topicLayers = this.generateLayers(topicLayersConfig);

    this.generateStyles(this.baseLayers);
    this.generateStyles(this.topicLayers);

    for (const layer of this.topicLayers.concat(this.baseLayers).reverse()) {
      Object.values(layer.olLayer).forEach(olLayer => {
        this.instance.addLayer(olLayer);
        // Set the default style for each vector layer
        if (olLayer.constructor === ol.layer.Vector) {
          (<ol.layer.Vector>olLayer).setStyle(layer.olDefaultStyle);
        }
      });
    }

    // FIXME these should probably go somewhere else
    this.addControls();
    this.addInteractions();
  }

  showBaseLayers(layerNames: string[]) {
    for (const layer of this.baseLayers) {
      Object.values(layer.olLayer).forEach(olLayer => olLayer.setVisible(layerNames.indexOf(layer.name) > -1));
    }
  }

  showLayers(layerNames: string[], topicName: string, stageName: string) {
    for (const layer of this.topicLayers) {
      if (layer.topic === topicName) {
        // Set layer visibility
        layer.visible = layerNames.indexOf(layer.name) > -1;
        // Show/hide layers
        for (const [key, olLayer] of Object.entries(layer.olLayer)) {
          olLayer.setVisible(layer.visible && (key === stageName || key === '*'));
        }
      } else {
        // Hide all other topics
        for (const olLayer of Object.values(layer.olLayer)) {
          olLayer.setVisible(false);
        }
      }
    }
  }

  showLayersNoTopic(layerNames: string[]) {
    for (const layer of this.topicLayers) {
      // Set layer visibility
      layer.visible = layerNames.indexOf(layer.name) > -1;
      // Show/hide layers
      for (const [key, olLayer] of Object.entries(layer.olLayer)) {
        olLayer.setVisible(layer.visible);
      }
    }
  }

  getLayerByFeature(feature: ol.Feature): MapLayer {
    // This whole thing becomes problematic as soon as more than one layer is using the same vector data source ...
    const vectorLayers = this.topicLayers.filter(layer => layer.type === 'Vector');
    let matchingLayer;
    for (const layer of vectorLayers) {
      for (const olLayer of Object.values(layer.olLayer)) {
        const source = <ol.source.Vector>olLayer.getSource();
        source.forEachFeature(f => {
          if (feature.getId() === f.getId()) {
            matchingLayer = layer;
          }
        });
      }
    }
    return matchingLayer;
  }

  private generateLayers(layersConfig: MapLayer[]): MapLayer[] {
    return layersConfig.map(layer => {
      // Normalize the config fields
      if (!layer.sources) {
        layer.sources = {};
      }
      if (layer.source) {
        if (!layer.sources.hasOwnProperty('*')) {
          layer.sources['*'] = layer.source;
        } else {
          console.warn('Not overriding the "*" source with "source" value in layer ' + layer.name);
        }
      }
      return layer;
    }).map(layer => {
      // Create the OpenLayers layers
      layer.olLayer = {};
      const sourceEntries = Object.entries(layer.sources);
      if (sourceEntries.length === 0) {
        throw new Error('No sources provided for layer ' + layer.name);
      }
      for (const [key, source] of sourceEntries) {
        switch (layer.type) {
          case 'OSM':
            layer.olLayer[key] = new ol.layer.Tile({
              source: new ol.source.OSM({
                url: source.url ? source.url : undefined
              }),
              opacity: layer.opacity,
              zIndex: layer.zIndex,
              visible: false
            });
            break;
          case 'Tile':
            layer.olLayer[key] = new ol.layer.Tile({
              source: new ol.source.TileImage({
                url: source.url,
                projection: source.projection
              }),
              opacity: layer.opacity,
              zIndex: layer.zIndex,
              visible: false
            });
            break;
          case 'WMS':
            if (!source.wmsParams) {
              throw new Error('No WMS params defined for layer ' + layer.name);
            }
            if (source.wmsParams.TILED) {
              layer.olLayer[key] = new ol.layer.Tile({
                source: new ol.source.TileWMS({
                  url: source.url,
                  params: source.wmsParams
                }),
                opacity: layer.opacity,
                zIndex: layer.zIndex,
                visible: false
              });
            } else {
              layer.olLayer[key] = new ol.layer.Image({
                source: new ol.source.ImageWMS({
                  url: source.url,
                  params: source.wmsParams,
                  projection: source.wmsProjection
                }),
                opacity: layer.opacity,
                zIndex: layer.zIndex,
                visible: false
              });
            }
            break;
          case 'Vector':
            if (!source.format || typeof ol.format[source.format] !== 'function') {
              throw new Error('No vector format provided for layer ' + layer.name);
            }
            layer.olLayer[key] = new ol.layer.Vector({
              renderMode: 'image', // for performance
              source: new ol.source.Vector({
                url: source.url,
                format: new ol.format[source.format]()
              }),
              opacity: layer.opacity,
              zIndex: layer.zIndex,
              visible: false
            });
            break;
          case 'Heatmap':
            layer.olLayer[key] = new ol.layer.Heatmap({
              source: new ol.source.Vector({
                url: source.url,
                format: new ol.format[source.format]()
              }),
              weight: layer.weightAttribute ? feature => feature.get(layer.weightAttribute) / layer.weightAttributeMax : feature => 1,
              gradient: layer.gradient && layer.gradient.length > 1 ? layer.gradient : ['#0ff', '#0f0', '#ff0', '#f00'],
              radius: layer.radius !== undefined ? layer.radius : 16,
              blur: layer.blur !== undefined ? layer.blur : 30,
              opacity: layer.opacity,
              zIndex: layer.zIndex,
              visible: false
            });
            break;
        }
      }
      return layer;
    }) || [];
  }

  private generateStyles(layers: MapLayer[]) {
    for (const layer of layers) {
      if (layer.style) {
        layer.olDefaultStyle = this.styleConfigToStyleFunction(layer.style, layer.scale, layer.scaleAttribute);
      }
      if (layer.selectedStyle) {
        layer.olSelectedStyle = this.styleConfigToStyleFunction(layer.selectedStyle, layer.scale, layer.scaleAttribute);
      }
    }
  }

  private styleConfigToStyleFunction(style: LayerStyle, scale: { [key: string]: ol.Color }, scaleAttribute: string): ol.StyleFunction {
    // Function to build a Fill object
    const getFill = (feature: ol.Feature) => {
      if (style.fill.color) {
        return new ol.style.Fill(style.fill);
      }
      if (style.fill.categorizedScale) {
        return new ol.style.Fill({
          color: this.getColorFromCategorizedScale(feature, scaleAttribute, scale)
        });
      }
      if (style.fill.graduatedScale) {
        return new ol.style.Fill({
          color: this.getColorFromGraduatedScale(feature, scaleAttribute, scale)
        });
      }
    };

    // Function to build a Stroke object
    const getStroke = (feature: ol.Feature) => {
      if (style.stroke.color) {
        return new ol.style.Stroke(style.stroke);
      }
      if (style.stroke.categorizedScale) {
        return new ol.style.Stroke({
          color: this.getColorFromCategorizedScale(feature, scaleAttribute, scale),
          width: style.stroke.width
        });
      }
      if (style.stroke.graduatedScale) {
        return new ol.style.Stroke({
          color: this.getColorFromGraduatedScale(feature, scaleAttribute, scale),
          width: style.stroke.width
        });
      }
    };

    const minResolution = style.text && style.text.minResolution ? style.text.minResolution : 0;
    const maxResolution = style.text && style.text.maxResolution ? style.text.maxResolution : Infinity;

    // Here the actual style function is returned
    return (feature: ol.Feature, resolution: number) => new ol.style.Style({
      fill: style.fill ? getFill(feature) : null,
      stroke: style.stroke ? getStroke(feature) : null,
      image: style.circle ? new ol.style.Circle({
        radius: style.circle.radius,
        fill: new ol.style.Fill(style.circle.fill),
        stroke: new ol.style.Stroke(style.circle.stroke)
      }) : null,
      text: style.text && resolution <= maxResolution && resolution >= minResolution ? new ol.style.Text({
        text: this.formatText(feature.get(style.text.attribute), style.text.round),
        font: style.text.font,
        fill: new ol.style.Fill(style.text.fill),
        stroke: new ol.style.Stroke(style.text.stroke),
        offsetX: style.text.offsetX,
        offsetY: style.text.offsetY
      }) : null
    });
  }

  private formatText(value: any, round: boolean): string {
    if (value === null) {
      return '';
    }
    if (typeof value === 'number') {
      value = round ? Math.round(value) : value;
    }
    return '' + value;
  }

  private getColorFromCategorizedScale(feature: ol.Feature, attribute: string, scale: { [key: string]: ol.Color }): ol.Color {
    if (!scale) {
      throw new Error('Cannot apply style: scale is not defined');
    }
    if (!attribute) {
      throw new Error('Cannot apply style: scale attribute is not defined');
    }
    return scale[feature.get(attribute)];
  }

  private getColorFromGraduatedScale(feature: ol.Feature, attribute: string, scale: { [key: string]: ol.Color }): ol.Color {
    if (!scale) {
      throw new Error('Cannot apply style: scale is not defined');
    }
    if (!attribute) {
      throw new Error('Cannot apply style: scale attribute is not defined');
    }
    let value = feature.get(attribute);
    if (value === null) {
      value = 0;
    }
    if (typeof value !== 'number') {
      throw new Error('Cannot apply style: value is not a number');
    }
    return Object.entries(scale).reduce((previous, current) => {
      const limit = parseInt(current[0], 10);
      if (value < limit) {
        return previous;
      }
      return current[1];
    }, <ol.Color>[0, 0, 0, 1]);
  }

  private addInteractions() {
    this.selectInteraction = new ol.interaction.Select({
      // Selectable layers
      layers: this.topicLayers.filter(layer => layer.selectable).reduce((layers: ol.layer.Layer[], layer) => {
        layers.push(... Object.values(layer.olLayer));
        return layers;
      }, []),
      // Because multiple select interactions for different layers don't work,
      // the layer needs to be determined within the style function. This way we can
      // use the styling associated with the layer the selected feature belongs to.
      style: (feature: ol.Feature, resolution: number) => {
        const selectedLayer = this.getLayerByFeature(feature);
        if (typeof selectedLayer.olSelectedStyle !== 'function') {
          return;
        }
        return selectedLayer.olSelectedStyle(feature, resolution);
      },
      hitTolerance: 8
    });

    this.instance.addInteraction(this.selectInteraction);
  }

  private addControls() {
    const controls = [new ol.control.Zoom()];

    controls.forEach(control => {
      this.instance.addControl(control);
    });
  }

}
