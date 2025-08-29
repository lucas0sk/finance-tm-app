import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ScheduleTransferRequest } from '../../../core/models/dto/request';
import { TransferResponse } from '../../../core/models/dto/response';
import { Page } from '../../../core/models/common';

@Injectable({ providedIn: 'root' })
export class TransferService {
    private base = `${environment.apiBaseUrl}/transfers`;

    constructor(private http: HttpClient) { }

    schedule(body: ScheduleTransferRequest) {
        return this.http.post<TransferResponse>(`${this.base}/schedule`, body);
    }

    userExtract(params: { page?: number; size?: number; sort?: string; status?: string; startDate?: string; endDate?: string }) {
        let p = new HttpParams();
        Object.entries(params || {}).forEach(([k, v]) => { if (v != null) p = p.set(k, String(v)); });
        return this.http.get<Page<TransferResponse>>(`${this.base}/user/extract`, { params: p });
    }

    adminList(params: { page?: number; size?: number; sort?: string; fromAccount?: string; toAccount?: string; status?: string; startDate?: string; endDate?: string }) {
        let p = new HttpParams();
        Object.entries(params || {}).forEach(([k, v]) => { if (v != null) p = p.set(k, String(v)); });
        return this.http.get<Page<TransferResponse>>(`${this.base}`, { params: p });
    }
}
