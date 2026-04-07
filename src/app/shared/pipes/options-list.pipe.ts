import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'optionsList',
  standalone: true
})
export class OptionsListPipe implements PipeTransform {
  transform(options: any[]): string {
    if (!options || !options.length) return '';
    return options.map(o => o.name).join(', ');
  }
}
