import {Routes} from '@angular/router';
import {DetailsComponent} from './details.component';

export const ROUTES: Routes = [
  {
    path: '',
    component: DetailsComponent,
    children: [
      {
        path: ':eventType/:questionId',
        loadComponent: () => import('../details/details.component').then(c => c.DetailsComponent)
      }
    ]
  },
]
