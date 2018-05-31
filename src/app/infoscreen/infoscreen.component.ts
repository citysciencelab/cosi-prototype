import {Component, OnInit, NgZone} from '@angular/core';
import {ChartUtils} from 'angular-dashboard-components/components/utils/chart.utils';
import {HttpClient} from '@angular/common/http';
import {LocalStorageMessage} from '../local-storage/local-storage-message.model';
import {LocalStorageService} from '../local-storage/local-storage.service';
import {Feature} from '../feature/feature.model';
import {Kita} from '../feature/kita.model';
import {StatisticalArea} from '../feature/statistical-area.model';
import {Supermarket} from '../feature/supermarket.model';
import {Pharmacy} from '../feature/pharmacy.model';
import {GreenArea} from '../feature/green-area.model';

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

  private _urlDistrictProfilesData = 'assets/data/grobo-data.json';
  private _urlInfrastructureData = 'assets/data/infrastructure-data.json';
  private _urlNurseryData= 'assets/data/nursery-data.json';
  private _urlPublicSpaceData= 'assets/data/public-space-data.json';

  public isToolStarted = false;

  // private rawData;
  // Charts
  public pieData;
  public pieTitle: string;

  public columnData2;
  public column2Title: string;
  public column2PlotLine: number;

  public lineData;
  public lineCategories;
  public lineTitle: string;

  public columnData;
  public columnCategories;
  public columnTitle: string;
  public columnPlotLine: number;

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
            this.calculateNurseryData();
            break;
          case 'gruenflaechen':
            this.calculatePublicSpaceData();
            break;
        }
        break;
      case 'tool-interaction':
        switch (message.data.name) {
          case 'tool-start':
            this.isToolStarted = true;
            break;
          case 'tool-reset':
            this.isToolStarted = false;
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
    this.doPotentialResets('initial');
    this.getJSONData(this._urlDistrictProfilesData).subscribe(
      data => {
        const jsonData = <Object []> data;
        this.zone.run(() => {

          // No unnecessary reloads
          if (this.lineData == null) {
            // // Always render categories first!
            this.lineCategories = this.chartUtils.getUniqueSeriesNames(jsonData, ['jahr']);
            this.lineData = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
              'Geburten', 'jahr', this.lineCategories, 'Groß Borstel');
            this.lineTitle = 'Geburten 2012-2016';
          }

          this.columnCategories = this.chartUtils.getUniqueSeriesNames(jsonData, ['Stadtgebiet']);
          this.columnData = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
            'Anteil_der_unter_18_J_hrigen_in', 'jahr', ['2016'], 'Groß Borstel');
          this.columnTitle = 'Anteil der Bevölkerung < 18 Jahren (2016)';
          this.columnPlotLine = 16.2;

          // No unnecessary reloads
          if (this.pieData == null) {
            this.pieTitle = 'Bevölkerungsanteile';
            this.pieData = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
              'Bev_lkerung', 'jahr', ['2016'], 'Groß Borstel');
          }

          this.columnData2 = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
            'Anteil_der_Bev_lkerung_mit_Migrations_hintergrund_in', 'jahr', ['2016'], 'Groß Borstel');
          this.column2Title = 'Migrationshintergrund in % der Stadtteile (2016)';
          this.column2PlotLine = 34.1;
        });
      },
      error => {
        console.log(error);
      }
    );
  }

  calculateNurseryData() {
    this.doPotentialResets('nursery');
    this.getJSONData(this._urlNurseryData).subscribe(
      data => {
        const jsonData = <Object []> data;
        this.zone.run(() => {
          this.columnCategories = this.chartUtils.getUniqueSeriesNames(jsonData, ['Stadtgebiet']);
          this.columnData = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
            'unter_6_perc', 'jahr', ['2016'], 'Groß Borstel');
          this.columnTitle = 'Anteil Bevölkerung < 6 Jahren';

          this.columnData2 = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
            'spaces_p_child', 'jahr', ['2016'], 'Groß Borstel');
          this.column2Title = 'Kitaplätze pro Kind';
        });
      },
      error => {
        console.log(error);
      }
    );
  }

  calculateInfrastructureData() {
    this.doPotentialResets('infrastructure');
    this.getJSONData(this._urlInfrastructureData).subscribe(
      data => {
        const jsonData = <Object []> data;
        this.zone.run(() => {
          this.columnCategories = this.chartUtils.getUniqueSeriesNames(jsonData, ['Stadtgebiet']);
          this.columnData = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
            'apotheken_p_10000', 'jahr', ['2016'], 'Groß Borstel');
          this.columnTitle = 'Apotheken pro 10 Tsd.';

          this.columnData2 = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
            'supermaerkte_p_10000', 'jahr', ['2016'], 'Groß Borstel');
          this.column2Title = 'Supermärkte pro 10 Tsd.';
        });
      },
      error => {
        console.log(error);
      }
    );
  }

  calculatePublicSpaceData() {
    this.doPotentialResets('public-space');
    this.getJSONData(this._urlPublicSpaceData).subscribe(
      data => {
        const jsonData = <Object []> data;
        this.zone.run(() => {
          this.columnCategories = this.chartUtils.getUniqueSeriesNames(jsonData, ['Stadtgebiet']);
          this.columnData = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
            'pspace_p_p', 'jahr', ['2016'], 'Groß Borstel');
          this.columnTitle = 'Öffentliche Grünfläche je EW in m²';

          this.columnData2 = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
            'parks_playgrounds_p_p', 'jahr', ['2016'], 'Groß Borstel');
          this.column2Title = 'Park, Spielplatz je EW in m²';
        });
      },
      error => {
        console.log(error);
      }
    );
  }

  doPotentialResets(dataType: string) {
    if (dataType !== 'initial') {
      this.columnPlotLine = null;
      this.column2PlotLine = null;
    }
  }

  getJSONData(url: string) {
    return this._http.get(url);
  }

}
