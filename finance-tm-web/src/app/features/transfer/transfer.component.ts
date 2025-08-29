import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TransferService } from './services/transfer.service';
import { ScheduleTransferRequest } from '../../core/models/dto/request';
import { Page } from '../../core/models/common';
import { TransferResponse } from '../../core/models/dto/response';
import { AuthService } from '../../core/services/auth.service';
import { AccountService } from './services/account.service';
import { ToastService } from '../../shared/ui/toast/toasts.service';

type Quote = {
    feeFixed: number;
    feePercent: number;
    feeAmount: number;
    totalAmount: number;
};

@Component({
    standalone: true,
    selector: 'app-transfer',
    imports: [CommonModule, FormsModule],
    templateUrl: './transfer.component.html',
    styleUrls: ['./transfer.component.scss']
})
export class TransferComponent {
    fromAccount = '';
    toAccount = '';
    amount = 0;
    transferDate = '';

    loading = false;
    error = '';
    success = false;

    isAdmin!: () => boolean;
    myAccount: string | null = null;
    balance = signal<number | null>(null);
    todayStr = this.toDateOnlyString(new Date());

    page = signal<Page<TransferResponse> | null>(null);
    transfers = computed(() => this.page()?.content ?? []);

    showConfirm = signal(false);

    q: Quote = { feeFixed: 0, feePercent: 0, feeAmount: 0, totalAmount: 0 };

    constructor(
        private service: TransferService,
        private auth: AuthService,
        private accountSvc: AccountService,
        private toast: ToastService
    ) {
        this.myAccount = this.auth.accountNumber;
        this.isAdmin = this.auth.isAdmin;
        if (!this.isAdmin && this.myAccount) this.fromAccount = this.myAccount;
        this.refreshBalance();
        this.loadExtract();

        this.updateQuote();
    }

    private toDateOnlyString(d: Date): string {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    private round2(n: number) {
        return Math.round((n + Number.EPSILON) * 100) / 100;
    }

    private daysBetweenToday(dateStr: string): number {
        if (!dateStr) return 0;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const dt = new Date(dateStr + 'T00:00:00');
        const diff = (dt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return Math.max(0, Math.round(diff));
    }

    private selectFeeRule(days: number): { fixed: number; percent: number } {
        if (days === 0) return { fixed: 3.00, percent: 2.50 };
        if (days <= 10) return { fixed: 12.00, percent: 2.00 };
        if (days <= 20) return { fixed: 0.00, percent: 1.50 };
        return { fixed: 0.00, percent: 1.00 };
    }

    updateQuote() {
        const amount = Number(this.amount) || 0;
        const days = this.daysBetweenToday(this.transferDate);
        const rule = this.selectFeeRule(days);

        const feeAmount = this.round2(rule.fixed + amount * (rule.percent / 100));
        const total = this.round2(amount + feeAmount);

        this.q = {
            feeFixed: rule.fixed,
            feePercent: rule.percent,
            feeAmount,
            totalAmount: total
        };
    }

    get insufficient(): boolean {
        const isSender = this.fromAccount && this.myAccount && (this.fromAccount === this.myAccount);
        if (!isSender) return false;
        const bal = this.balance();
        if (bal == null) return false;
        return this.q.totalAmount > bal;
    }

    refreshBalance() {
        this.accountSvc.me().subscribe({
            next: (me) => {
                this.balance.set(+me.balance);
                if (!this.myAccount) this.myAccount = me.accountNumber;
                if (!this.isAdmin && this.myAccount) this.fromAccount = this.myAccount;
            },
            error: (err) => console.warn('Falha ao carregar /accounts/me', err)
        });
    }

    loadExtract(page = 0) {
        const params = { page, size: 10, sort: 'createdAt,desc' };

        const obs = this.isAdmin()
            ? this.service.adminList(params)    
            : this.service.userExtract(params); 

        obs.subscribe(p => this.page.set(p));
    }

    private fmt(n: number) { return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

    openCheckout(f: NgForm) {
        this.error = '';
        this.updateQuote();

        if (!f.valid) return;
        if (this.insufficient) {
            this.toast.error('Saldo insuficiente', `Você precisa de R$ ${this.fmt(this.q.totalAmount)} e seu saldo é R$ ${this.fmt(this.balance() ?? 0)}.`);
            return;
        }
        this.showConfirm.set(true);
    }


    submit() {
        this.loading = true;
        this.error = '';
        this.success = false;

        const req: ScheduleTransferRequest = {
            requestId: crypto.randomUUID(),
            fromAccount: this.fromAccount,
            toAccount: this.toAccount,
            amount: Number(this.amount),
            transferDate: this.transferDate
        };

        this.service.schedule(req).subscribe({
            next: () => {
                this.success = true;
                this.loading = false;
                this.showConfirm.set(false);
                this.refreshBalance();
                this.loadExtract(0);

                const youAreSender = this.fromAccount === this.myAccount;
                const msg = youAreSender
                    ? `Total debitado: R$ ${this.fmt(this.q.totalAmount)} (valor R$ ${this.fmt(+this.amount)} + taxas R$ ${this.fmt(this.q.feeAmount)}).`
                    : `Valor recebido: R$ ${this.fmt(+this.amount)}.`;
                this.toast.success('Transferência agendada', msg);
            },
            error: (err) => {
                this.loading = false;
                this.showConfirm.set(false);
                const msg = err?.error?.message ?? 'Erro ao agendar.';
                this.error = msg;
                this.toast.error('Falha ao agendar', msg);
            }
        });
    }
    cancelCheckout() { this.showConfirm.set(false); }
}
