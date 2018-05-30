import { Feature } from './feature.model';

export class Supermarket extends Feature {
  name: string;
  operator: string;
  address: string;
  wheelchair: boolean;

  constructor (properties: { [k: string]: any }) {
    super('Supermarket');
    this.name = properties['name'] || '';
    this.operator = properties['operator'] || '';
    if (properties.hasOwnProperty('addr:street')  && properties.hasOwnProperty('addr:housenumber') &&
      properties.hasOwnProperty('addr:postcode') && properties.hasOwnProperty('addr:city')) {
      this.address = properties['addr:street'] + ' ' + properties['addr:housenumber'] + ', ' +
        properties['addr:postcode'] + ' ' + properties['addr:city'];
    } else {
      this.address = '';
    }
    this.wheelchair = properties['wheelchair'];
  }
}
