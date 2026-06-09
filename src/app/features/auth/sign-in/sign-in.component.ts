import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {NavBarComponent} from '../../../shared/components/nav-bar/nav-bar.component';
import {Router} from '@angular/router';
import {AuthService} from '../../../core/services/auth.service';
import {UserInterface} from '../../../core/types/auth/user.interface';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-signin',
  imports: [
    FormsModule,
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    NavBarComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent implements OnInit, OnDestroy {
  signInForm: FormGroup = new FormGroup({});

  private authService = inject(AuthService);

  private router = inject(Router);

  private fb: FormBuilder = inject(FormBuilder);

  private subscription = new Subscription();

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  submit() {
    const sub = this.authService.login(this.signInForm.value).subscribe((user: UserInterface) => {
      this.authService.saveUser(user);
      this.router.navigate(['/questionnaires']).then();
    });

    this.subscription.add(sub);
  }

  private initForm() {
    this.signInForm = this.fb.group({
      email: this.fb.control("test@example.com", [Validators.required, Validators.email]),
      password: this.fb.control("password", [Validators.required])
    });
  }
}
