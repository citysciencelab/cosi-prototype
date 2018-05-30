import { Component, OnInit, ViewChild } from '@angular/core';
import * as ol from 'openlayers';
import { TuioClient } from 'tuio-client';
import { environment } from '../../environments/environment';
import { ConfigurationService } from '../configuration.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { LocalStorageMessage } from '../local-storage/local-storage-message.model';
import { MapService } from '../map/map.service';
import { MapComponent } from '../map/map.component';
import { MapLayer } from '../map/map-layer.model';
import { Kita } from '../feature/kita.model';
import { StatisticalArea } from '../feature/statistical-area.model';

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
  mapKeyLayer: MapLayer;
  mapKeyVisible: boolean;

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
        displayName: 'Grün­flä­chen',
        layers: [
          {
            name: 'gruenflaechen',
            displayName: 'Grünflächen',
            visible: true,
            meta: 'Quelle: LGV'
          }
        ],
      },
      {
        name: 'nahversorgung',
        displayName: 'Nah­ver­sor­gung',
        layers: [
          {
            name: 'apotheken',
            displayName: 'Apotheken',
            visible: true,
            meta: 'Quelle: OpenStreetMap'
          },
          {
            name: 'supermaerkte',
            displayName: 'Supermärkte',
            visible: true,
            meta: 'Quelle: OpenStreetMap'
          },
          {
            name: 'apothekenGehzeit',
            displayName: 'Gehzeit zur nächsten Apotheke',
            visible: false,
            legendUrl: 'https://geodienste.hamburg.de/MRH_WMS_REA_Gesundheit' +
              '?request=GetLegendGraphic&version=1.3.0&format=image/png&layer=2',
            meta: 'Quelle: MRH'
          },
          {
            name: 'supermaerkteGehzeit',
            displayName: 'Gehzeit zum nächsten Supermarkt',
            visible: false,
            legendUrl: 'https://geodienste.hamburg.de/MRH_WMS_REA_Einzelhandel' +
              '?request=GetLegendGraphic&version=1.3.0&format=image/png&layer=2',
            meta: 'Quelle: MRH'
          }
        ],
      },
      {
        name: 'kitas',
        displayName: 'Ki­tas',
        layers: [
          {
            name: 'kitas',
            displayName: 'Kitas',
            visible: true,
            meta: 'Quelle: Behörde für Arbeit, Soziales, Familie und Integration'
          },
          {
            name: 'kitasHeatmap',
            displayName: 'Kitas (Heatmap)',
            visible: false,
            meta: 'Quelle: Behörde für Arbeit, Soziales, Familie und Integration'
          },
          {
            name: 'kitasGehzeit',
            displayName: 'Gehzeit zur nächsten Kita',
            visible: false,
            legendUrl: 'https://geodienste.hamburg.de/MRH_WMS_REA_Soziales' +
              '?request=GetLegendGraphic&version=1.3.0&format=image/png&layer=6',
            meta: 'Quelle: MRH'
          },
          {
            name: 'einwohner',
            displayName: 'Einwohner im Alter 0 bis 6 Jahre',
            visible: true,
            legendHtml:
              '<div class="legend-row"><span class="legend-box" style="background-color: rgba(255, 0, 0, 0);"></span>&nbsp;0-9</div>' +
              '<div class="legend-row"><span class="legend-box" style="background-color: rgba(255, 0, 0, 0.2);"></span>&nbsp;10-24</div>' +
              '<div class="legend-row"><span class="legend-box" style="background-color: rgba(255, 0, 0, 0.4);"></span>&nbsp;25-49</div>' +
              '<div class="legend-row"><span class="legend-box" style="background-color: rgba(255, 0, 0, 0.6);"></span>&nbsp;50-89</div>' +
              '<div class="legend-row"><span class="legend-box" style="background-color: rgba(255, 0, 0, 0.8);"></span>&nbsp;90-</div>',
            meta: 'Quelle: Statistikamt Nord'
          }
        ],
      }
    ];
    this.baseLayers = [
      {
        name: 'stadtteile',
        displayName: 'Stadtteile',
        visible: true,
        legendUrl: 'https://geodienste.hamburg.de/HH_WMS_Verwaltungsgrenzen' +
          '?request=GetLegendGraphic&version=1.3.0&service=WMS&layer=stadtteile&style=style_verwaltungsgrenzen_stadtteile&format=image/png',
        meta: 'Quelle: LGV'
      },
      {
        name: 'geobasis',
        displayName: 'Stadtkarte Hamburg',
        visible: true,
        meta: 'Quelle: LGV'
      },
      {
        name: 'dop20',
        displayName: 'Luftbilder DOP 20',
        visible: false,
        meta: 'Quelle: LGV'
      },
      {
        name: 'osm',
        displayName: 'OpenStreetMap',
        visible: false,
        meta: '© OpenStreetMap-Mitwirkende'
      }
    ];
  }

  ngOnInit() {
    if (this.config.enableTuio) {
      this.tuioClient.connect(environment.socketUrl);
    }
    this.updateMapLayers();
  }

  onSelect(e: ol.interaction.Select.Event) {
    let message: LocalStorageMessage<{}> = { type: 'deselect', data: null };
    if (e.selected.length > 0) {
      const feature = e.selected[0];
      const layer = this.map.getLayerByFeature(feature);
      switch (layer) {
        case 'kitas':
          message = this.createKitaMessage(feature);
          break;
        case 'einwohner':
          message = this.createStatisticalAreaMessage(feature);
          break;
      }
    }
    this.localStorageService.sendMessage(message);
  }

  private createKitaMessage(feature: ol.Feature): LocalStorageMessage<Kita> {
    const properties = feature.getProperties();
    const kita = new Kita(properties);
    return { type: 'select', data: kita };
  }

  private createStatisticalAreaMessage(feature: ol.Feature): LocalStorageMessage<StatisticalArea> {
    const properties = feature.getProperties();
    const geometry = <ol.geom.Polygon>feature.getGeometry();
    properties.area = geometry.getArea();
    const statisticalArea = new StatisticalArea(properties);
    return { type: 'select', data: statisticalArea };
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
    this.localStorageService.sendMessage({ type: 'topic-select', data: topic });
    this.updateMapLayers();
  }

  getStatusByName(name: string) {
    return this.statuses.find(status => status.name === name);
  }

  getTopicByName(name: string) {
    return this.topics.find(topic => topic.name === name);
  }

  showMapKey(layer: MapLayer) {
    this.mapKeyLayer = layer;
    this.mapKeyVisible = true;
  }

  updateMapLayers() {
    if (this.selectedTopic && this.selectedStatus) {
      this.map.showLayers(this.selectedTopic.layers.filter(layer => layer.visible), this.selectedStatus.name);
    }
    this.map.showBaseLayers(this.baseLayers.filter(layer => layer.visible));
    this.map.clearSelectedFeatures();
  }

}
