import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AbstractUiControlClass} from '../../../../core/abstract/ui/controls/abstract-ui-control.class';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-text',
  imports: [
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    MatSuffix
  ],
  templateUrl: './text.component.html',
  styleUrl: './text.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextComponent  extends AbstractUiControlClass{

}
