import {
  ChangeDetectionStrategy,
  Component,
  inject, OnDestroy,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';
import {NavBarComponent} from '../../../shared/components/nav-bar/nav-bar.component';
import {AuthService} from '../../../core/services/auth.service';
import {Subscription} from 'rxjs';
import {UserInterface} from '../../../core/types/auth/user.interface';

@Component({
  selector: 'app-signup',
  imports: [
    ReactiveFormsModule,
    NavBarComponent,
    MatFormField,
    MatInput,
    MatLabel,
    MatError,
    MatButton,
    RouterLink
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupComponent implements OnInit, OnDestroy {
  signupForm: FormGroup = new FormGroup({});

  private fb: FormBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  private subscription = new Subscription();

  get name(): AbstractControl {
    return this.signupForm.get('name') as unknown as AbstractControl;
  }

  get email(): AbstractControl {
    return this.signupForm.get('email') as unknown as AbstractControl;
  }

  get password(): AbstractControl {
    return this.signupForm.get('password') as unknown as AbstractControl;
  }

  get confirmPassword(): AbstractControl {
    return this.signupForm.get('confirmPassword') as unknown as AbstractControl;
  }

  ngOnInit() {
    this.initSignupForm();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : {mismatch: true};
  }

  private initSignupForm() {
    this.signupForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      {validator: this.passwordMatchValidator}
    );
  }

  async onSubmit() {
    if (this.signupForm.invalid) return;
    const sub = this.authService.signUp(this.signupForm.value).subscribe((user: UserInterface) => {
      this.authService.saveUser(user);
      this.router.navigate(['/']).then();
    });
    this.subscription.add(sub);
  }
}
