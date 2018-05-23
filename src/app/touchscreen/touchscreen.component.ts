import { Component, OnInit, ViewChild } from '@angular/core';
import { TuioClient } from 'tuio-client';
import { environment } from '../../environments/environment';
import { ConfigurationService } from '../configuration.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { MapComponent } from '../map/map.component';
import { MapLayer } from '../map/map-layer.model';
import {Kita} from '../local-storage/kita';

@Component({
  selector: 'app-touchscreen',
  templateUrl: './touchscreen.component.html',
  styleUrls: ['./touchscreen.component.css']
})
export class TouchscreenComponent implements OnInit {
  @ViewChild(MapComponent) map: MapComponent;
  statuses: [{ name: string, displayName: string }];
  selectedStatus: { name: string, displayName: string };
  topics: [{ name: string, displayName: string, layers: MapLayer[] }];
  selectedTopic: { name: string, displayName: string, layers: MapLayer[] };
  baseLayers: [MapLayer];

  constructor(private config: ConfigurationService, private localStorageService: LocalStorageService, private tuioClient: TuioClient) {
    this.statuses = [
      {
        name: 'before',
        displayName: 'Vor Bebauung'
      },
      {
        name: 'after',
        displayName: 'Nach Bebauung'
      }
    ];
    this.selectedStatus = this.statuses[0];
    this.topics = [
      {
        name: 'gruenflaechen',
        displayName: 'Grünflächen',
        layers:  [
          {
            name: 'gruenflaechen',
            displayName: 'Grünflächen',
            visible: true
          }
        ],
      },
      {
        name: 'nahversorgung',
        displayName: 'Nahversorgung',
        layers: [
          {
            name: 'apotheken',
            displayName: 'Apotheken',
            visible: true
          },
          {
            name: 'geschaefte',
            displayName: 'Geschäfte',
            visible: true
          }
        ],
      },
      {
        name: 'kitas',
        displayName: 'Kitas',
        layers: [
          {
            name: 'kitas',
            displayName: 'Kitas',
            visible: true
          },
          {
            name: 'kitasHeatmap',
            displayName: 'Kitas (Heatmap)',
            visible: false
          },
          {
            name: 'kitasGehzeit',
            displayName: 'Gehzeit zur nächsten Kita',
            visible: false
          },
          {
            name: 'einwohner',
            displayName: 'Einwohner im Alter 0 bis 6 Jahre',
            visible: true
          }
        ],
      }
    ];
    this.baseLayers = [
      {
        name: 'stadtteile',
        displayName: 'Stadtteile',
        visible: true
      },
      {
        name: 'geobasis',
        displayName: 'Geobasiskarte Hamburg',
        visible: true
      },
      {
        name: 'osm',
        displayName: 'OpenStreetMap',
        visible: false
      }
    ];
  }

  ngOnInit() {
    this.tuioClient.connect(environment.socketUrl);
    this.updateMapLayers();
  }

  onSelect(e: ol.interaction.Select.Event) {
    let message = {type: 'deselect', data: null};
    if (e.selected.length > 0) {
      const feature = e.selected[0];
      const id = feature.getId();
      if (id.toString().startsWith('kita')) {
        const kita = this.createKita(feature.getProperties());
        message = {type: 'kita', data: kita };
      }
    }
    this.localStorageService.sendMessage(message);
  }

  private createKita(properties: { [k: string]: any }): Kita {
    return {
      address: properties.Hausnr,
      street: properties.Strasse,
      name: properties.Name,
      contact: properties.Ansprechpa,
      zipCode: properties.PLZ,
      eMail: properties['E-Mail'],
      neighborhood: properties.Stadtteil,
      organisation: properties.Traeger,
      association: properties.Spitzenver,
      website: properties.Informatio,
    };
  }

  onUpdateObject(e: CustomEvent) {
  }

  onRemoveObject(e: CustomEvent) {
  }

  setStatus(status: { name: string, displayName: string }) {
    this.selectedStatus = status;
    this.updateMapLayers();
  }

  setTopic(topic: { name: string, displayName: string, layers: MapLayer[] }) {
    this.selectedTopic = topic;
    this.updateMapLayers();
  }

  getStatusByName(name: string) {
    return this.statuses.find(status => status.name === name);
  }

  getTopicByName(name: string) {
    return this.topics.find(topic => topic.name === name);
  }

  toggleLayer(layer: MapLayer) {
    layer.visible = !layer.visible;
    this.updateMapLayers();
  }

  private updateMapLayers() {
    if (this.selectedTopic && this.selectedStatus) {
      this.map.showLayers(this.selectedTopic.layers.filter(layer => layer.visible), this.selectedStatus.name);
    }
    this.map.showBaseLayers(this.baseLayers.filter(layer => layer.visible));
    this.map.clearSelectedFeatures();
  }
}
