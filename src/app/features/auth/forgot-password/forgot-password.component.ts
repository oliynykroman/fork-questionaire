import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {NavBarComponent} from "../../../shared/components/nav-bar/nav-bar.component";

@Component({
  selector: 'app-forgot-password',
    imports: [
        RouterOutlet,
        NavBarComponent
    ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {

}
