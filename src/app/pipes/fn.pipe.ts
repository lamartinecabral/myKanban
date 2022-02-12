import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fn'
})
export class FnPipe implements PipeTransform {

  /**
   * usage example: {{ 1.5 | fn:'toLocaleString':'pr-br':{style:'currency',currency:'BRL'} }}
   * returns: R$ 1,50
   * is equivalent to: (1.5).toLocaleString('pt-br',{style:'currency',currency:'BRL'})
   * @param value The value to be piped
   * @param args The second and subsequent arguments are the method's arguments.
   */
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
