import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'stepProgress',
  standalone: true,
})
export class StepProgressPipe implements PipeTransform {

  transform(step = 1, total = 1): number {
    return Math.min((step / total) * 100, 100);
  }
}
