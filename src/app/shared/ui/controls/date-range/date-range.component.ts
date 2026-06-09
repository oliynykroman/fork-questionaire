import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from '@angular/material/datepicker';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {provideMomentDateAdapter} from '@angular/material-moment-adapter';
import {AbstractDateControl, MY_FORMATS} from '../../../../core/abstract/ui/controls/abstract-date-control';
import moment from 'moment';
import {tap} from 'rxjs';

@Component({
  selector: 'app-date-range',
  imports: [
    FormsModule,
    MatDateRangeInput,
    MatDateRangePicker,
    MatDatepickerToggle,
    MatFormField,
    MatSuffix,
    ReactiveFormsModule,
    MatStartDate,
    MatEndDate,
  ],
  providers: [provideMomentDateAdapter(MY_FORMATS)],
  templateUrl: './date-range.component.html',
  styleUrl: './date-range.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateRangeComponent extends AbstractDateControl implements OnInit {

  protected patchControlValue(): string {
    return this.control ? this.control.value : '';
  }

  get start(): AbstractControl {
    return this.range.controls['start'] as AbstractControl;
  }

  get end(): AbstractControl {
    return this.range.controls['end'] as AbstractControl;
  }

  ngOnInit() {
    this.subsToFormGroupChange();
    this.parseDateFromElementControl();
  }


  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  private subsToFormGroupChange() {
    const sub = this.range.valueChanges.pipe(
      tap(() => {
        this.parseToDateRangeString(this.start.value, this.end.value);
      })
    ).subscribe();
    this.subscription.add(sub);
  }

  private parseDateFromElementControl() {
    if (!this.control) {
      return;
    }
    const parts = this.control.value.split('-');
    if (parts.length === 2) {
      const [startDateStr, endDateStr] = parts;
      this.parsFromDateRangeString(startDateStr, endDateStr);
    }
  }

  private parsFromDateRangeString(start: string, end: string) {
    const startDate = moment(start, 'YYYY/MM/DD', true);
    const endDate = moment(end, 'YYYY/MM/DD', true);

    if (!startDate.isValid() || !endDate.isValid()) {
      return;
    }

    this.start.patchValue(startDate.toDate());
    this.end.patchValue(endDate.toDate());
  }

  private parseToDateRangeString(startDateStr: string, endDateStr: string) {
    const start = moment(startDateStr).format('YYYY/MM/DD').toString();
    const end = moment(endDateStr).format('YYYY/MM/DD').toString();
    const result = `${start}-${end}`;
    if (this.control) {
      this.control.patchValue(result);
    }
  }

}
