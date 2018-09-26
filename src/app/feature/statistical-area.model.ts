import { Feature } from './feature.model';

export class StatisticalArea extends Feature {
  name: number;
  population: number;
  population1to6: string;

  constructor(properties: { [k: string]: any }) {
    super('StatisticalArea');
    this.name = properties['BBLOCK'];
    this.population = properties['Gesamt'];
    this.population1to6 = properties['1bis6range'];
  }
}
