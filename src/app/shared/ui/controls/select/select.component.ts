import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {AbstractUiControlClass} from '../../../../core/abstract/ui/controls/abstract-ui-control.class';
import {ReactiveFormsModule} from '@angular/forms';
import {MatOption, MatSelect} from '@angular/material/select';

@Component({
  selector: 'app-select',
  imports: [
    MatFormField,
    MatSuffix,
    ReactiveFormsModule,
    MatSelect,
    MatOption
  ],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent extends AbstractUiControlClass {
}
