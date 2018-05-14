import { Component, ViewChild } from '@angular/core';
import { LocalStorageMessage } from '../local-storage/local-storage-message.model';

@Component({
  selector: 'app-infoscreen',
  templateUrl: './infoscreen.component.html',
  styleUrls: ['./infoscreen.component.css']
})
export class InfoscreenComponent {

  constructor() { }

  receiveMapEvent(event: StorageEvent) {
    if (event.key !== 'message') {
      return;
    }
    const message = <LocalStorageMessage>JSON.parse(event.newValue);
    if (!message) {
      return;
    }
  }
}
