import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    standalone: true,
    selector: 'app-topbar',
    templateUrl: './topbar.component.html',
    styleUrls: ['./topbar.component.scss'],
    imports: [NgIf, RouterLink, RouterLinkActive]
})
export class TopbarComponent {
    private auth = inject(AuthService);
    private router = inject(Router);

    isOpen = signal(false);

    isAuthenticated = computed(() => this.auth.isAuthenticated());
    accountNumber = computed(() => this.auth.accountNumber);

    toggle() { this.isOpen.update(v => !v); }
    close() { this.isOpen.set(false); }

    logout() {
        this.auth.logout();
        this.router.navigateByUrl('/login');
    }

    maskedAccount(): string {
        const acc = this.accountNumber();
        if (!acc || acc.length !== 10) return acc ?? '';
        return '******' + acc.slice(-4);
    }
}
