import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { UserRole, EsportGame, CyberPlayer, CyberTeam, TeamOffer } from '../../models/cyber.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-player-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './player-dashboard.component.html',
  styleUrl: './player-dashboard.component.scss'
})
export class PlayerDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);

  userRole = UserRole;
  esportGames = Object.values(EsportGame);

  currentUser = this.authService.currentUser.asReadonly();
  currentUserRole = this.authService.currentUserRole.asReadonly();

  // Profile editing
  isEditingProfile = false;
  profileForm: any;

  // Search teams
  searchQuery = '';
  selectedGameFilter: EsportGame | '' = '';
  teams: CyberTeam[] = [];
  isLoadingTeams = false;

  // My offers
  myOffers: TeamOffer[] = [];
  isLoadingOffers = false;

  // Notifications
  notifications: any[] = [];
  showNotifications = false;

  ngOnInit(): void {
    this.initProfileForm();
    this.loadTeams();
    this.loadMyOffers();
  }

  initProfileForm() {
    const user = this.currentUser();
    if (user && this.currentUserRole() === UserRole.PLAYER) {
      const player = user as CyberPlayer;
      this.profileForm = {
        nickname: player.nickname,
        fullName: player.fullName,
        mainGame: player.mainGame,
        rank: player.rank,
        experienceYears: player.experienceYears,
        bio: player.bio,
        steam: player.socialLinks?.steam || '',
        discord: player.socialLinks?.discord || '',
        youtube: player.socialLinks?.youtube || '',
        isLookingForTeam: player.settings?.isLookingForTeam ?? true
      };
    }
  }

  get playerUser(): CyberPlayer | null {
    const user = this.currentUser();
    return user && this.currentUserRole() === UserRole.PLAYER ? (user as CyberPlayer) : null;
  }

  toggleProfileEdit() {
    this.isEditingProfile = !this.isEditingProfile;
    if (this.isEditingProfile) {
      this.initProfileForm();
    }
  }

  saveProfile() {
    if (!this.profileForm) return;

    const updateData = {
      ...this.profileForm,
      socialLinks: {
        steam: this.profileForm.steam,
        discord: this.profileForm.discord,
        youtube: this.profileForm.youtube
      },
      settings: {
        isLookingForTeam: this.profileForm.isLookingForTeam,
        showMessagesFromUnknown: true
      }
    };

    this.apiService.updatePlayerProfile(updateData).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Profil muvaffaqiyatli yangilandi!');
          this.isEditingProfile = false;
          this.initProfileForm();
        }
      },
      error: (error) => {
        alert('Xatolik: ' + error.message);
      }
    });
  }

  loadTeams() {
    this.isLoadingTeams = true;
    const filters: any = {};
    if (this.selectedGameFilter) {
      filters.game = this.selectedGameFilter;
    }
    if (this.searchQuery) {
      filters.search = this.searchQuery;
    }

    this.apiService.getTeams(filters).subscribe({
      next: (response) => {
        this.teams = response.data || [];
        this.isLoadingTeams = false;
      },
      error: (error) => {
        console.error('Jamoalarni yuklashda xatolik:', error);
        this.isLoadingTeams = false;
      }
    });
  }

  onSearch() {
    this.loadTeams();
  }

  onGameFilterChange() {
    this.loadTeams();
  }

  sendOffer(team: CyberTeam) {
    const message = prompt(`${team.teamName} jamoasiga taklif yuborish uchun xabar yozing:`);
    if (!message) return;

    const offerData = {
      teamId: team.id,
      teamName: team.teamName,
      message: message,
      playerId: this.playerUser?.id
    };

    this.apiService.sendOffer(offerData).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Taklif muvaffaqiyatli yuborildi!');
        }
      },
      error: (error) => {
        alert('Xatolik: ' + error.message);
      }
    });
  }

  loadMyOffers() {
    this.isLoadingOffers = true;
    this.apiService.getOffers().subscribe({
      next: (response) => {
        this.myOffers = (response.data || []).filter((offer: TeamOffer) => 
          offer.playerId === this.playerUser?.id
        );
        this.isLoadingOffers = false;
      },
      error: (error) => {
        console.error('Takliflarni yuklashda xatolik:', error);
        this.isLoadingOffers = false;
      }
    });
  }

  respondToOffer(offerId: string, status: 'accepted' | 'rejected') {
    this.apiService.respondToOffer(offerId, status).subscribe({
      next: (response) => {
        if (response.success) {
          alert(status === 'accepted' ? 'Taklif qabul qilindi!' : 'Taklif rad etildi.');
          this.loadMyOffers();
        }
      },
      error: (error) => {
        alert('Xatolik: ' + error.message);
      }
    });
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Kutilmoqda';
      case 'accepted': return 'Qabul qilindi';
      case 'rejected': return 'Rad etildi';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  logout() {
    if (confirm('Tizimdan chiqishni xohlaysizmi?')) {
      this.authService.logout();
    }
  }

  getApiUrl(): string {
    return environment.apiUrl;
  }
}