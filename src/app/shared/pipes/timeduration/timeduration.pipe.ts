import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeduration'
})
export class TimeDurationPipe implements PipeTransform {

  transform(value: number, ...args: any[]): any {
    let min: number = Math.floor(value / 60);
    let sec: number = Math.floor(value - (min*60));
    return String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
  }

}
