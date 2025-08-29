import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransferService } from './services/transfer.service';
import { ScheduleTransferRequest } from '../../core/models/dto/request';
import { Page } from '../../core/models/common';
import { TransferResponse } from '../../core/models/dto/response';
import { AuthService } from '../../core/services/auth.service';

@Component({
    standalone: true,
    selector: 'app-transfer',
    imports: [CommonModule, FormsModule],
    templateUrl: './transfer.component.html',
    styleUrls: ['./transfer.component.scss']
})
export class TransferComponent {
    private auth = inject(AuthService);
    private service = inject(TransferService);

    fromAccount = '';
    toAccount = '';
    amount = 0;
    transferDate = '';

    loading = false;
    error = '';
    success = false;

    isAdmin = false;
    myAccount = this.auth.accountNumber;
    todayStr = this.toDateOnlyString(new Date());

    page = signal<Page<TransferResponse> | null>(null);
    transfers = computed(() => this.page()?.content ?? []);

    constructor() {
        if (!this.isAdmin && this.myAccount) this.fromAccount = this.myAccount;
        this.loadExtract();
    }

    submit() {
        this.loading = true; this.error = ''; this.success = false;
        const req: ScheduleTransferRequest = {
            requestId: crypto.randomUUID(),
            fromAccount: this.fromAccount,
            toAccount: this.toAccount,
            amount: Number(this.amount),
            transferDate: this.transferDate
        };
        this.service.schedule(req).subscribe({
            next: () => { this.success = true; this.loading = false; this.loadExtract(0); },
            error: (err) => { this.error = err?.error?.message ?? 'Erro ao agendar'; this.loading = false; }
        });
    }

    loadExtract(page = 0) {
        this.service.userExtract({ page, size: 10, sort: 'createdAt,desc' })
            .subscribe(p => this.page.set(p));
    }

    goTo(page: number) { this.loadExtract(page); }

    private toDateOnlyString(d: Date): string {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
}
