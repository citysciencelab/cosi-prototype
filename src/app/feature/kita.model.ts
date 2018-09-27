import { Feature } from './feature.model';

export class Kita extends Feature {
  name: string;
  address: string;
  organisation: string;
  association: string;
  services: string;
  paedagogicalArea: number;
  capacity: number;

  constructor(properties: { [k: string]: any }) {
    super('Kita');
    this.name = properties['Name'];
    let addressPart1 = properties['Strasse'] || '';
    if (properties['Hausnr']) {
      addressPart1 += ' ' + properties['Hausnr'];
    }
    let addressPart2 = properties['Ort'] || '';
    if (properties['PLZ']) {
      addressPart2 = properties['PLZ'] + ' ' + addressPart2;
    }
    this.address = addressPart1 && addressPart2 ? addressPart1 + ', ' + addressPart2 : addressPart1 + addressPart2;
    this.organisation = properties['Traeger'];
    this.association = properties['Spitzenver'];
    this.services = properties['Leistungsn'];
    this.paedagogicalArea = properties['paed QM'];
    this.capacity = properties['KapKindneu'];
  }
}
