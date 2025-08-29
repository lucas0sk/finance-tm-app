import { Routes } from '@angular/router';

export const TRANSFER_ROUTES: Routes = [
{ path: '', loadComponent: () => import('./transfer.component').then(m => m.TransferComponent) }
];