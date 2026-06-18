import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { PlayerDashboardComponent } from './components/player-dashboard/player-dashboard.component';
import { TeamDashboardComponent } from './components/team-dashboard/team-dashboard.component';

export const routes: Routes = [
    { path: '', redirectTo: 'register', pathMatch: 'full' },
    { path: 'register', component: AuthComponent },
    { path: 'player-dashboard', component: PlayerDashboardComponent },
    { path: 'team-dashboard', component: TeamDashboardComponent },
    { path: '**', redirectTo: 'register' }
];