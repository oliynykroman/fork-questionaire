import {Routes} from '@angular/router';
import {ProfileComponent} from './profile.component';

export const ROUTES: Routes = [
  {
    path: '',
    component: ProfileComponent,
    children: [
      {
        path:'',
        pathMatch:'full',
        loadComponent: ()=> import('./pages/my-events/my-events.component').then(c => c.MyEventsComponent),
      },
    ]
  }
]
