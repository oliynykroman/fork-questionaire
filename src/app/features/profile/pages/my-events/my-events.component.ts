import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import {EventComponent} from '../../../../shared/components/event/event.component';
import {FullPageLoaderComponent} from '../../../../shared/ui/full-page-loader/full-page-loader.component';
import {AbstractMyEventsComponent} from '../../../../core/abstract/features/profile/pages/my-events-component';
import {ButtonComponent} from '../../../../shared/ui/button/button.component';

@Component({
  selector: 'app-my-events',
  imports: [EventComponent, FullPageLoaderComponent, ButtonComponent],
  templateUrl: './my-events.component.html',
  styleUrl: './my-events.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyEventsComponent extends AbstractMyEventsComponent {
}
