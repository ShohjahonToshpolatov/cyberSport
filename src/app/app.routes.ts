import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';

export const routes: Routes = [
    { path: '', redirectTo: 'register', pathMatch: 'full' },

    { path: 'register', component: AuthComponent },

    { path: '**', redirectTo: 'register' }
];