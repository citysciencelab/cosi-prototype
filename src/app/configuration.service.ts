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

  constructor() {
    this.enableTuio = config.enableTuio;
    this.topics = config.topics;
    this.stages = config.stages;
    this.baseLayers = config.baseLayers;
    this.topicLayers = config.topicLayers;
    this.stickyLayers = config.stickyLayers;
  }
}
