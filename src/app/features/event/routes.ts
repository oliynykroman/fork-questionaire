import {Routes} from '@angular/router';
import {EventComponent} from './event.component';

export const ROUTES: Routes = [
  {
    path: '',
    component: EventComponent,
    children: [
      {
        path: ':eventId',
        loadChildren: () => import('./pages/details/routes').then(r => r.ROUTES),
      },
    ]
  }
]
