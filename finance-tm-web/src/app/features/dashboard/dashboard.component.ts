import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TransferService } from '../transfer/services/transfer.service';
import { AccountService } from '../transfer/services/account.service';
import { Page } from '../../core/models/common';
import { TransferResponse } from '../../core/models/dto/response';

@Component({
    standalone: true,
    selector: 'app-dashboard',
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
    myAccount: string | null = null;
    isAdmin!: () => boolean;
    balance = signal<number | null>(null);
    page = signal<Page<TransferResponse> | null>(null);
    transfers = computed(() => this.page()?.content ?? []);
    loading = signal(false);
    error = signal('');

    constructor(
        private auth: AuthService,
        private transfersSvc: TransferService,
        private accountSvc: AccountService
    ) {
        this.myAccount = this.auth.accountNumber;
        this.isAdmin = this.auth.isAdmin;
        this.loadOverview();
    }

    loadOverview() {
        this.loading.set(true);
        this.error.set('');

        this.accountSvc.me().subscribe({
            next: (me) => { this.balance.set(+me.balance); this.myAccount = me.accountNumber; },
            error: () => { }
        });

        const obs = this.isAdmin()
            ? this.transfersSvc.adminList({ size: 5, sort: 'createdAt,desc' })
            : this.transfersSvc.userExtract({ size: 5, sort: 'createdAt,desc' });

        obs.subscribe({
            next: (p) => { this.page.set(p); this.loading.set(false); },
            error: (err) => { this.error.set(err?.error?.message ?? 'Falha ao carregar'); this.loading.set(false); }
        });
    }
    isSender(t: TransferResponse) { return t.fromAccount === this.myAccount; }
}
