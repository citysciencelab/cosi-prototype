import { Component, OnInit, ViewChild } from '@angular/core';
import { TuioClient } from 'tuio-client';
import { environment } from '../../environments/environment';
import { ConfigurationService } from '../configuration.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-touchscreen',
  templateUrl: './touchscreen.component.html',
  styleUrls: ['./touchscreen.component.css']
})
export class TouchscreenComponent implements OnInit {
  @ViewChild(MapComponent) map: MapComponent;
  statuses = ['before', 'after'];
  statusLabels = {
    'before': 'Vor Bebauung',
    'after': 'Nach Bebauung'
  };
  selectedStatus: string;
  topics = ['gruenflaechen', 'nahversorgung', 'kitas'];
  topicLabels = {
    'gruenflaechen': 'Grünflächen',
    'nahversorgung': 'Nah- versorgung',
    'kitas': 'Kitas'
  };
  selectedTopic: string;
  layers = {
    'gruenflaechen': {
      'before': ['gruenflaechen'],
      'after': []
    },
    'nahversorgung': {
      'before': [],
      'after': []
    },
    'kitas': {
      'before': ['kitas', 'einwohner'],
      'after': ['kitasNeu', 'einwohnerNeu']
    }
  };

  constructor(private config: ConfigurationService, private localStorageService: LocalStorageService, private tuioClient: TuioClient) {
  }

  ngOnInit() {
    this.tuioClient.connect(environment.socketUrl);
    this.selectedStatus = 'before';
  }

  onSelect(e: ol.interaction.Select.Event) {
  }

  onUpdateObject(e: CustomEvent) {
  }

  onRemoveObject(e: CustomEvent) {
  }

  setStatus(status: string) {
    this.selectedStatus = status;
    this.map.showLayers(this.layers[this.selectedTopic][this.selectedStatus]);
  }

  setTopic(topic: string) {
    this.selectedTopic = topic;
    this.map.showLayers(this.layers[this.selectedTopic][this.selectedStatus]);
  }
}
