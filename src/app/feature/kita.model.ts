export class Kita {
  type: string; // used for type checking
  name: string;
  street: string;
  address: string;
  zipCode: string;
  neighborhood: string;
  organisation: string;
  association: string;
  website: string;
  contact: string;
  eMail: string;

  constructor(properties: { [k: string]: any }) {
    this.type = 'Kita';
    this.address = properties['Hausnr'];
    this.street = properties['Strasse2'];
    this.name = properties['Name'];
    this.contact = properties['Ansprechpa'];
    this.zipCode = properties['PLZ2'];
    this.eMail = properties['E-Mail'];
    this.neighborhood = properties['Stadtteil'];
    this.organisation = properties['Traeger'];
    this.association = properties['Spitzenver'];
    this.website = properties['Informatio'];
  }
}
