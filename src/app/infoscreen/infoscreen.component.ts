import {Component, OnInit, NgZone, Inject, LOCALE_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LocalStorageMessage} from '../local-storage/local-storage-message.model';
import {LocalStorageService} from '../local-storage/local-storage.service';
import {Kita} from '../feature/kita.model';
import {StatisticalArea} from '../feature/statistical-area.model';
import {Supermarket} from '../feature/supermarket.model';
import {Pharmacy} from '../feature/pharmacy.model';
import {GreenArea} from '../feature/green-area.model';
import * as Highcharts from 'highcharts';
import {ChartUtils} from '../charting/utils/chart.utils';
import {ThemeUtils} from '../charting/utils/theme.utils';

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
  private _urlNurseryData = 'assets/data/nursery-data.json';
  private _urlPublicSpaceData = 'assets/data/public-space-data.json';

  public isToolStarted = false;

  // Charts
  public lineData;
  public lineCategories;
  public lineTitle: string;
  public lineSubTitle: string;

  public pieData;
  public pieTitle: string;
  public pieSubTitle: string;

  public columnData;
  public columnCategories;
  public columnTitle: string;
  public columnSubTitle: string;
  public columnPlotLine: number;

  public columnData2;
  public column2Title: string;
  public column2SubTitle: string;
  public column2PlotLine: number;
  private chartTheme = 'sand-signika';

  constructor(private localStorageService: LocalStorageService, public chartUtils: ChartUtils, public themeUtils: ThemeUtils,
              private zone: NgZone, private _http: HttpClient, @Inject(LOCALE_ID) private locale) {
    Highcharts.setOptions(this.themeUtils.getTheme(this.chartTheme));
    this.chartUtils.setPresetColors(this.themeUtils.getThemeColors(this.chartTheme));
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
        this.hasSelectedFeature = false;
        this.removeAll();
        if (message.data === null) {
          this.calculateInitialData();
          break;
        }
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
              'Geburten', 'jahr', this.lineCategories, 'Groß Borstel', true);
            this.lineTitle = this.locale === 'de-DE' ? 'Geburten pro Jahr zwischen 2012-2016' : 'Yearly birth rates 2012-2016';
            this.lineSubTitle = '';
          }

          this.columnCategories = this.chartUtils.getUniqueSeriesNames(jsonData, ['Stadtgebiet']);
          this.columnData = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
            'Anteil_der_unter_18_J_hrigen_in', 'jahr', ['2016'], 'Groß Borstel');
          this.columnTitle = this.locale === 'de-DE' ? 'Anteil der Bevölkerung < 18 Jahren in % (2016)' :
            'Percentage of population under 18 years (2016)';
          this.columnSubTitle = this.locale === 'de-DE' ? 'Die rote Linie zeigt den Hamburger Durchschnitt' :
            'The red line indicates the Hamburg average';
          this.columnPlotLine = 16.2;

          // No unnecessary reloads
          if (this.pieData == null) {
            this.pieTitle = this.locale === 'de-DE' ? 'Gesamtbevölkerungsverteilung (2016)' : 'Population share among wards (2016)';
            this.pieSubTitle = '';
            this.pieData = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
              'Bev_lkerung', 'jahr', ['2016'], 'Groß Borstel', true);
          }

          this.columnData2 = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
            'Anteil_der_Bev_lkerung_mit_Migrations_hintergrund_in', 'jahr', ['2016'], 'Groß Borstel');
          this.column2Title = this.locale === 'de-DE' ? 'Anteil der Bevölkerung mit Migrationshintergrund in % (2016)' :
            'Percentage of migrant population (2016)';
          this.column2SubTitle = this.locale === 'de-DE' ? 'Die rote Linie zeigt den Hamburger Durchschnitt' :
            'The red line indicates the Hamburg average';
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
          this.columnTitle = this.locale === 'de-DE' ? 'Anteil Bevölkerung < 6 Jahren in % (2016)' :
          'Percentage of population under 6 years (2016)';
          this.columnSubTitle = '';
          this.columnPlotLine = 5.92;

          this.columnData2 = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
            'spaces_p_child', 'jahr', ['2016'], 'Groß Borstel');
          this.column2Title = this.locale === 'de-DE' ? 'Kitaplätze pro Kind (2016)' : 'Daycare places per child (2016)';
          this.column2SubTitle = this.locale === 'de-DE' ? 'Berechnungsgrundlage sind Ø 3m² Fläche pro Kind' :
            'Assuming 3 m² of paedagogical area per child';
          this.column2PlotLine = 0.89;
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
          this.columnTitle = this.locale === 'de-DE' ? 'Apotheken pro 10.000 Einwohner' : 'Pharmacies per 10,000 inhabitants';
          this.columnSubTitle = '';
          this.columnPlotLine = 2.15;

          this.columnData2 = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
            'supermaerkte_p_10000', 'jahr', ['2016'], 'Groß Borstel');
          this.column2Title = this.locale === 'de-DE' ? 'Supermärkte pro 10.000 Einwohner' : 'Supermarkets per 10,000 inhabitants';
          this.column2SubTitle = '';
          this.column2PlotLine = 3.23;
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
          this.columnTitle = this.locale === 'de-DE' ? 'Öffentliche Grünfläche je EW in m²' : 'Public greenspace per person (m²)';
          this.columnSubTitle = '';
          this.columnPlotLine = 31.61;

          this.columnData2 = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
            'parks_playgrounds_p_p', 'jahr', ['2016'], 'Groß Borstel');
          this.column2Title = this.locale === 'de-DE' ? 'Park-, Spielplatzfläche je EW in m²' : 'Parks and playgrounds per person (m²)';
          this.column2SubTitle = '';
          this.column2PlotLine = 15.67;
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
