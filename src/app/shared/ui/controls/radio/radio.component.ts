import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {AbstractUiControlClass} from '../../../../core/abstract/ui/controls/abstract-ui-control.class';
import {ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-radio',
  imports: [
    MatRadioGroup,
    MatRadioButton,
    ReactiveFormsModule,
  ],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioComponent extends AbstractUiControlClass {
}
