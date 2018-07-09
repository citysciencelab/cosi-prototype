import { Component, OnInit, ViewChild } from '@angular/core';
import * as ol from 'openlayers';
import { TuioClient } from 'tuio-client';
import { environment } from '../../environments/environment';
import { ConfigurationService } from '../configuration.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { LocalStorageMessage } from '../local-storage/local-storage-message.model';
import { MapService } from '../map/map.service';
import { MapComponent } from '../map/map.component';
import { Kita } from '../feature/kita.model';
import { StatisticalArea } from '../feature/statistical-area.model';
import { Supermarket } from '../feature/supermarket.model';
import { Pharmacy } from '../feature/pharmacy.model';
import { GreenArea } from '../feature/green-area.model';
import { trigger, state, style, animate, transition } from '@angular/animations';

type AnyFeature = Kita | StatisticalArea | Supermarket | Pharmacy | GreenArea;

@Component({
  selector: 'app-touchscreen',
  templateUrl: './touchscreen.component.html',
  styleUrls: ['./touchscreen.component.css'],
  animations: [
    trigger('menuState', [
      state('inactive', style({
        opacity: 0
      })),
      state('active', style({
        opacity: 1
      })),
      transition('inactive => active', animate('500ms ease-in')),
      transition('active => inactive', animate('500ms ease-out'))
    ])
  ]
})
export class TouchscreenComponent implements OnInit {
  @ViewChild(MapComponent) map: MapComponent;
  topics: Topic[];
  selectedTopic: Topic;
  stages: Stage[];
  selectedStage: Stage;
  layers: MapLayer[]; // for the layer switcher
  mapKeyLayer: MapLayer;
  mapKeyVisible: boolean;
  state = 'inactive';

  constructor(private config: ConfigurationService, private localStorageService: LocalStorageService, private tuioClient: TuioClient,
    public mapService: MapService) {
    this.topics = this.config.topics;
    this.stages = this.config.stages;
    this.selectedStage = this.config.stages[0];

    const baseLayers = this.config.baseLayers.concat(this.config.stickyLayers);
    const topicLayers = this.config.topicLayers;
    this.mapService.setSources(baseLayers, topicLayers);
  }

  ngOnInit() {
    if (this.config.enableTuio) {
      this.tuioClient.connect(environment.socketUrl);
    }
    this.updateMapLayers();
  }

  isKita(object: {}): object is Kita {
    return object.hasOwnProperty('Traeger');
  }

  isStatisticalArea(object: {}): object is StatisticalArea {
    return object.hasOwnProperty('STGEBNEU');
  }

  isSupermarket(object: {}): object is Supermarket {
    return object.hasOwnProperty('shop') && object['shop'] === 'supermarket';
  }

  isPharmacy(object: {}): object is Pharmacy {
    return object.hasOwnProperty('amenity') && object['amenity'] === 'pharmacy';
  }

  isGreenArea(object: {}): object is GreenArea {
    return object.hasOwnProperty('gruenart');
  }

  onSelect(e: ol.interaction.Select.Event) {
    let message: LocalStorageMessage<{}> = { type: 'deselect', data: null };
    if (e.selected.length > 0) {
      const properties = e.selected[0].getProperties();
      message = {
        type: 'select',
        data: this.isKita(properties) ? new Kita(properties) :
          this.isStatisticalArea(properties) ? new StatisticalArea(properties) :
            this.isSupermarket(properties) ? new Supermarket(properties) :
              this.isPharmacy(properties) ? new Pharmacy(properties) :
                this.isGreenArea(properties) ? new GreenArea(properties) :
                  null
      };
    }
    this.localStorageService.sendMessage(message);
  }

  onUpdateObject(e: CustomEvent) {
  }

  onRemoveObject(e: CustomEvent) {
  }

  onContextMenuClick() {
    return false;
  }

  setStage(stage: Stage) {
    this.selectedStage = stage;
    this.updateMapLayers();
  }

  setTopic(topic: Topic) {
    this.selectedTopic = topic;
    this.localStorageService.sendMessage({ type: 'topic-select', data: topic });
    this.updateMapLayers();
  }

  getBaseLayers() {
    return this.config.baseLayers;
  }

  getTopicLayers(topic: Topic) {
    return topic ? this.config.topicLayers.filter(layer => layer.topic === topic.name) : [];
  }

  showMapKey(layer: MapLayer) {
    this.mapKeyLayer = layer;
    this.mapKeyVisible = true;
  }

  /*
   * Set layer visibility e.g. after interaction with side panels or layer switcher
   */
  updateMapLayers() {
    this.layers = this.getTopicLayers(this.selectedTopic).concat(this.getBaseLayers());
    this.map.showBaseLayers(this.mapService.baseLayers.filter(layer => layer.visible));
    this.map.showLayers(this.layers.filter(layer => layer.visible), this.selectedTopic, this.selectedStage);
    this.map.clearSelectedFeatures();
  }

  toggleMenu() {
    this.state = this.state === 'active' ? 'inactive' : 'active';
  }
}
