import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Inject,
  inject,
  input, output,
  PLATFORM_ID,
  signal
} from '@angular/core';
import {InfoService} from '../../../core/services/info.service';
import {isPlatformBrowser, LowerCasePipe, NgClass} from '@angular/common';
import {NavBarService} from '../../../core/services/nav-bar.service';
import {EventNavInterface} from '../../../core/types/page-nav/nav.interface';

@Component({
  selector: 'app-nav-bar',
  imports: [
    NgClass,
    LowerCasePipe
  ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarComponent {

  navigation = input<EventNavInterface>({} as EventNavInterface);
  hideNavButton = input<boolean>(false);
  navigationClick = output<any>();

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

  onClick(navItem:any) {
    this.toggleNavBar();
    this.navigationClick.emit(navItem);
  }

}
