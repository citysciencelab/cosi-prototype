import { Pipe, PipeTransform, Inject, LOCALE_ID } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

let yes: string;
let no: string;
let unknown: string;

@Pipe({
  name: 'yesNoUnknown',
})
export class YesNoUnknownPipe implements PipeTransform {

  constructor(@Inject(LOCALE_ID) private locale) {
    switch (locale) {
      case 'de-DE':
        yes = 'Ja';
        no = 'Nein';
        unknown = 'Unbekannt';
        break;
      default:
        yes = 'Yes';
        no = 'No';
        unknown = 'Unknown';
    }
  }

  transform(value) {
    if (typeof value === 'boolean') {
      return value === true ? yes : value === false ? no : unknown;
    } else if (typeof value === 'string') {
      return value === 'yes' ? yes : value === 'no' ? no : unknown;
    }
    return unknown;
  }

}
