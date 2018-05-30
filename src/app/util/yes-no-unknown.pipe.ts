import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'yesNoUnknown',
})
export class YesNoUnknownPipe implements PipeTransform {

  constructor() {}

  transform(value) {
    if (typeof value === 'boolean') {
      return value === true ? 'Ja' : value === false ? 'Nein' : 'Unbekannt';
    } else if (typeof value === 'string') {
      return value === 'yes' ? 'Ja' : value === 'no' ? 'Nein' : 'Unbekannt';
    }
    return 'Unbekannt';
  }

}
