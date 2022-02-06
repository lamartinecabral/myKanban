import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'limit'
})
export class LimitPipe implements PipeTransform {

  transform(value: string, arg: number): unknown {
    if(typeof value != 'string') return value;
    if(value.length <= arg) return value;
    return value.substr(0,arg)+'…';
  }

}
