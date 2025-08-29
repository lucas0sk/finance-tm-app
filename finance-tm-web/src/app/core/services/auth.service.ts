import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest } from '../models/dto/request';
import { AuthResponse } from '../models/dto/response';

const TOKEN_KEY = 'tm.jwt';
const ACCOUNT_KEY = 'tm.account';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private platformId = inject(PLATFORM_ID);
    private isBrowser = isPlatformBrowser(this.platformId);

    private _token = signal<string | null>(
        this.isBrowser ? localStorage.getItem(TOKEN_KEY) : null
    );

    token = computed(() => this._token());
    isAuthenticated = computed(() => !!this._token());

    constructor(private http: HttpClient) { }

    login(req: LoginRequest) {
        return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, req);
    }

    register(req: RegisterRequest) {
        return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/auth/register`, req);
    }

    setSession(res: AuthResponse) {
        if (this.isBrowser) {
            localStorage.setItem(TOKEN_KEY, res.accessToken);
            if (res.accountNumber) localStorage.setItem(ACCOUNT_KEY, res.accountNumber);
        }
        this._token.set(res.accessToken);
    }

    logout() {
        if (this.isBrowser) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(ACCOUNT_KEY);
        }
        this._token.set(null);
    }

    get accountNumber(): string | null {
        return this.isBrowser ? localStorage.getItem(ACCOUNT_KEY) : null;
    }
}
