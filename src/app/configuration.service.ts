import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import config from './config.json';

@Injectable()
export class ConfigurationService {
  // Config fields are defined in typings.d.ts
  disableInfoScreen: boolean;
  noSideMenus: boolean;
  enableTuio: boolean;
  topics: Topic[];
  stages: Stage[];
  baseLayers: MapLayer[];
  topicLayers: MapLayer[];
  stickyLayers: MapLayer[];
  mapCenter: [number, number];
  mapZoom: number;
  mapMinZoom?: number;
  mapMaxZoom?: number;

  constructor(@Inject(LOCALE_ID) private locale) {
    for (const key in config) {
      if (config.hasOwnProperty(key)) {
        this[key] = config[key];
      }
    }

    this.topics = this.translate(this.topics, ['displayName']);
    this.stages = this.translate(this.stages, ['displayName']);
    this.baseLayers = this.translate(this.baseLayers, ['displayName', 'meta', 'legendHtml']);
    this.topicLayers = this.translate(this.topicLayers, ['displayName', 'meta', 'legendHtml']);
    this.stickyLayers = this.translate(this.stickyLayers, ['displayName', 'meta', 'legendHtml']);
  }

  /*
   * Apply translations of configuration values, if provided. Example:
   * layers: [{
   *   "displayName": "Default name",
   *   "displayName_de-DE": "German name"
   * }, ...]
   *
   * In this example you would call i18nService.translate(layers, ["displayName"])
   */
  translate(configItems: any[], properties: string[]) {
    return configItems.map(configItem => {
      if (this.locale !== 'en-US') {
        for (const property of properties) {
          const localizedProperty = property + '_' + this.locale;
          if (configItem[localizedProperty]) {
            configItem[property] = configItem[localizedProperty];
          }
        }
      }
      return configItem;
    });
  }
}
