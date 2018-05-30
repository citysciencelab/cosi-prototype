import { Feature } from './feature.model';

export class GreenArea extends Feature {
  name: string;
  greenType: string;
  owner: string;
  area: number;

  constructor(properties: { [k: string]: any }) {
    super('GreenArea');
    this.name = properties['anlagennam'];
    this.greenType = properties['gruenart'];
    this.owner = properties['eigentum'];
    this.area = properties['flaeche_qm'];
  }
}
