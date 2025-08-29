import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { Account } from '../../../core/models/domain/account.domain';
import { User } from '../../../core/models/domain/user.domain';

@Injectable({ providedIn: 'root' })
export class AccountService {
    private _accounts = signal<Account[]>([]);
    accounts = this._accounts.asReadonly();

    constructor(private http: HttpClient, private api: ApiService) { }

    loadMyAccounts() {
        this.http.get<Account[]>(this.api.url('/accounts/me')).subscribe(res => this._accounts.set(res));
    }

    listUsers() { return this.http.get<User[]>(this.api.url('/users')); }
}