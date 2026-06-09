import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {InfoService} from './core/services/info.service';
import {NavBarService} from './core/services/nav-bar.service';
import {filter, Subscription} from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {

  private infoService = inject(InfoService);
  private router = inject(Router);
  private navBarService = inject(NavBarService);
  private subscriptions = new Subscription();

  ngOnInit() {
    this.infoService.getData();
    this.closeMenu();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private closeMenu() {
    const sub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
    ).subscribe(() => {
      this.navBarService.closeNavBar()
    });
    this.subscriptions.add(sub);
  }
}
