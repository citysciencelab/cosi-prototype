import { Component, OnInit, ViewChild } from '@angular/core';
import { TuioClient } from 'tuio-client';
import { environment } from '../../environments/environment';
import { ConfigurationService } from '../configuration.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { MapComponent } from '../map/map.component';
import { MapLayer } from '../map/map-layer.model';

@Component({
  selector: 'app-touchscreen',
  templateUrl: './touchscreen.component.html',
  styleUrls: ['./touchscreen.component.css']
})
export class TouchscreenComponent implements OnInit {
  @ViewChild(MapComponent) map: MapComponent;
  statuses: [{ name: string, displayName: string }];
  selectedStatus: { name: string, displayName: string };
  topics: [{ name: string, displayName: string, layers: { before: MapLayer[], after: MapLayer[] } }];
  selectedTopic: { name: string, displayName: string, layers: { before: MapLayer[], after: MapLayer[] } };
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
        layers: {
          before: [
            {
              name: 'gruenflaechen',
              displayName: 'Grünflächen',
              visible: true
            }
          ],
          after: []
        }
      },
      {
        name: 'nahversorgung',
        displayName: 'Nahversorgung',
        layers: {
          before: [],
          after: []
        }
      },
      {
        name: 'kitas',
        displayName: 'Kitas',
        layers: {
          before: [
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
              name: 'einwohner',
              displayName: 'Einwohner im Alter 0 bis 6 Jahre',
              visible: true
            },
            {
              name: 'kitasGehzeit',
              displayName: 'Gehzeit zur nächsten Kita',
              visible: false
            }
          ],
          after: [
            {
              name: 'kitasNeu',
              displayName: 'Kitas',
              visible: true
            },
            {
              name: 'kitasNeuHeatmap',
              displayName: 'Kitas (Heatmap)',
              visible: false
            },
            {
              name: 'einwohnerNeu',
              displayName: 'Einwohner im Alter 0 bis 6 Jahre',
              visible: true
            }
          ]
        }
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
  }

  onUpdateObject(e: CustomEvent) {
  }

  onRemoveObject(e: CustomEvent) {
  }

  setStatus(status: { name: string, displayName: string }) {
    this.selectedStatus = status;
    this.updateMapLayers();
  }

  setTopic(topic: { name: string, displayName: string, layers: { before: MapLayer[], after: MapLayer[] } }) {
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
      this.map.showLayers(this.selectedTopic.layers[this.selectedStatus.name].filter(layer => layer.visible));
    }
    this.map.showBaseLayers(this.baseLayers.filter(layer => layer.visible));
    this.map.clearSelectedFeatures();
  }
}
