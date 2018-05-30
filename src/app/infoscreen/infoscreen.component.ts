import { Component, OnInit, NgZone } from '@angular/core';
import { ChartUtils } from 'angular-dashboard-components/components/utils/chart.utils';
import { HttpClient } from '@angular/common/http';
import { LocalStorageMessage } from '../local-storage/local-storage-message.model';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { Feature } from '../feature/feature.model';
import { Kita } from '../feature/kita.model';
import { StatisticalArea } from '../feature/statistical-area.model';
import { Supermarket } from '../feature/supermarket.model';
import { Pharmacy } from '../feature/pharmacy.model';
import { GreenArea } from '../feature/green-area.model';

type AnyFeature = Kita | StatisticalArea | Supermarket | Pharmacy | GreenArea;

@Component({
  selector: 'app-infoscreen',
  templateUrl: './infoscreen.component.html',
  styleUrls: ['./infoscreen.component.css']
})
export class InfoscreenComponent implements OnInit {
  hasSelectedFeature: boolean;
  kita: Kita;
  statisticalArea: StatisticalArea;
  supermarket: Supermarket;
  pharmacy: Pharmacy;
  greenArea: GreenArea;

  private _urlDistrictProfiles = 'assets/data/grobo-data.json';
  private _urlInfrastructure = 'assets/data/infrastructure-data.json';

  // private rawData;
  // Charts
  public pieData;
  public pieTitle: string;

  public columnData2;
  public column2Title: string;

  public lineData;
  public lineCategories;
  public lineTitle: string;

  public columnData;
  public columnCategories;
  public columnTitle: string;

  constructor(private localStorageService: LocalStorageService, public chartUtils: ChartUtils, private zone: NgZone,
    private _http: HttpClient) {
  }

  ngOnInit(): void {
    this.localStorageService.registerMessageCallback(this.receiveMessage.bind(this));
    this.calculateInitialData();
  }

  receiveMessage(message: LocalStorageMessage<AnyFeature>) {
    switch (message.type) {
      case 'select':
        this.hasSelectedFeature = true;
        this.removeAll();
        const feature = message.data;
        switch (feature.type) {
          case 'Kita':
            this.kita = <Kita>feature;
            break;
          case 'StatisticalArea':
            this.statisticalArea = <StatisticalArea>feature;
            break;
          case 'Supermarket':
            this.supermarket = <Supermarket>feature;
            break;
          case 'Pharmacy':
            this.pharmacy = <Pharmacy>feature;
            break;
          case 'GreenArea':
            this.greenArea = <GreenArea>feature;
            break;
        }
        break;
      case 'deselect':
        this.hasSelectedFeature = false;
        this.removeAll();
        break;
      case 'topic-select':
        switch (message.data.name) {
          case 'nahversorgung':
            this.calculateInfrastructureData();
            break;
          case 'kitas':
            this.calculateInitialData();
            break;
          case 'gruenflaechen':
            this.calculateInitialData();
            break;
        }
    }
  }

  private removeAll() {
    delete this.kita;
    delete this.statisticalArea;
    delete this.supermarket;
    delete this.pharmacy;
    delete this.greenArea;
  }

  /*
   *   Recalculates the dataproviders (charts, tables etc.) with the changed data
   */
  calculateInitialData() {
    this.getJSONData(this._urlDistrictProfiles).subscribe(
      data => {
        const jsonData = <Object []> data;
        this.zone.run(() => {

          // // Always render categories first!
          this.lineCategories = this.chartUtils.getUniqueSeriesNames(jsonData, ['jahr']);
          this.lineData = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
            'Geburten', 'jahr', this.lineCategories, 'Groß Borstel');
          this.lineTitle = 'Geburten der umliegenden Stadtteile';

          // // Always render categories first!
          this.columnCategories = this.chartUtils.getUniqueSeriesNames(jsonData, ['Stadtgebiet']);
          this.columnData = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
            'Anteil_der_unter_18_J_hrigen_in', 'jahr', ['2016'], 'Groß Borstel');
          this.columnTitle = 'Anteil der Bevölkerung < 18 Jahren (2016)';

          this.pieTitle = 'Bevölkerungsanteile';
          this.pieData = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
            'Bev_lkerung', 'jahr', ['2016'], 'Groß Borstel');

          this.columnData2 = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
            'Anteil_der_Bev_lkerung_mit_Migrations_hintergrund_in', 'jahr', ['2016'], 'Groß Borstel');
          this.column2Title = 'Migrationshintergrund in % der Stadtteile (2016)';

          // this.lineCategories = this.chartUtils.getUniqueSeriesNames(this.jsonData, ['jahr']);
          // this.lineData = this.chartUtils.getSumData(this.jsonData,['jahr'], ['Geburten']);
        });
      },
      error => {
        console.log(error);
      }
    );
  }

  calculateInfrastructureData() {
    this.getJSONData(this._urlInfrastructure).subscribe(
      data => {
        const jsonData = <Object []> data;
        this.zone.run(() => {

          // // Always render categories first!
          // this.lineCategories = this.chartUtils.getUniqueSeriesNames(jsonData, ['jahr']);
          // this.lineData = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
          //   'Geburten', 'jahr', this.lineCategories, 'Groß Borstel');

          // // Always render categories first!
          this.columnCategories = this.chartUtils.getUniqueSeriesNames(jsonData, ['Stadtgebiet']);
          this.columnData = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
            'apotheken', 'jahr', ['2016'], 'Groß Borstel');
          this.columnTitle = 'Apotheken der Stadtteile';

          // this.pieData = {};
          // this.pieData['data'] = [{
          //   name: 'Bevölkerung',
          //   y:  8459
          // }, {
          //   name: 'Zuzüge',
          //   y: 1458
          // }, {
          //   name: 'Fortzüge',
          //   y: 1770
          // }];

          this.columnData2 = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
            'supermaerkte', 'jahr', ['2016'], 'Groß Borstel');
          this.column2Title = 'Supermärkte der Stadtteile';

          // this.lineCategories = this.chartUtils.getUniqueSeriesNames(this.jsonData, ['jahr']);
          // this.lineData = this.chartUtils.getSumData(this.jsonData,['jahr'], ['Geburten']);
        });
      },
      error => {
        console.log(error);
      }
    );
  }

  getJSONData(url: string) {
    return this._http.get(url);
  }

}
