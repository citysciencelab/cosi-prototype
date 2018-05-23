import {Component, OnInit} from '@angular/core';
import {LocalStorageMessage} from '../local-storage/local-storage-message.model';
import {LocalStorageService} from '../local-storage/local-storage.service';
import {Kita} from '../local-storage/kita';
import {StatisticalArea} from '../local-storage/statistical-area';

@Component({
  selector: 'app-infoscreen',
  templateUrl: './infoscreen.component.html',
  styleUrls: ['./infoscreen.component.css']
})
export class InfoscreenComponent implements OnInit {

  kita: Kita;
  statisticalArea: StatisticalArea;

  constructor(private localStorageService: LocalStorageService) { }

  receiveMessage(message: LocalStorageMessage) {
    if (message.type === 'kita') {
      this.removeAll();
      this.kita = <Kita>message.data;
    } else if (message.type === 'statisticalArea') {
      this.removeAll();
      this.statisticalArea = <StatisticalArea>message.data;
    } else if (message.type === 'deselect') {
      this.removeAll();
    }
  }

  removeAll() {
    delete this.kita;
    delete this.statisticalArea;
  }

  ngOnInit(): void {
    this.localStorageService.registerMessageCallback(this.receiveMessage.bind(this));
  }
}
