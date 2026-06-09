import { Pipe, PipeTransform } from '@angular/core';
import {FormGroup} from '@angular/forms';

@Pipe({
  name: 'score',
  standalone:true,
  pure:false,
})
export class ScorePipe implements PipeTransform {

  transform(formGroud: FormGroup): string {
    const group = formGroud.get('controls') as FormGroup;

    if (!group || !group.value) return '';

    const values = Object.values(group.value);
    const total = Math.round(values.reduce((sum: number, val: any) => sum + (parseFloat(val) || 0), 0) * 10) / 10;
    return `${total}% / 100%`;
  }

}
