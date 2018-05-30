import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TuioClient } from 'tuio-client';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { TouchscreenComponent } from './touchscreen/touchscreen.component';
import { InfoscreenComponent } from './infoscreen/infoscreen.component';
import { MapComponent } from './map/map.component';
import { SafeHtmlPipe } from './util/safe-html.pipe';
import { YesNoUnknownPipe } from './util/yes-no-unknown.pipe';
import { ConfigurationService } from './configuration.service';
import { MapService } from './map/map.service';
import { LocalStorageService } from './local-storage/local-storage.service';
import { LegendComponent } from './map/legend/legend.component';
import { LayerControlComponent } from './map/layer-control/layer-control.component';
import { HttpClientModule } from '@angular/common/http';
import { ChartModule} from 'angular-highcharts';
import { PieComponent} from 'angular-dashboard-components/components/charts/pie/pie.component';
import { LineComponent} from 'angular-dashboard-components/components/charts/line/line.component';
import { WordCloudComponent} from 'angular-dashboard-components/components/charts/word-cloud/word-cloud.component';
import { ChartUtils} from 'angular-dashboard-components/components/utils/chart.utils';

@NgModule({
  declarations: [
    AppComponent,
    TouchscreenComponent,
    InfoscreenComponent,
    MapComponent,
    SafeHtmlPipe,
    YesNoUnknownPipe,
    LegendComponent,
    LayerControlComponent,
    LineComponent,
    PieComponent,
    WordCloudComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ChartModule,
    HttpClientModule
  ],
  providers: [
    ConfigurationService,
    LocalStorageService,
    MapService,
    TuioClient,
    ChartUtils
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
