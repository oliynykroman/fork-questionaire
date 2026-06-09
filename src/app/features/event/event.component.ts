import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-event',
  imports: [
    RouterOutlet,
  ],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventComponent {

}
