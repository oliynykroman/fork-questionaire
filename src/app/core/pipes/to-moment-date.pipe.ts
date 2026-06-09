import { Pipe, PipeTransform } from '@angular/core';
import * as _moment from 'moment';
import {default as _rollupMoment} from 'moment/moment';
const moment = _rollupMoment || _moment;
@Pipe({
  name: 'toMomentDate'
})
export class ToMomentDatePipe implements PipeTransform {

  transform(date: any, format = 'YYYY/MM/DD' ): Date {
    return moment(date, format).toDate();
  }

}
