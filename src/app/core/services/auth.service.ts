import {inject, Injectable, PLATFORM_ID, signal} from '@angular/core';
import {UserInterface} from '../types/auth/user.interface';
import {isPlatformBrowser} from '@angular/common';
import {Observable, of} from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthService {
  private LS_USER_KEY = 'LS_USER_KEY';
  private platformId = inject(PLATFORM_ID);
  private readonly mockUser: UserInterface = {
    id: 1,
    name: 'Тестовий користувач',
    email: 'test@example.com',
    token: 'mock-session-token'
  };

  isLoggedIn = signal(
    this.isLocalStorageAvailable() && !!localStorage.getItem(this.LS_USER_KEY)
  );

  get user(): UserInterface | null {
    if (this.isLocalStorageAvailable()) {
      return JSON.parse(localStorage.getItem(this.LS_USER_KEY) || 'null');
    }
    return null;
  }

  isAdmin = signal(false);

  login(data: { email: string, password: string }):Observable<UserInterface> {
    return of({
      ...this.mockUser,
      email: data.email || this.mockUser.email
    });
  }

  signUp(data: { email: string, password: string, name: string, confirmPassword: string }):Observable<UserInterface> {
    return of({...this.mockUser, email: data.email, name: data.name});
  }

  update(data: { email: string, password: string, name: string, confirmPassword: string }):Observable<UserInterface> {
    return of({...this.mockUser, email: data.email, name: data.name});
  }

  sendForgotPasswordEmail(email: string):Observable<any> {
    return of({email});
  }

  newPasswordRecovery(token: string, password: string): Observable<any> {
    return of({token, password});
  }

  logout() {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(this.LS_USER_KEY);
    }
    this.isAdmin.set(false);
    this.isLoggedIn.set(false);
  }

  saveUser(user: UserInterface) {
    this.setUserAdmin(user);
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(this.LS_USER_KEY, JSON.stringify(user));
      this.isLoggedIn.set(true);
    }
  }

  private isLocalStorageAvailable(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private setUserAdmin(user: UserInterface) {
    this.isAdmin.set(false);
  }
}
