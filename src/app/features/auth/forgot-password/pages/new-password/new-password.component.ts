import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {AuthService} from '../../../../../core/services/auth.service';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-new-password',
  imports: [
    FormsModule,
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    MatError,
    ReactiveFormsModule,
  ],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.scss',
})
export class NewPasswordComponent implements OnInit, OnDestroy {
  passForm: FormGroup = new FormGroup({});

  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private fb: FormBuilder = inject(FormBuilder);

  private subscription = new Subscription();

  get password(): AbstractControl {
    return this.passForm.get('password') as unknown as AbstractControl;
  }

  get confirmPassword(): AbstractControl {
    return this.passForm.get('confirmPassword') as unknown as AbstractControl;
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initForm() {
    this.passForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      {validator: this.passwordMatchValidator}
    );
  }

  submit() {
    const token: string = this.route.snapshot.params['token'];
    const {password} = this.passForm.value;
    const sub = this.authService.newPasswordRecovery(token, password).subscribe(() => {
      this.router.navigate(['/sign-in']).then();
    });
    this.subscription.add(sub);
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : {mismatch: true};
  }
}
