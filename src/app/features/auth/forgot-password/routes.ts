import {Routes} from '@angular/router';
import {ForgotPasswordComponent} from './forgot-password.component';

export const ROUTES: Routes = [
  {
    path: '',
    component: ForgotPasswordComponent,
    children: [
      {
        path: '',
        redirectTo: 'email', // Redirect to 'email' when at the root path
        pathMatch: 'full', // Ensure full path match for the redirect
      },
      {
        path: 'email',
        loadComponent: () => import('./pages/email/email.component').then(c => c.EmailComponent), // Lazy load EmailComponent
      },
      {
        path: 'new/:token',
        loadComponent: () => import('./pages/new-password/new-password.component').then(c => c.NewPasswordComponent), // Lazy load NewPasswordComponent
      },
      {
        path: 'success',
        loadComponent: () => import('./pages/success/success.component').then(c => c.SuccessComponent), // Lazy load SuccessComponent
      }
    ]
  }
];
