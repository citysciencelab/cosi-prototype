import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as ol from 'openlayers';
import { MapLayer } from './map-layer.model';
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
    this.mapService.selectInteraction.on('select', e => this.select.emit(<ol.interaction.Select.Event>e));
  }

  showLayers(layers: MapLayer[], status: string) {
    this.mapService.showLayers(layers.map(layer => layer.name), status);
  }

  showBaseLayers(layers: MapLayer[]) {
    this.mapService.showBaseLayers(layers.map(layer => layer.name));
  }

  clearSelectedFeatures() {
    this.mapService.selectInteraction.getFeatures().clear();
  }

}
