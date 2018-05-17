import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as ol from 'openlayers/dist/ol-debug.js';
import { MapService } from './map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Output() select = new EventEmitter<ol.interaction.Select.Event>();

  constructor(private mapService: MapService) {}

  ngOnInit() {
    this.mapService.setTarget('map');
    this.mapService.setView(new ol.View({
      center: ol.proj.fromLonLat([9.9880, 53.6126]),
      zoom: 14,
      minZoom: 11,
      maxZoom: 18
    }));
    this.mapService.selectInteraction.on('select', e => this.select.emit(e));
  }

  showLayers(layerNames: string[]) {
    this.mapService.showLayers(layerNames);
  }

  clearSelectedFeatures() {
    this.mapService.selectInteraction.getFeatures().clear();
  }

}
