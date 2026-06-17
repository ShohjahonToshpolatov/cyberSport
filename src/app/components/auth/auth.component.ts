import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EsportGame, UserRole } from '../../models/cyber.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  userRoles = UserRole;
  esportGames = Object.values(EsportGame);

  selectedRole: UserRole = UserRole.PLAYER;
  authForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [UserRole.PLAYER],

      nickname: ['', Validators.required],
      mainGame: [EsportGame.CS2],
      rank: [''],

      teamName: [''],
      createdYear: ['']
    });

    this.authForm.get('role')?.valueChanges.subscribe(role => {
      this.selectedRole = role;
      this.updateValidators(role);
    });
  }

  updateValidators(role: UserRole) {
    const nicknameCtrl = this.authForm.get('nickname');
    const teamNameCtrl = this.authForm.get('teamName');

    if (role === UserRole.PLAYER) {
      nicknameCtrl?.setValidators([Validators.required]);
      teamNameCtrl?.clearValidators();
    } else {
      teamNameCtrl?.setValidators([Validators.required]);
      nicknameCtrl?.clearValidators();
    }

    nicknameCtrl?.updateValueAndValidity();
    teamNameCtrl?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.authForm.valid) {
      console.log("Yuborilgan ma'lumotlar:", this.authForm.value);
    } else {
      alert("Iltimos, barcha maydonlarni to'g'ri to'ldiring!");
    }
  }
}