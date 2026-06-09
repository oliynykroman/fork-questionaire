import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavBarService {
  isNavBarVisible = signal<boolean>(false);

  toggleNavBar () {
   this.isNavBarVisible.update((state)=> !state)
  }

  closeNavBar () {
    this.isNavBarVisible.update(()=> false);
  }
}
