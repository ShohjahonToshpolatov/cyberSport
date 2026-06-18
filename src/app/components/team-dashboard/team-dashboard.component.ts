import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { UserRole, EsportGame, CyberPlayer, CyberTeam, TeamOffer } from '../../models/cyber.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-team-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './team-dashboard.component.html',
  styleUrl: './team-dashboard.component.scss'
})
export class TeamDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);

  userRole = UserRole;
  esportGames = Object.values(EsportGame);

  currentUser = this.authService.currentUser.asReadonly();
  currentUserRole = this.authService.currentUserRole.asReadonly();

  // Profile editing
  isEditingProfile = false;
  profileForm: any;

  // Search players
  searchQuery = '';
  selectedGameFilter: EsportGame | '' = '';
  selectedRankFilter = '';
  players: CyberPlayer[] = [];
  isLoadingPlayers = false;

  // Notifications
  showNotifications = false;

  // Received offers
  receivedOffers: TeamOffer[] = [];
  isLoadingOffers = false;

  // Team members
  teamMembers: any[] = [];
  isLoadingMembers = false;

  ngOnInit(): void {
    this.initProfileForm();
    this.loadPlayers();
    this.loadReceivedOffers();
    this.loadTeamMembers();
  }

  initProfileForm() {
    const user = this.currentUser();
    if (user && this.currentUserRole() === UserRole.TEAM) {
      const team = user as CyberTeam;
      this.profileForm = {
        teamName: team.teamName,
        createdYear: team.createdYear,
        description: team.description,
        website: team.website || '',
        membersCount: team.membersCount,
        achievements: team.achievements?.join(', ') || '',
        lookingForGames: team.lookingForGames || []
      };
    }
  }

  get teamUser(): CyberTeam | null {
    const user = this.currentUser();
    return user && this.currentUserRole() === UserRole.TEAM ? (user as CyberTeam) : null;
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
      achievements: this.profileForm.achievements.split(',').map((a: string) => a.trim()).filter((a: string) => a),
      lookingForGames: this.profileForm.lookingForGames
    };

    this.apiService.updateTeamProfile(updateData).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Jamoa profili muvaffaqiyatli yangilandi!');
          this.isEditingProfile = false;
          this.initProfileForm();
        }
      },
      error: (error) => {
        alert('Xatolik: ' + error.message);
      }
    });
  }

  loadPlayers() {
    this.isLoadingPlayers = true;
    const filters: any = {};
    if (this.selectedGameFilter) {
      filters.game = this.selectedGameFilter;
    }
    if (this.selectedRankFilter) {
      filters.rank = this.selectedRankFilter;
    }
    if (this.searchQuery) {
      filters.search = this.searchQuery;
    }
    filters.lookingForTeam = true;

    this.apiService.searchPlayers(filters).subscribe({
      next: (response) => {
        this.players = response.data || [];
        this.isLoadingPlayers = false;
      },
      error: (error) => {
        console.error('O\'yinchilarni yuklashda xatolik:', error);
        this.isLoadingPlayers = false;
      }
    });
  }

  onSearch() {
    this.loadPlayers();
  }

  onGameFilterChange() {
    this.loadPlayers();
  }

  onRankFilterChange() {
    this.loadPlayers();
  }

  sendOfferToPlayer(player: CyberPlayer) {
    const message = prompt(`${player.nickname} o\'yinchiga taklif yuborish uchun xabar yozing:`);
    if (!message) return;

    const offerData = {
      playerId: player.id,
      playerName: player.nickname,
      message: message,
      teamId: this.teamUser?.id,
      teamName: this.teamUser?.teamName,
      salaryOffer: 0
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

  loadReceivedOffers() {
    this.isLoadingOffers = true;
    this.apiService.getOffers().subscribe({
      next: (response) => {
        this.receivedOffers = (response.data || []).filter((offer: TeamOffer) => 
          offer.teamId === this.teamUser?.id
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
          this.loadReceivedOffers();
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

  loadTeamMembers() {
    this.isLoadingMembers = true;
    this.apiService.getTeams().subscribe({
      next: (response) => {
        this.teamMembers = response.data || [];
        this.isLoadingMembers = false;
      },
      error: (error) => {
        console.error('Jamoa a\'zolarini yuklashda xatolik:', error);
        this.isLoadingMembers = false;
      }
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  toggleGameSelection(game: EsportGame) {
    const index = this.profileForm.lookingForGames.indexOf(game);
    if (index > -1) {
      this.profileForm.lookingForGames.splice(index, 1);
    } else {
      this.profileForm.lookingForGames.push(game);
    }
  }

  isGameSelected(game: EsportGame): boolean {
    return this.profileForm.lookingForGames?.includes(game) || false;
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