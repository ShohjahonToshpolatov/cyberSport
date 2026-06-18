import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CyberPlayer, CyberTeam, UserRole } from '../models/cyber.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Tizimga kirgan foydalanuvchi holatini saqlash uchun Signal
  // null - mehmon, CyberPlayer - o'yinchi kirgan, CyberTeam - jamoa kirgan
  currentUser = signal<CyberPlayer | CyberTeam | null>(null);

  // Foydalanuvchi rolini saqlash uchun alohida signal
  currentUserRole = signal<UserRole | null>(null);

  constructor(private router: Router) {
    // Servis ishga tushganda brauzer xotirasini tekshiramiz
    this.checkLocalStorage();
  }

  // 1. Ro'yxatdan o'tish (Register) funksiyasi
  register(userData: any) {
    // Vaqtinchalik soxta ID yaratamiz
    const mockId = Math.random().toString(36).substring(2, 9);

    let completeProfile: CyberPlayer | CyberTeam;

    if (userData.role === UserRole.PLAYER) {
      completeProfile = {
        id: mockId,
        userId: mockId,
        nickname: userData.nickname,
        fullName: '',
        mainGame: userData.mainGame,
        rank: userData.rank,
        experienceYears: 0,
        pastTeams: [],
        bio: '',
        socialLinks: {},
        settings: { isLookingForTeam: true, showMessagesFromUnknown: true }
      };
    } else {
      completeProfile = {
        id: mockId,
        userId: mockId,
        teamName: userData.teamName,
        createdYear: userData.createdYear || new Date().getFullYear(),
        achievements: [],
        lookingForGames: [],
        description: '',
        membersCount: 1
      };
    }

    // Brauzer xotirasiga yozamiz
    localStorage.setItem('cyber_user', JSON.stringify(completeProfile));
    localStorage.setItem('cyber_role', userData.role);

    // Signallarni yangilaymiz (Butun dastur foydalanuvchi kirganini biladi)
    this.currentUser.set(completeProfile);
    this.currentUserRole.set(userData.role);

    console.log('Muvaffaqiyatli roʻyxatdan oʻtildi:', completeProfile);

    // Keyinchalik tegishli dashboardga yo'naltiramiz
    // this.router.navigate(['/dashboard']); 
  }

  // 2. Brauzer yopilib ochilganda ham loginni saqlab qolish
  private checkLocalStorage() {
    const savedUser = localStorage.getItem('cyber_user');
    const savedRole = localStorage.getItem('cyber_role');

    if (savedUser && savedRole) {
      this.currentUser.set(JSON.stringify(savedUser) as any);
      this.currentUserRole.set(savedRole as UserRole);
    }
  }

  // 3. Tizimdan chiqish (Log out)
  logout() {
    localStorage.removeItem('cyber_user');
    localStorage.removeItem('cyber_role');

    this.currentUser.set(null);
    this.currentUserRole.set(null);

    this.router.navigate(['/register']);
  }

  // 4. Foydalanuvchi tizimga kirganmi yoki yo'qmi tekshirish
  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }
}