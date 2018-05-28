import { Component, OnInit } from '@angular/core';
import { LocalStorageMessage } from '../local-storage/local-storage-message.model';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { Kita } from '../feature/kita.model';
import { StatisticalArea } from '../feature/statistical-area.model';

@Component({
  selector: 'app-infoscreen',
  templateUrl: './infoscreen.component.html',
  styleUrls: ['./infoscreen.component.css']
})
export class InfoscreenComponent implements OnInit {
  kita: Kita;
  statisticalArea: StatisticalArea;

  constructor(private localStorageService: LocalStorageService) { }

  ngOnInit(): void {
    this.localStorageService.registerMessageCallback(this.receiveMessage.bind(this));
  }

  receiveMessage(message: LocalStorageMessage<Kita | StatisticalArea>) {
    this.removeAll();
    if (message.type === 'select') {
      switch (message.data.type) {
        case 'Kita':
          this.kita = <Kita>message.data;
          break;
        case 'StatisticalArea':
          this.statisticalArea = <StatisticalArea>message.data;
          break;
      }
    }
  }

  private removeAll() {
    delete this.kita;
    delete this.statisticalArea;
  }

}
