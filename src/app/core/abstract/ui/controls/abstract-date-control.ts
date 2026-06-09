import {AbstractUiControlClass} from './abstract-ui-control.class';
import {Directive, inject, Input, OnDestroy, output} from '@angular/core';

import * as _moment from 'moment';
import {default as _rollupMoment} from 'moment';
import {Subscription} from 'rxjs';
import {FormControl} from '@angular/forms';
import {FormControlInterface} from '../../../types/form/form-control.interface';
import {EventService} from '../../../services/event.service';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Directive()
export abstract class AbstractDateControl extends AbstractUiControlClass implements OnDestroy {

  @Input() public formControls: any;

  protected updateEvent = output<boolean>();

  protected date: FormControl = new FormControl(moment());

  protected eventService = inject(EventService);
  protected subscription: Subscription = new Subscription();

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  protected abstract patchControlValue(): string;

  protected getControlByUniqueName(uniqueName: string): FormControlInterface | null {
    const questions = this.eventService.activeTopic().questions;
    for (const q of questions) {
      const dateControl = q.controls?.find(c => c.uniqueName === uniqueName);
      if (dateControl) {
        return dateControl;
      }
    }
    return null;
  }

}


