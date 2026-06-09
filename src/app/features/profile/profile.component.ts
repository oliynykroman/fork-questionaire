import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {PageNavInterface} from '../../core/types/page-nav/nav.interface';
import {NavBarRoutesComponent} from '../../shared/components/nav-bar-routes/nav-bar-routes.component';
import {AuthService} from '../../core/services/auth.service';
import {NavBarService} from '../../core/services/nav-bar.service';

export const pageNav: PageNavInterface = {
  title: 'Опитувальник',
  isStaticNav: true,
  items: [
    {
      id: 0,
      title: 'Опитувальники',
      path: '/questionnaires',
      order: 1,
    },
    {
      id: 1,
      name: "logout",
      title: 'Вийти',
      order: 2,
    }
  ]
}

@Component({
  selector: 'app-profile',
  imports: [
    RouterOutlet,
    NavBarRoutesComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {

  navStructure = signal<PageNavInterface>(pageNav);
  private navBarService = inject(NavBarService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.navBarService.closeNavBar();
  }

  navigationEvent(_event: any) {
    this.authService.logout();
    this.router.navigate(['login']).then();
  }
}
