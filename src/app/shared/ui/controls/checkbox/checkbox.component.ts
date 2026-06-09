import {ChangeDetectionStrategy, Component, output} from '@angular/core';
import {MatCheckbox} from '@angular/material/checkbox';
import {ReactiveFormsModule} from '@angular/forms';
import {AbstractUiControlClass} from '../../../../core/abstract/ui/controls/abstract-ui-control.class';

@Component({
  selector: 'app-checkbox',
  imports: [
    MatCheckbox,
    ReactiveFormsModule,
  ],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent extends AbstractUiControlClass {

  updateCheckbox = output<string>();

  updateValue() {
    this.triggerUpdateValue();
    this.updateCheckbox.emit(this.element().name);
  }
}
