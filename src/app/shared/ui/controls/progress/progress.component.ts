import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input, OnChanges,
  OnDestroy,
  signal, SimpleChanges
} from '@angular/core';
import {MatLabel} from '@angular/material/form-field';
import {AbstractUiControlClass} from '../../../../core/abstract/ui/controls/abstract-ui-control.class';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatSlider, MatSliderThumb} from '@angular/material/slider';
import {startWith, Subscription} from 'rxjs';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-progress',
  imports: [
    MatLabel,
    ReactiveFormsModule,
    MatSlider,
    MatSliderThumb,
    NgClass,
  ],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressComponent extends AbstractUiControlClass implements AfterViewInit, OnChanges, OnDestroy {

  @Input() public max = 100;
  @Input() public formControls: any;
  @Input() public totalSum: any = 100;

  availableMax = signal<number>(this.max);
  progressControl = new FormControl<number>(0);

  private dragInterval: any = null;
  private subscription = new Subscription();

  constructor() {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formControls'] && changes['formControls'].currentValue) {
      Promise.resolve().then(() => {
        this.resubscribeToFormControls();
      });
    }
  }

  ngAfterViewInit(): void {
    if (!!this.control.value) {
      this.patchProgressValue(this.control.value);
    } else {
      this.control.patchValue(0);
    }
    this.subToFormChanges();
  }

  ngOnDestroy() {
    if (this.dragInterval) {
      clearInterval(this.dragInterval);
    }
    this.subscription.unsubscribe();
  }

  formatLabel(value: number): string {
    return value !== null ? `${value}%` : '0%';
  }

  startDrag(_event: any) {
    this.dragInterval = setInterval(() => {
      this.progressControl.setValue(this.control.value, {emitEvent: false});
    }, 100);
  }
  endDrag(_event: any) {
  }
  change(_event: any) {
    const epsilon = 0.01;
    const maxAllowed = this.availableMax();
    if (this.dragInterval) {
      clearInterval(this.dragInterval);
      this.dragInterval = null;
    }
    this.progressControl.setValue(this.control.value, {emitEvent: false});
    setTimeout(() => {
      if ((this.control.value as number) > maxAllowed - epsilon) {
        this.control.setValue(maxAllowed);
        this.progressControl.setValue(maxAllowed, {emitEvent: false});
      }
    }, 100);
  }

  updateBlurControlsValue(_event: any) {
    const epsilon = 0.01;
    const value = this.progressControl.value;

    if (typeof value !== 'number' || isNaN(value) || value < 0) {
      this.progressControl.setValue(0, {emitEvent: false});
      this.control.patchValue(0);
      return;
    }

    if (value === null) {
      this.control.patchValue(0);
    } else {
      this.control.patchValue(value);
    }
    const maxAllowed = this.availableMax();
    if ((value as number) > maxAllowed - epsilon) {
      this.control.setValue(maxAllowed);
      this.progressControl.setValue(maxAllowed, {emitEvent: false});
    }
  }

  private patchProgressValue(value: number) {
    this.progressControl.patchValue(value);
  }

  private subToFormChanges() {
    const sub = this.formControls.valueChanges.pipe(
      startWith(this.formControls.value),
    ).subscribe(() => {
      // if (this.totalSum === 100) {
      //   let totalUsed = Object.values(this.formControls.value)
      //     .reduce((sum: number, val: any) => sum + (Math.round((parseFloat(val) || 0) * 100) / 100), 0);
      //   totalUsed = totalUsed ? totalUsed : 100;
      //   const newAvailableMax: number = Math.max(0, 100 - totalUsed + (this.control.value || 0));
      //   if (newAvailableMax) {
      //     this.triggerUpdateValue();
      //   }
      //   this.availableMax.set(Math.round(newAvailableMax * 100) / 100);
      // } else {
        this.triggerUpdateValue();
      // }
    });
    this.subscription.add(sub);
  }

  private resubscribeToFormControls(): void {
    this.subscription.unsubscribe();
    this.subscription = new Subscription();
    this.subToFormChanges();
  }
}
