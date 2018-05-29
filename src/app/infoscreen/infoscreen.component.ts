import {Component, OnInit, NgZone} from '@angular/core';
import {ChartUtils} from 'angular-dashboard-components/components/utils/chart.utils';
import {HttpClient} from '@angular/common/http';
import {LocalStorageMessage} from '../local-storage/local-storage-message.model';
import {LocalStorageService} from '../local-storage/local-storage.service';
import {Kita} from '../feature/kita.model';
import {StatisticalArea} from '../feature/statistical-area.model';

@Component({
  selector: 'app-infoscreen',
  templateUrl: './infoscreen.component.html',
  styleUrls: ['./infoscreen.component.css']
})
export class InfoscreenComponent implements OnInit {
  kita: Kita;
  statisticalArea: StatisticalArea;

  private _url = 'assets/data/grobo-data.json';
  private rawData;
  // Charts
  public pieData;
  public pieData2;
  public lineData;
  public lineCategories;
  public columnData;
  public columnCategories;


  constructor(private localStorageService: LocalStorageService,
              public chartUtils: ChartUtils,
              private zone: NgZone,
              private _http: HttpClient) {
  }

  ngOnInit(): void {
    this.localStorageService.registerMessageCallback(this.receiveMessage.bind(this));

    this.getParticipationData().subscribe(
      data => {
        const testData = <Object []> data;
        this.processChartData(testData);
      },
      error => {
        console.log(error);
      }
    );
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


  /*
*   Recalculates the dataproviders (charts, tables etc.) with the changed data
*/

  private processChartData(data: Object[]) {
    this.rawData = data;

    this.zone.run(() => {

      // // Always render categories first!
      this.lineCategories = this.chartUtils.getUniqueSeriesNames(this.rawData, ['jahr']);
      this.lineData = this.chartUtils.getSeriesData(this.rawData, 'Stadtgebiet', 'Geburten', 'jahr', this.lineCategories);

      // // Always render categories first!
      this.columnCategories = this.chartUtils.getUniqueSeriesNames(this.rawData, ['Stadtgebiet']);
      this.columnData = this.chartUtils.getSeriesData(this.rawData, 'Stadtgebiet',
        'Anteil_der_unter_18_J_hrigen_in', 'jahr', ['2016']);

      this.pieData = {};
      this.pieData["data"] = [{
        name: 'Bevölkerung',
        y:  8459
      }, {
        name: 'Zuzüge',
        y: 1458
      }, {
        name: 'Fortzüge',
        y: 1770
      }];

      this.pieData2 = this.chartUtils.getSeriesData(this.rawData, 'Stadtgebiet'
        , 'Anteil_der_Bev_lkerung_mit_Migrations_hintergrund_in', 'jahr', ['2016']);
      // this.lineCategories = this.chartUtils.getUniqueSeriesNames(this.rawData, ['jahr']);
      // this.lineData = this.chartUtils.getSumData(this.rawData,['jahr'], ['Geburten']);
    });
  }

  getParticipationData() {
    return this._http.get(this._url);
  }

}
