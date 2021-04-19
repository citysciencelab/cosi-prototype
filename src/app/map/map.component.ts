import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import Overlay from 'ol/Overlay';
import Feature from 'ol/Feature';
import { Coordinate } from 'ol/coordinate';
import Select from 'ol/interaction/Select.js';
import MapBrowserEvent from 'ol/MapBrowserEvent';

import * as olcs from 'ol-cityscope';

import { ConfigurationService } from '../configuration.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { LocalStorageMessage } from '../local-storage/local-storage-message.model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Output() select = new EventEmitter<Select>();
  @Output() toolStart = new EventEmitter<string>();
  private isFirstClick = false;

  // Map config
  center: Coordinate;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  popUp: Overlay;
  disableInfoScreen = false;

  constructor(private config: ConfigurationService, private csMap: olcs.CsMap, private localStorageService: LocalStorageService) {
    this.center = config.mapCenter;
    this.zoom = config.mapZoom;
    this.minZoom = config.mapMinZoom;
    this.maxZoom = config.mapMaxZoom;
    this.disableInfoScreen = this.config.disableInfoScreen;
  }

  ngOnInit() {
    this.csMap.setTarget('map');
    this.csMap.setView(
      this.center,
      this.zoom - 3, // the zoom animation will correct the zoom level later
      this.minZoom,
      this.maxZoom
    );
    if (this.config.disableInfoScreen) {
      const element = document.getElementById('popup');
      this.popUp = this.csMap.buildPopup(element);
      this.csMap.setPopUp(this.popUp);
      return;
    } else {
      // FIXME
      // const selectableLayers: MapLayer[] = this.map.topicLayers.filter(layer => layer.selectable);
      // for (const layer of selectableLayers) {
      //   for (const olLayer of Object.values(layer.olLayers)) {
      //     olLayer.selectInteraction.on('select', (e: ol.interaction.Select.Event) => {
      //       this.select.emit(e);
      //     });
      //   }
      // }
      this.csMap.map.on('select', e => this.select.emit(e as Select));
    }

    // Just for the 'start-click'
    this.csMap.on('singleclick', this.onMapClick.bind(this));
  }

  reset() {
    this.csMap.getView().animate({ zoom: this.zoom }, { center: this.center });
  }

  clearSelectedFeatures() {
    // FIXME
    // const selectableLayers: MapLayer[] = this.map.topicLayers.filter(layer => layer.selectable);
    // for (const layer of selectableLayers) {
    //   for (const olLayer of Object.values(layer.olLayers)) {
    //     olLayer.selectInteraction.getFeatures().clear();
    //   }
    // }
  }

  // getLayerByFeature(feature: Feature) {
  //  return this.map.getLayerByFeature(feature);
  // }

  onMapClick(evt: MapBrowserEvent) {
    if (!this.isFirstClick) {
      this.csMap.getView().animate(
        { zoom: this.zoom },
        { center: this.csMap.fromLonLat(this.center) }
      );

      const message: LocalStorageMessage<{}> = {
        type: 'tool-interaction',
        data: { name: 'tool-start' }
      };
      this.localStorageService.sendMessage(message);
      this.toolStart.emit('tool-start');
      this.isFirstClick = true;
      return;
    }
    if (this.popUp) {
      const features = evt.map.getFeaturesAtPixel(evt.pixel);
      if (features) {
        const coordinate = evt.coordinate;
        const element = document.getElementById('popup');
        element.innerHTML = this.getTextFromFeatureProperties(features[0]);
        this.popUp.setPosition(coordinate);
      } else {
        this.popUp.setPosition(undefined);
      }
    }
  }

  getTextFromFeatureProperties(feature) {
    let content = '';
    for (const key of Object.keys(feature.getProperties())) {
      if (key.toUpperCase().indexOf('SHAPE') === -1) {
        let viewKey = key.replace('_', ' ');
        viewKey = this.capitalize(key);
        const value = feature.getProperties()[key];
        if (typeof value === 'string') {
          content = content + viewKey + ' : ' + value + '<br />';
        }
      }
    }
    return content;
  }

  // Irgendwie in eine Utils classe
  capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

}
