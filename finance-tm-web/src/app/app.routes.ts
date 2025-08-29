import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
    { path: '', canActivate: [authGuard], loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
    { path: 'transfer', canActivate: [authGuard], loadChildren: () => import('./features/transfer/transfer.routes').then(m => m.TRANSFER_ROUTES) },
    { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
    { path: '**', redirectTo: '' }
];