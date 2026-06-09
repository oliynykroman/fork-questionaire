import {Component, computed, Inject, inject, input, output, PLATFORM_ID, signal} from '@angular/core';
import {isPlatformBrowser, JsonPipe, NgClass} from "@angular/common";
import {PageNavInterface} from '../../../core/types/page-nav/nav.interface';
import {InfoService} from '../../../core/services/info.service';
import {NavBarService} from '../../../core/services/nav-bar.service';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {PageNavItemInterface} from '../../../core/types/page-nav/nav-item.interface';

@Component({
  selector: 'app-nav-bar-routes',
  imports: [
    RouterLink,
    RouterLinkActive,
    NgClass
  ],
  templateUrl: './nav-bar-routes.component.html',
  styleUrl: './nav-bar-routes.component.scss'
})
export class NavBarRoutesComponent {

  navigation = input<PageNavInterface>({} as PageNavInterface);
  hideNavButton = input<boolean>(false);
  navigationClick = output<PageNavItemInterface>();

  screenWidth = signal(1200);
  isMobile = computed(() => this.screenWidth() < 769);

  protected infoService = inject(InfoService);
  protected navBarService = inject(NavBarService);

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      this.screenWidth.set(window.innerWidth);
      // Listen for window resize and update the signal
      window.addEventListener('resize', this.updateScreenWidth);
    }
  }

  toggleNavBar() {
    this.navBarService.toggleNavBar();
  }

  private updateScreenWidth = () => {
    this.screenWidth.set(window.innerWidth);
  };

  closeMenu(){
    this.toggleNavBar();
  }

  onClick(navItem:PageNavItemInterface) {
    this.navigationClick.emit(navItem);
    this.toggleNavBar();
  }

}
