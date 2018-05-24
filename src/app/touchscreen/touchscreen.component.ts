import { Component, OnInit, ViewChild } from '@angular/core';
import { TuioClient } from 'tuio-client';
import { environment } from '../../environments/environment';
import { ConfigurationService } from '../configuration.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { MapComponent } from '../map/map.component';
import { MapLayer } from '../map/map-layer.model';
import { Kita } from '../local-storage/kita';
import { MapService } from '../map/map.service';
import { LocalStorageMessage } from '../local-storage/local-storage-message.model';
import { StatisticalArea } from '../local-storage/statistical-area';
import * as ol from 'openlayers';

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
        displayName: 'Grünflächen',
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
        displayName: 'Nahversorgung',
        layers: [
          {
            name: 'apotheken',
            displayName: 'Apotheken',
            visible: true,
            meta: 'Quelle: OpenStreetMap'
          },
          {
            name: 'geschaefte',
            displayName: 'Geschäfte',
            visible: true,
            meta: 'Quelle: OpenStreetMap'
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
        displayName: 'Geobasiskarte Hamburg',
        visible: true,
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
    this.tuioClient.connect(environment.socketUrl);
    this.updateMapLayers();
  }

  onSelect(e: ol.interaction.Select.Event) {
    let message = { type: 'deselect', data: null };
    if (e.selected.length > 0) {
      const feature = e.selected[0];
      const properties = feature.getProperties();
      const layer = this.map.getLayerByFeature(feature);
      switch (layer) {
        case 'kitas':
          message = this.createKitaMessage(properties);
          break;
        case 'einwohner':
          message = this.createStatisticalAreaMessage(feature);
          break;
        default:
          // treat unknown layers as deselect
          break;
      }
    }
    this.localStorageService.sendMessage(message);
  }

  private createKitaMessage(properties: { [k: string]: any }): LocalStorageMessage {
    const kita: Kita = {
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
    return { type: 'kita', data: kita };
  }


  private createStatisticalAreaMessage(feature: ol.Feature) {
    const properties = feature.getProperties();
    const geom = <ol.geom.Polygon>feature.getGeometry();
    const statisticalArea: StatisticalArea = {
      name: properties.STGEBNEU,
      population: properties.Gesamt,
      population1to6: properties['1bis6'],
      kitasIn500m: properties.Kita500m,
      area: geom.getArea()
    };
    return { type: 'statisticalArea', data: statisticalArea };
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
