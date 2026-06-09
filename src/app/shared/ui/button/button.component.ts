import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {RouterLink} from '@angular/router';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-button',
  imports: [
    RouterLink,
    NgClass
  ],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  background = input<'black' | 'white' | 'outline'>('outline');
  title = input<string>('');
  link = input<any>();
  buttonClick = output();

  onClick() {
      this.buttonClick.emit();
  }
}
