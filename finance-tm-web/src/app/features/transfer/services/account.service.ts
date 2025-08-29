import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AccountMeResponse } from '../../../core/models/dto/response';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AccountService {
    constructor(private http: HttpClient) { }

    me() {
        return this.http.get<AccountMeResponse>(`${environment.apiBaseUrl}/accounts/me`);
    }
}
