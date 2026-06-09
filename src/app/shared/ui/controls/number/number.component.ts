import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AbstractUiControlClass} from '../../../../core/abstract/ui/controls/abstract-ui-control.class';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-number',
  imports: [
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    MatSuffix
  ],
  templateUrl: './number.component.html',
  styleUrl: './number.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumberComponent extends AbstractUiControlClass{

}
