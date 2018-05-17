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
  topicLayers = {
    'gruenflaechen': ['gruenflaechen'],
    'nahversorgung': [],
    'kitas': ['kitas', 'einwohner']
  };
  selectedTopic: string;

  constructor(private config: ConfigurationService, private localStorageService: LocalStorageService, private tuioClient: TuioClient) {
  }

  ngOnInit() {
    this.tuioClient.connect(environment.socketUrl);
  }

  onSelect(e: ol.interaction.Select.Event) {
  }

  onUpdateObject(e: CustomEvent) {
  }

  onRemoveObject(e: CustomEvent) {
  }

  setStatus(status: string) {
    this.selectedStatus = status;
  }

  setTopic(topic: string) {
    this.selectedTopic = topic;
    this.map.showLayers(this.topicLayers[topic]);
  }
}
