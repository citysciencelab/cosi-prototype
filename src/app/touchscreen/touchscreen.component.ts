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
  layers: MapLayer[];
  mapKeyLayer: MapLayer;
  mapKeyVisible: boolean;
  state = 'inactive';

  constructor(private localStorageService: LocalStorageService, private mapService: MapService, private config: ConfigurationService,
    private tuioClient: TuioClient) {
    this.topics = this.config.topics;
    this.stages = this.config.stages;
    this.selectedStage = this.config.stages[0];

    this.mapService.toolStartEvent.subscribe(
      (data: any) => {
        if (data === 'tool-start') {
          this.toggleMenu();
        }
      });
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
    return this.config.baseLayers.concat(this.config.stickyLayers);
  }

  getTopicLayers(topic: Topic, stage: Stage) {
    return this.config.topicLayers.filter(layer => {
      return layer.topic === topic.name && (layer.stage === stage.name || layer.stage === '*');
    });
  }

  showMapKey(layer: MapLayer) {
    this.mapKeyLayer = layer;
    this.mapKeyVisible = true;
  }

  updateMapLayers() {
    this.layers = [];
    if (this.selectedTopic && this.selectedStage) {
      this.layers = this.getTopicLayers(this.selectedTopic, this.selectedStage);
      this.map.showLayers(this.layers.filter(layer => layer.visible), this.selectedStage.name);
    }
    const baseLayers = this.getBaseLayers();
    this.layers = this.layers.concat(baseLayers);
    this.map.showBaseLayers(baseLayers.filter(layer => layer.visible));
    this.map.clearSelectedFeatures();
  }

  toggleMenu() {
    this.state = this.state === 'active' ? 'inactive' : 'active';
  }
}
