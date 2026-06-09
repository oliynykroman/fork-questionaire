import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-full-page-loader',
  imports: [
    MatProgressSpinner
  ],
  templateUrl: './full-page-loader.component.html',
  styleUrl: './full-page-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FullPageLoaderComponent {

}
