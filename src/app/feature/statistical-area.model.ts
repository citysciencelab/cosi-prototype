import { Feature } from './feature.model';

export class StatisticalArea extends Feature {
  name: string;
  area: number;
  population: number;
  population1to6: number;
  kitasIn500m: number;

  constructor(properties: { [k: string]: any }) {
    super('StatisticalArea');
    this.name = properties['STGEBNEU'];
    this.population = properties['Gesamt'];
    this.population1to6 = properties['1bis6'];
    this.kitasIn500m = properties['Kita500m'];
    this.area = properties['geometry'].getArea();
  }
}
