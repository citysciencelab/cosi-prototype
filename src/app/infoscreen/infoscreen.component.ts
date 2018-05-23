import {Component, OnInit} from '@angular/core';
import {LocalStorageMessage} from '../local-storage/local-storage-message.model';
import {LocalStorageService} from '../local-storage/local-storage.service';
import {Kita} from '../local-storage/kita';

@Component({
  selector: 'app-infoscreen',
  templateUrl: './infoscreen.component.html',
  styleUrls: ['./infoscreen.component.css']
})
export class InfoscreenComponent implements OnInit {

  kita: Kita;
  district: any;

  constructor(private localStorageService: LocalStorageService) { }

  receiveMessage(message: LocalStorageMessage) {
    if (message.type === 'kita') {
      this.kita = <Kita>message.data;
      delete this.district;
    } else if (message.type === 'deselect') {
      delete this.kita;
      delete this.district;
    }
  }

  ngOnInit(): void {
    this.localStorageService.registerMessageCallback(this.receiveMessage.bind(this));
  }
}
