import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AbstractUiControlClass} from '../../../../core/abstract/ui/controls/abstract-ui-control.class';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-textarea',
  imports: [
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    MatSuffix
  ],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextareaComponent extends AbstractUiControlClass{

}
