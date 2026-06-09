import {Component, effect, OnInit, signal} from '@angular/core';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import {ReactiveFormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {AbstractDateControl, MY_FORMATS} from '../../../../core/abstract/ui/controls/abstract-date-control';
import {provideMomentDateAdapter} from '@angular/material-moment-adapter';
import moment from 'moment';
import {ToMomentDatePipe} from '../../../../core/pipes/to-moment-date.pipe';
import {FormControlInterface} from '../../../../core/types/form/form-control.interface';

@Component({
  selector: 'app-date',
  imports: [
    MatFormField,
    ReactiveFormsModule,
    MatDatepickerToggle,
    MatSuffix,
    MatInput,
    MatDatepickerInput,
    MatDatepicker,
    ToMomentDatePipe
  ],
  providers: [provideMomentDateAdapter(MY_FORMATS)],
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss']
})
export class DateComponent extends AbstractDateControl implements OnInit {

  maxDate = signal<string>('');
  minDate = signal<string>('');

  constructor() {
    super();
    // update min max validation value for special filed names (startdate, enddate)
    effect(() => {
      this.eventService.currentEvent();
      this.setMinMaxDate();
    });
  }

  ngOnInit(): void {
    this.initDateValue();
    this.subToDateInputChanges();
  }

  patchControlValue(): string {
    return moment(this.date.value).format('YYYY/MM/DD').toString();
  }

  /**
   * Subscribes to changes in the internal date FormControl.
   * Patches the external control value with the formatted date.
   * If the current element is a start date, synchronizes the end date accordingly.
   * Emits an event to notify about the update.
   */
  private subToDateInputChanges() {
    const sub = this.date.valueChanges.subscribe(() => {
      this.control.patchValue(this.patchControlValue());

      if (this.element()?.uniqueName) {
        if (this.shouldSyncEndDate()) {
          this.syncEndDateWithStartDate();
        }
        this.updateEvent.emit(true);
      }
    });

    this.subscription.add(sub);
  }

  /**
   * Determines if the current control is the 'startdate'.
   * Used to conditionally trigger end date synchronization.
   */
  private shouldSyncEndDate(): boolean {
    return this.element()?.uniqueName === 'startdate';
  }

  /**
   * Synchronizes the end date control with the start date value.
   * Ensures consistent values between the start and end date fields.
   */
  private syncEndDateWithStartDate() {
    const startValue = this.formControls.controls[this.getControlByUniqueName('startdate')!.name].value || '' as any;
    this.formControls.controls[this.getControlByUniqueName('enddate')!.name].patchValue(startValue, { emitEvent: false });
    this.date.patchValue(moment(this.control.value, 'YYYY/MM/DD', true).toDate(), { emitEvent: false });
  }

  /**
   * Initializes the date FormControl with a parsed date
   * based on the external control value if present.
   */
  private initDateValue() {
    if (this.control.value) {
      this.date.patchValue(moment(this.control.value, 'YYYY/MM/DD', true).toDate());
    }
  }

  /**
   * Returns the form control configuration for 'enddate',
   * adjusting its min and max constraints based on the start date value.
   * Also updates the control value if the end date is not after the start.
   */
  private getEndDate(): FormControlInterface {
    const el = this.element();
    const startValue = this.getControlByUniqueName('startdate')?.value || '' as any;
    const isEndAfterStart = !moment(this.control.value, 'YYYY/MM/DD').isAfter(moment(startValue, 'YYYY/MM/DD'));
    if (isEndAfterStart) {
      this.control.patchValue(startValue, {emitEvent: false});
      if (this.control.value !== this.date.value) {
        this.date.patchValue(moment(this.control.value, 'YYYY/MM/DD', true).toDate(), {emitEvent: false});
      }
    }
    return {
      ...el,
      min: startValue,
      max: el.max ?? ''
    };
  }

  /**
   * Returns the form control configuration for 'startdate'.
   * Sets no constraints, since start date can be freely chosen.
   */
  private getStartDate(): FormControlInterface {
    const el = this.element();
    return {
      ...el,
      min: '',
      max: ''
    };
  }

  /**
   * Updates the component's min and max date signals
   * based on whether the current control is start or end date.
   * Delegates to getStartDate or getEndDate accordingly.
   */
  private setMinMaxDate() {
    const uniqueName = this.element()?.uniqueName;
    if (uniqueName === 'startdate') {
      const start = this.getStartDate();
      this.minDate.set(start.min as string);
      this.maxDate.set(start.max as string);
    } else {
      const end = this.getEndDate();
      this.minDate.set(end.min as string);
      this.maxDate.set(end.max as string);
    }
  }

}
