import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginRequest, RegisterRequest } from '../models/dto/request';
import { AuthResponse } from '../models/dto/response';
import { UserRole } from '../models';
import { ApiService } from './api.service';

const TOKEN_KEY = 'tm.jwt';
const ACC_KEY = 'tm.account';
const ROLE_KEY = 'tm.role';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

    private _token = signal<string | null>(this.isBrowser ? localStorage.getItem(TOKEN_KEY) : null);
    private _account = signal<string | null>(this.isBrowser ? localStorage.getItem(ACC_KEY) : null);
    private _role = signal<UserRole | null>(this.isBrowser ? (localStorage.getItem(ROLE_KEY) as UserRole | null) : null);

    token = computed(() => this._token());
    account = computed(() => this._account());
    role = computed(() => this._role());
    isAuthenticated = computed(() => !!this._token());
    isAdmin = computed(() => this._role() === 'ADMIN');

    get accountNumber(): string | null { return this._account(); }

    constructor(private http: HttpClient, private api: ApiService) { }

    login(req: LoginRequest) {
        return this.http.post<AuthResponse>(this.api.url('/auth/login'), req);
    }

    register(req: RegisterRequest) {
        return this.http.post<AuthResponse>(this.api.url('/auth/register'), req);
    }

    setSession(res: AuthResponse) {
        if (!this.isBrowser) return;
        localStorage.setItem(TOKEN_KEY, res.accessToken);
        if (res.accountNumber) localStorage.setItem(ACC_KEY, res.accountNumber);
        localStorage.setItem(ROLE_KEY, res.userRole);

        this._token.set(res.accessToken);
        this._account.set(res.accountNumber ?? null);
        this._role.set(res.userRole);
    }

    logout() {
        if (this.isBrowser) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(ACC_KEY);
            localStorage.removeItem(ROLE_KEY);
        }
        this._token.set(null);
        this._account.set(null);
        this._role.set(null);
    }
}
