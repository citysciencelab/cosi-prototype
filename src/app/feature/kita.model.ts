export class Kita {
  type: string; // used for type checking
  name: string;
  address: string;
  organisation: string;
  association: string;
  services: string;
  paedagogicalArea: number;
  capacity: number;

  constructor(properties: { [k: string]: any }) {
    this.type = 'Kita';
    this.name = properties['Name'];
    this.address = properties['Strasse'] + ' ' + properties['Hausnr'] + ', ' + properties['PLZ'] + ' ' + properties['Ort'];
    this.organisation = properties['Traeger'];
    this.association = properties['Spitzenver'];
    this.services = properties['Leistungsn'];
    this.paedagogicalArea = properties['paed QM'];
    this.capacity = properties['KapKindneu'];
  }
}
