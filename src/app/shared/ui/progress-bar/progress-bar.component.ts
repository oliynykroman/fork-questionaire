import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {MatProgressBar} from '@angular/material/progress-bar';
import {StepProgressPipe} from '../../../core/pipes/step-progress.pipe';

@Component({
  selector: 'app-progress-bar',
  imports: [
    MatProgressBar,
    StepProgressPipe
  ],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressBarComponent {
  value = input<number>(0);
  total = input<number>(0);
}
