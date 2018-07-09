import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as ol from 'openlayers';
import { ConfigurationService } from '../configuration.service';
import { MapService } from './map.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { LocalStorageMessage } from '../local-storage/local-storage-message.model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Output() select = new EventEmitter<ol.interaction.Select.Event>();
  @Output() toolStart = new EventEmitter<string>();
  private isFirstClick = false;

  // Map config
  center: ol.Coordinate;
  zoom: number;
  minZoom: number;
  maxZoom: number;

  constructor(private config: ConfigurationService, private mapService: MapService, private localStorageService: LocalStorageService) {
    this.center = ol.proj.fromLonLat(config.mapCenter);
    this.zoom = config.mapZoom;
    this.minZoom = config.mapMinZoom;
    this.maxZoom = config.mapMaxZoom;
  }

  ngOnInit() {
    this.mapService.setTarget('map');
    this.mapService.setView(new ol.View({
      center: this.center,
      zoom: this.zoom - 3, // the zoom animation will correct the zoom level later
      minZoom: this.minZoom,
      maxZoom: this.maxZoom
    }));
    this.mapService.selectInteraction.on('select', e => this.select.emit(<ol.interaction.Select.Event>e));

    // Just for the 'start-click'
    this.mapService.on('singleclick', this.onMapClick.bind(this));
  }

  reset() {
    this.mapService.getView().animate({ zoom: this.zoom }, { center: this.center });
  }

  showLayers(layers: MapLayer[], topic: Topic, stage: Stage) {
    this.mapService.showLayers(layers.map(layer => layer.name), topic ? topic.name : '', stage ? stage.name : '');
  }

  showBaseLayers(layers: MapLayer[]) {
    this.mapService.showBaseLayers(layers.map(layer => layer.name));
  }

  clearSelectedFeatures() {
    this.mapService.selectInteraction.getFeatures().clear();
  }

  getLayerByFeature(feature: ol.Feature) {
    return this.mapService.getLayerByFeature(feature);
  }

  onMapClick() {
    if (!this.isFirstClick) {
      this.mapService.getView().animate({ zoom: this.zoom }, { center: this.center });

      const message: LocalStorageMessage<{}> = {
        type: 'tool-interaction',
        data: { name: 'tool-start' }
      };
      this.localStorageService.sendMessage(message);
      this.toolStart.emit('tool-start');
    }
    this.isFirstClick = true;
  }

}
