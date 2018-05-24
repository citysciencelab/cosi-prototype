import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TuioClient } from 'tuio-client';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { TouchscreenComponent } from './touchscreen/touchscreen.component';
import { InfoscreenComponent } from './infoscreen/infoscreen.component';
import { MapComponent } from './map/map.component';
import { SafeHtmlPipe } from './util/safe-html.pipe';
import { ConfigurationService } from './configuration.service';
import { MapService } from './map/map.service';
import { LocalStorageService } from './local-storage/local-storage.service';
import { LegendComponent } from './map/legend/legend.component';
import { LayerControlComponent } from './map/layer-control/layer-control.component';

@NgModule({
  declarations: [
    AppComponent,
    TouchscreenComponent,
    InfoscreenComponent,
    MapComponent,
    SafeHtmlPipe,
    LegendComponent,
    LayerControlComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    ConfigurationService,
    LocalStorageService,
    MapService,
    TuioClient
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
