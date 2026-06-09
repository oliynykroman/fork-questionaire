import {ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit} from '@angular/core';
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
import {AuthService} from '../../../../core/services/auth.service';
import {UserInterface} from '../../../../core/types/auth/user.interface';
import {SnackBarService} from '../../../../core/services/snack-bar.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-edit',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatError,
    MatButton,
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditComponent implements OnInit, OnDestroy {
  signupForm: FormGroup = new FormGroup({});

  private fb: FormBuilder = inject(FormBuilder);
  snackBarService = inject(SnackBarService);

  private authService = inject(AuthService);

  private subscription = new Subscription();

  get name(): AbstractControl {
    return this.signupForm.get('name') as unknown as AbstractControl;
  }

  get email(): AbstractControl {
    return this.signupForm.get('email') as unknown as AbstractControl;
  }

  get oldPassword(): AbstractControl {
    return this.signupForm.get('oldPassword') as unknown as AbstractControl;
  }

  get newPassword(): AbstractControl {
    return this.signupForm.get('newPassword') as unknown as AbstractControl;
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

  passwordMatchValidator(form: FormGroup) {
    const oldPassword = form.get('oldPassword')?.value;
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (newPassword.length > 0 && oldPassword.length == 0)
      return {misingOldPassword: true};
    return newPassword === confirmPassword ? null : {mismatch: true};
  }

  private initSignupForm() {
    this.signupForm = this.fb.group(
      {
        name: [
          this.authService.user?.name || '',
          [Validators.required, Validators.minLength(3)],
        ],
        email: [
          this.authService.user?.email || '',
          [Validators.required, Validators.email],
        ],
        oldPassword: ['', [Validators.minLength(8)]],
        newPassword: ['', [Validators.minLength(8)]],
        confirmPassword: [''],
      },
      {validator: this.passwordMatchValidator}
    );
  }

  updateUser() {
    if (this.signupForm.invalid) return;
    const sub = this.authService.update(this.signupForm.value).subscribe(
      (user: UserInterface) => {
        this.authService.saveUser(user);
        this.signupForm.reset();
        this.snackBarService.openSnackBar(`User updated successfully`);
      });
    this.subscription.add(sub);
  }
}
