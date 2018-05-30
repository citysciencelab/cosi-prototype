import { Injectable } from '@angular/core';
import config from './config.json';

@Injectable()
export class ConfigurationService {
  // Config fields are defined in typings.d.ts
  enableTuio: boolean;

  constructor() {
    this.enableTuio = config.enableTuio;
  }
}
