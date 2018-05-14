import { Component, OnInit } from '@angular/core';
import { TuioClient } from 'tuio-client';
import { environment } from '../../environments/environment';
import { ConfigurationService } from '../configuration.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { MapService } from '../map/map.service';

@Component({
  selector: 'app-touchscreen',
  templateUrl: './touchscreen.component.html',
  styleUrls: ['./touchscreen.component.css']
})
export class TouchscreenComponent implements OnInit {

  constructor(private config: ConfigurationService, private localStorageService: LocalStorageService, private tuioClient: TuioClient,
    private mapService: MapService) {
  }

  ngOnInit() {
    this.tuioClient.connect(environment.socketUrl);
  }

  onUpdateObject(evt: CustomEvent) {
  }

  onRemoveObject(evt: CustomEvent) {
  }
}
