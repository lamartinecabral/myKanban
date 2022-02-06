import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fn'
})
export class FnPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if(!value) return value;
    if(!args.length) return value;
    if(value[args[0]] === undefined)
      return value;
    if(typeof value[args[0]] !== 'function')
      return value[args[0]]
    return value[args[0]](...args.slice(1));
  }

}
