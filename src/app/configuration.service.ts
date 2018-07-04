import { Injectable } from '@angular/core';
import config from './config.json';

@Injectable()
export class ConfigurationService {
  // Config fields are defined in typings.d.ts
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

  constructor() {
    for (const key in config) {
      if (config.hasOwnProperty(key)) {
        this[key] = config[key];
      }
    }
  }
}
