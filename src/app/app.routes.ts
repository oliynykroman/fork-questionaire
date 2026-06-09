import {Routes} from '@angular/router';
import {authGuard} from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/profile/routes').then(r => r.ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'questionnaires',
    loadChildren: () => import('./features/profile/routes').then(r => r.ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'event',
    loadChildren: () => import('./features/event/routes').then(r => r.ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/sign-in/sign-in.component').then(c => c.SignInComponent)
  },
  {path: 'sign-in', redirectTo: 'login'},
  {path: '**', redirectTo: 'questionnaires'}
];
